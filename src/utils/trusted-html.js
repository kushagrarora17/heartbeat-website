const DISALLOWED_TAGS = [
  "script",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
];

const EVENT_HANDLER_ATTR = /\s+on[a-z-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URL_ATTR = /\s+(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi;

function stripDisallowedTags(html) {
  return DISALLOWED_TAGS.reduce((output, tag) => {
    const pattern = new RegExp(`</?\\s*${tag}\\b[^>]*>`, "gi");
    return output.replace(pattern, "");
  }, html);
}

export function sanitizeTrustedHtml(html, source = "trusted content") {
  if (typeof html !== "string") {
    throw new TypeError(`Expected HTML string for ${source}`);
  }

  const cleaned = stripDisallowedTags(html)
    .replace(EVENT_HANDLER_ATTR, "")
    .replace(JAVASCRIPT_URL_ATTR, "");

  if (/\bjavascript:\s*/i.test(cleaned)) {
    throw new Error(`Unsafe javascript: URL detected in ${source}`);
  }

  return cleaned;
}
