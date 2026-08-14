import { createFullSlug } from "./slug.js";
import { ORG_INFO, SEO, CONTACT, URLS } from "../constants.js";
import { parseRecurrence, parseTimeOfDay, parseDurationToISO, toIstIso, addIsoDuration, nextWeekdayDate, IST_OFFSET } from "./date.js";

const CATEGORY_TO_SCHEMA_TYPE = {
  workshop: "EducationEvent",
  performance: "TheaterEvent",
  corporate: "EducationEvent",
  "online jam": "Event",
  "in-person jam": "Event",
  "outdoor jam": "Event",
};

function absoluteUrl(path) {
  return new URL(path, SEO.SITE_URL).href;
}

function stripHtmlTags(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export function normalizePrice(priceString) {
  if (!priceString) return null;

  const pwywMatch = priceString.match(/pay\s+what\s+you\s+can/i);
  if (pwywMatch) {
    const numMatch = priceString.match(/₹\s*(\d+)/);
    const suggestedPrice = numMatch ? parseInt(numMatch[1]) : 0;
    return {
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: 0,
        price: suggestedPrice,
        priceCurrency: "INR",
        valueAddedTaxIncluded: true,
      },
    };
  }

  const match = priceString.match(/₹\s*([\d,]+(?:\.\d+)?)/);
  if (match) {
    const price = match[1].replace(/,/g, "");
    return { price, priceCurrency: "INR" };
  }

  return null;
}

export function buildEventLocation(event) {
  const isOnline = /zoom|online|virtual/i.test(event.venue || "");

  if (isOnline) {
    return {
      "@type": "VirtualLocation",
      url: URLS.REGISTRATION_FORM,
    };
  }

  const venueAddress = event.venueAddress || "";
  const postalCodeMatch = venueAddress.match(/\b(\d{6})\b/);

  let address = {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressRegion: "KA",
    addressCountry: "IN",
  };

  if (postalCodeMatch) {
    address.postalCode = postalCodeMatch[1];
    const beforePostal = venueAddress.substring(0, postalCodeMatch.index).trim();
    if (beforePostal) {
      address.streetAddress = beforePostal.replace(/,\s*bangalore\s*$/i, "").trim();
    }
  } else if (venueAddress) {
    const cleaned = venueAddress.replace(/\s*\([^)]*provided.*?\)\s*$/i, "").trim();
    if (cleaned) {
      address.streetAddress = cleaned;
    }
  }

  return {
    "@type": "Place",
    name: event.venue || "Bengaluru",
    address,
  };
}

export function resolveEventDates(event) {
  const recurrence = parseRecurrence(event.date);
  let startDate, endDate, isRecurring, isPast;

  if (recurrence) {
    const nextDate = nextWeekdayDate(recurrence.weekday, { includeToday: true });
    startDate = toIstIso(nextDate, event.time);
    isRecurring = true;
    isPast = false;
  } else {
    startDate = toIstIso(event.date, event.time);
    isRecurring = false;
    isPast = startDate ? new Date(startDate) < new Date() : false;
  }

  const durationIso = parseDurationToISO(event.duration);
  if (durationIso && startDate) {
    endDate = addIsoDuration(startDate, durationIso);
  }

  return { startDate, endDate, isRecurring, isPast, recurrence };
}

export function buildOrganization() {
  const sameAsUrls = Object.values(URLS.SOCIAL_MEDIA).filter((u) => u && u !== "#");

  return {
    "@type": "PerformingGroup",
    "@id": absoluteUrl("/#organization"),
    name: ORG_INFO.NAME,
    url: SEO.SITE_URL,
    logo: absoluteUrl(SEO.DEFAULT_IMAGE),
    description: ORG_INFO.DESCRIPTION,
    foundingDate: String(ORG_INFO.FOUNDED_YEAR),
    email: CONTACT.EMAIL,
    telephone: CONTACT.PHONE,
    areaServed: {
      "@type": "City",
      name: "Bengaluru",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "KA",
      addressCountry: "IN",
    },
    ...(sameAsUrls.length > 0 && { sameAs: sameAsUrls }),
  };
}

export function buildWebSite() {
  return {
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: SEO.SITE_URL,
    name: ORG_INFO.NAME,
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}

export function buildSiteSchema() {
  return [buildOrganization(), buildWebSite()];
}

export function buildEventSchema(event, { url }) {
  const { startDate, endDate, isRecurring, isPast, recurrence } = resolveEventDates(event);
  if (!startDate) return null;

  const schemaType = CATEGORY_TO_SCHEMA_TYPE[event.category] || "Event";
  const price = normalizePrice(event.price);
  const isOnline = /zoom|online|virtual/i.test(event.venue || "");

  const schema = {
    "@type": schemaType,
    "@id": url + "#event",
    name: event.title,
    description: stripHtmlTags(event.description),
    startDate,
    ...(endDate && { endDate }),
    ...(isOnline && { eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode" }),
    ...(!isOnline && { eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode" }),
    location: buildEventLocation(event),
    organizer: { "@id": absoluteUrl("/#organization") },
    ...(event.instructor && event.instructor !== "Rotating Hosts" && event.instructor !== "Community Run" && {
      performer: {
        "@type": "Person",
        name: event.instructor,
      },
    }),
    eventStatus: "https://schema.org/EventScheduled",
    offers: {
      "@type": "Offer",
      url: URLS.REGISTRATION_FORM,
      ...(price?.price && { price: price.price }),
      ...(price?.priceCurrency && { priceCurrency: price.priceCurrency }),
      ...(price?.priceSpecification && { priceSpecification: price.priceSpecification }),
      availability: event.booked >= event.spots ? "https://schema.org/SoldOut" : "https://schema.org/PreOrder",
      ...(isPast && { validThrough: startDate }),
    },
    ...(event.spots && { maximumAttendeeCapacity: event.spots }),
    inLanguage: "en-IN",
    ...(isRecurring &&
      recurrence && {
        eventSchedule: {
          "@type": "Schedule",
          repeatFrequency: "P1W",
          byDay: recurrence.byDay,
          startTime: parseTimeOfDay(event.time)
            ? `${parseTimeOfDay(event.time).hours}:${parseTimeOfDay(event.time).minutes}`
            : undefined,
          scheduleTimezone: "Asia/Kolkata",
        },
      }),
  };

  return schema;
}

export function buildBlogPostingSchema(article, { url }) {
  if (!article.date) return null;

  return {
    "@type": "BlogPosting",
    "@id": url + "#article",
    headline: article.title.substring(0, 110),
    description: stripHtmlTags(article.excerpt),
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Person",
      name: article.author,
      description: article.authorBio,
    },
    publisher: { "@id": absoluteUrl("/#organization") },
    mainEntityOfPage: url,
    keywords: article.tags.join(", "),
    articleSection: article.category,
    inLanguage: "en-IN",
  };
}

export function buildBreadcrumb(trail) {
  if (!trail || trail.length === 0) return null;

  const itemListElement = trail.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.url),
  }));

  return {
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

export function buildItemList(items, { name, url }) {
  if (!items || items.length === 0) return null;

  return {
    "@type": "ItemList",
    name,
    url: absoluteUrl(url),
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.url),
    })),
  };
}

export function buildFaqSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
