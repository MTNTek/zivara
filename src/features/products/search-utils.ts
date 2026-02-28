/**
 * Search utility functions for highlighting and text processing
 */

// Common stop words to filter out from search queries
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
  'that', 'these', 'those', 'it', 'its'
]);

/**
 * Process search query by removing stop words and splitting into terms
 */
export function processSearchQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 0 && !STOP_WORDS.has(term));
}

/**
 * Highlight search terms in text
 * Returns text with <mark> tags around matching terms
 * 
 * @param text - The text to highlight
 * @param searchQuery - The search query string
 * @returns Text with highlighted terms
 */
export function highlightSearchTerms(text: string, searchQuery: string): string {
  if (!searchQuery || !text) {
    return text;
  }

  const terms = processSearchQuery(searchQuery);
  if (terms.length === 0) {
    return text;
  }

  let highlightedText = text;

  // Sort terms by length (longest first) to avoid partial replacements
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length);

  for (const term of sortedTerms) {
    // Create a case-insensitive regex that matches whole or partial words
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  }

  return highlightedText;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get a snippet of text around the first occurrence of search terms
 * Useful for showing context in search results
 * 
 * @param text - The full text
 * @param searchQuery - The search query
 * @param maxLength - Maximum length of the snippet (default: 200)
 * @returns A snippet with the search term context
 */
export function getSearchSnippet(
  text: string,
  searchQuery: string,
  maxLength: number = 200
): string {
  if (!searchQuery || !text) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  const terms = processSearchQuery(searchQuery);
  if (terms.length === 0) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  // Find the first occurrence of any search term
  const lowerText = text.toLowerCase();
  let firstIndex = -1;

  for (const term of terms) {
    const index = lowerText.indexOf(term.toLowerCase());
    if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
      firstIndex = index;
    }
  }

  if (firstIndex === -1) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  // Calculate snippet boundaries
  const halfLength = Math.floor(maxLength / 2);
  let start = Math.max(0, firstIndex - halfLength);
  let end = Math.min(text.length, start + maxLength);

  // Adjust start if we're at the end
  if (end === text.length && text.length > maxLength) {
    start = Math.max(0, end - maxLength);
  }

  // Try to break at word boundaries
  if (start > 0) {
    const spaceIndex = text.indexOf(' ', start);
    if (spaceIndex !== -1 && spaceIndex < start + 20) {
      start = spaceIndex + 1;
    }
  }

  if (end < text.length) {
    const spaceIndex = text.lastIndexOf(' ', end);
    if (spaceIndex !== -1 && spaceIndex > end - 20) {
      end = spaceIndex;
    }
  }

  const snippet = text.substring(start, end);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';

  return prefix + snippet + suffix;
}

/**
 * Calculate relevance score for a product based on search terms
 * Higher score = more relevant
 * 
 * @param productName - Product name
 * @param productDescription - Product description
 * @param searchQuery - Search query
 * @returns Relevance score (0-100)
 */
export function calculateRelevanceScore(
  productName: string,
  productDescription: string,
  searchQuery: string
): number {
  if (!searchQuery) return 0;

  const terms = processSearchQuery(searchQuery);
  if (terms.length === 0) return 0;

  let score = 0;
  const lowerName = productName.toLowerCase();
  const lowerDesc = productDescription.toLowerCase();

  for (const term of terms) {
    // Exact name match: +50 points
    if (lowerName === term) {
      score += 50;
    }
    // Name contains term: +10 points
    else if (lowerName.includes(term)) {
      score += 10;
    }

    // Description contains term: +1 point
    if (lowerDesc.includes(term)) {
      score += 1;
    }
  }

  return Math.min(100, score);
}
