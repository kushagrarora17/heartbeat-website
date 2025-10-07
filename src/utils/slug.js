/**
 * Generate a URL-friendly slug from a title
 * @param {string} title - The title to convert to a slug
 * @returns {string} - URL-friendly slug
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
}

/**
 * Create a full slug with ID and title for SEO-friendly URLs
 * @param {number|string} id - The item ID
 * @param {string} title - The item title
 * @returns {string} - Full slug in format "id-title-slug"
 */
export function createFullSlug(id, title) {
  const titleSlug = generateSlug(title);
  return `${id}-${titleSlug}`;
}

/**
 * Extract ID from a full slug
 * @param {string} slug - The full slug in format "id-title-slug"
 * @returns {string|null} - The extracted ID or null if not found
 */
export function extractIdFromSlug(slug) {
  const match = slug.match(/^(\d+)-/);
  return match ? match[1] : null;
}


