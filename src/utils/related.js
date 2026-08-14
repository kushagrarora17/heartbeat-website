// Relatedness scoring for cross-linking events and articles
// Maps incompatible category vocabularies to shared canonical topics

const CATEGORY_TAXONOMY = {
  // Events -> topics
  workshop: ["learning", "technique"],
  performance: ["performance", "community"],
  corporate: ["business", "learning"],
  "online jam": ["jam", "community", "online"],
  "in-person jam": ["jam", "community"],
  "outdoor jam": ["jam", "community"],
  // Articles -> topics
  technique: ["technique", "learning"],
  beginner: ["learning", "beginner"],
  "personal-growth": ["growth", "learning"],
  business: ["business"],
  community: ["community", "jam"],
  history: ["history", "community"],
};

const LEVEL_GROUPS = {
  beginner: "beginner",
  "all levels": "beginner",
  all: "beginner",
  intermediate: "advanced",
  advanced: "advanced",
};

const TAG_TOPICS = {
  basics: "beginner",
  "yes-and": "beginner",
  "first-time": "beginner",
};

export function normalizeCategory(raw) {
  return CATEGORY_TAXONOMY[raw] || [raw];
}

export function topicsFor(item, kind) {
  const topics = new Set();
  const category = kind === "event" ? item.category : item.category;
  normalizeCategory(category).forEach((t) => topics.add(t));

  if (item.level) {
    const levelTopic = LEVEL_GROUPS[item.level];
    if (levelTopic) topics.add(levelTopic);
  }

  if (kind === "article" && item.tags) {
    item.tags.forEach((tag) => {
      const topic = TAG_TOPICS[tag] || tag;
      topics.add(topic);
    });
  }

  return topics;
}

export function scoreRelatedness(a, aKind, b, bKind, { now = new Date() } = {}) {
  if (a.id === b.id && aKind === bKind) return -Infinity;

  let score = 0;

  const aTopics = topicsFor(a, aKind);
  const bTopics = topicsFor(b, bKind);

  for (const topic of aTopics) {
    if (bTopics.has(topic)) score += 3;
  }

  if (aKind === "article" && bKind === "event") {
    const text = (b.title + " " + b.description).toLowerCase();
    a.tags?.forEach((tag) => {
      if (text.includes(tag.toLowerCase())) score += 2;
    });
  } else if (aKind === "event" && bKind === "article") {
    const text = (a.title + " " + a.description).toLowerCase();
    b.tags?.forEach((tag) => {
      if (text.includes(tag.toLowerCase())) score += 2;
    });
  }

  if (a.level && b.level) {
    const aLevel = LEVEL_GROUPS[a.level] || "beginner";
    const bLevel = LEVEL_GROUPS[b.level] || "beginner";
    if (aLevel === bLevel) score += 1;
  }

  if (bKind === "article" && b.featured) score += 1;

  if (bKind === "event") {
    const eventDate = new Date(b.date);
    if (eventDate < now) score -= 2;
  }

  return score;
}

export function relatedArticlesForEvent(event, articles, { limit = 3 } = {}) {
  const scored = articles.map((a) => ({
    article: a,
    score: scoreRelatedness(event, "event", a, "article"),
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.article.date) - new Date(a.article.date);
  });

  return scored.slice(0, Math.max(limit, 3)).map((x) => x.article);
}

export function relatedEventsForArticle(article, allEvents, { limit = 3 } = {}) {
  const scored = allEvents.map((e) => ({
    event: e,
    score: scoreRelatedness(article, "article", e, "event"),
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aDate = new Date(a.event.date);
    const bDate = new Date(b.event.date);
    if (!isNaN(aDate) && !isNaN(bDate)) return bDate - aDate;
    return 0;
  });

  return scored.slice(0, Math.max(limit, 3)).map((x) => x.event);
}

export function relatedEventsForEvent(event, allEvents, { limit = 3 } = {}) {
  const scored = allEvents
    .filter((e) => e.id !== event.id)
    .map((e) => ({
      event: e,
      score: scoreRelatedness(event, "event", e, "event"),
    }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aDate = new Date(a.event.date);
    const bDate = new Date(b.event.date);
    if (!isNaN(aDate) && !isNaN(bDate)) return bDate - aDate;
    return 0;
  });

  return scored.slice(0, Math.max(limit, 3)).map((x) => x.event);
}

export function relatedArticlesForArticle(article, allArticles, { limit = 3 } = {}) {
  const scored = allArticles
    .filter((a) => a.id !== article.id)
    .map((a) => ({
      article: a,
      score: scoreRelatedness(article, "article", a, "article"),
    }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.article.date) - new Date(a.article.date);
  });

  return scored.slice(0, Math.max(limit, 3)).map((x) => x.article);
}
