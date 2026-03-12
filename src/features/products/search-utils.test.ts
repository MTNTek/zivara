import { describe, it, expect } from 'vitest';
import {
  processSearchQuery,
  highlightSearchTerms,
  getSearchSnippet,
  calculateRelevanceScore,
} from './search-utils';

describe('Search Utilities', () => {
  describe('processSearchQuery', () => {
    it('should split query into terms', () => {
      const result = processSearchQuery('laptop wireless mouse');

      expect(result).toEqual(['laptop', 'wireless', 'mouse']);
    });

    it('should filter out stop words', () => {
      const result = processSearchQuery('the laptop and the mouse');

      expect(result).toEqual(['laptop', 'mouse']);
      expect(result).not.toContain('the');
      expect(result).not.toContain('and');
    });

    it('should convert to lowercase', () => {
      const result = processSearchQuery('LAPTOP Wireless MOUSE');

      expect(result).toEqual(['laptop', 'wireless', 'mouse']);
    });

    it('should handle multiple spaces', () => {
      const result = processSearchQuery('laptop    wireless     mouse');

      expect(result).toEqual(['laptop', 'wireless', 'mouse']);
    });

    it('should handle empty query', () => {
      const result = processSearchQuery('');

      expect(result).toEqual([]);
    });

    it('should handle query with only stop words', () => {
      const result = processSearchQuery('the and or but');

      expect(result).toEqual([]);
    });

    it('should handle special characters', () => {
      const result = processSearchQuery('laptop-mouse wireless_keyboard');

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('highlightSearchTerms', () => {
    it('should highlight single term', () => {
      const result = highlightSearchTerms('Wireless Laptop Mouse', 'laptop');

      expect(result).toContain('<mark>');
      expect(result).toContain('</mark>');
      expect(result).toContain('Laptop');
    });

    it('should highlight multiple terms', () => {
      const result = highlightSearchTerms('Wireless Laptop Mouse', 'wireless mouse');

      expect(result).toContain('<mark>Wireless</mark>');
      expect(result).toContain('<mark>Mouse</mark>');
    });

    it('should be case-insensitive', () => {
      const result = highlightSearchTerms('Wireless Laptop Mouse', 'LAPTOP');

      expect(result).toContain('<mark>Laptop</mark>');
    });

    it('should not highlight stop words', () => {
      const result = highlightSearchTerms('The laptop and the mouse', 'the laptop');

      expect(result).toContain('<mark>laptop</mark>');
      // "the" should not be highlighted (it's a stop word)
      expect(result).not.toContain('<mark>The</mark>');
    });

    it('should handle empty search query', () => {
      const result = highlightSearchTerms('Wireless Laptop Mouse', '');

      expect(result).toBe('Wireless Laptop Mouse');
      expect(result).not.toContain('<mark>');
    });

    it('should handle empty text', () => {
      const result = highlightSearchTerms('', 'laptop');

      expect(result).toBe('');
    });

    it('should handle partial word matches', () => {
      const result = highlightSearchTerms('Laptop and Laptops', 'lap');

      expect(result).toContain('<mark>Lap</mark>');
    });

    it('should handle special characters in search', () => {
      const result = highlightSearchTerms('Product (New)', 'new');

      expect(result).toContain('<mark>New</mark>');
    });

    it('should highlight longest terms first', () => {
      const result = highlightSearchTerms('Wireless Mouse', 'wire wireless');

      // Should highlight both terms (wire is a substring of wireless)
      expect(result).toContain('<mark>');
      expect(result).toContain('</mark>');
    });
  });

  describe('getSearchSnippet', () => {
    const longText = 'This is a very long product description that contains many words and details about the product. The laptop is a high-performance device with excellent features. It has a powerful processor and great battery life.';

    it('should return full text if shorter than maxLength', () => {
      const shortText = 'Short description';
      const result = getSearchSnippet(shortText, 'description', 200);

      expect(result).toBe(shortText);
      expect(result).not.toContain('...');
    });

    it('should truncate long text', () => {
      const result = getSearchSnippet(longText, '', 100);

      expect(result.length).toBeLessThanOrEqual(103); // 100 + "..."
      expect(result).toContain('...');
    });

    it('should center snippet around search term', () => {
      const result = getSearchSnippet(longText, 'laptop', 100);

      expect(result).toContain('laptop');
      expect(result.length).toBeLessThanOrEqual(106); // 100 + "..." prefix and suffix
    });

    it('should add prefix ellipsis when starting mid-text', () => {
      const result = getSearchSnippet(longText, 'battery', 100);

      expect(result).toContain('battery');
      expect(result.startsWith('...')).toBe(true);
    });

    it('should add suffix ellipsis when ending mid-text', () => {
      const result = getSearchSnippet(longText, 'very', 100);

      expect(result).toContain('very');
      expect(result.endsWith('...')).toBe(true);
    });

    it('should handle empty search query', () => {
      const result = getSearchSnippet(longText, '', 100);

      expect(result.length).toBeLessThanOrEqual(103);
    });

    it('should handle search term not found', () => {
      const result = getSearchSnippet(longText, 'nonexistent', 100);

      expect(result.length).toBeLessThanOrEqual(103);
    });

    it('should try to break at word boundaries', () => {
      const result = getSearchSnippet(longText, 'laptop', 100);

      // Should not break in the middle of a word
      expect(result).not.toMatch(/\.\.\.\w+$/);
      expect(result).not.toMatch(/^\w+\.\.\./);
    });

    it('should handle multiple search terms', () => {
      const result = getSearchSnippet(longText, 'laptop processor', 100);

      // Should center around the first found term
      expect(result).toContain('laptop');
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should give high score for exact name match', () => {
      const score = calculateRelevanceScore('laptop', 'description', 'laptop');

      expect(score).toBeGreaterThan(40);
    });

    it('should give medium score for name contains term', () => {
      const score = calculateRelevanceScore('Wireless Laptop Mouse', 'description', 'laptop');

      expect(score).toBeGreaterThan(5);
      expect(score).toBeLessThan(50);
    });

    it('should give low score for description only match', () => {
      const score = calculateRelevanceScore('Mouse', 'This is a laptop description', 'laptop');

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(10);
    });

    it('should return 0 for no matches', () => {
      const score = calculateRelevanceScore('Mouse', 'Wireless device', 'laptop');

      expect(score).toBe(0);
    });

    it('should return 0 for empty query', () => {
      const score = calculateRelevanceScore('Laptop', 'Description', '');

      expect(score).toBe(0);
    });

    it('should handle multiple search terms', () => {
      const score = calculateRelevanceScore(
        'Wireless Laptop Mouse',
        'Great wireless device',
        'wireless laptop'
      );

      // Should score higher for multiple matches
      expect(score).toBeGreaterThan(10);
    });

    it('should prioritize name matches over description', () => {
      const nameScore = calculateRelevanceScore('laptop', 'description', 'laptop');
      const descScore = calculateRelevanceScore('mouse', 'laptop description', 'laptop');

      expect(nameScore).toBeGreaterThan(descScore);
    });

    it('should cap score at 100', () => {
      const score = calculateRelevanceScore(
        'laptop laptop laptop',
        'laptop laptop laptop',
        'laptop'
      );

      expect(score).toBeLessThanOrEqual(100);
    });

    it('should be case-insensitive', () => {
      const score1 = calculateRelevanceScore('LAPTOP', 'DESCRIPTION', 'laptop');
      const score2 = calculateRelevanceScore('laptop', 'description', 'LAPTOP');
      const score3 = calculateRelevanceScore('Laptop', 'Description', 'LaPtOp');

      expect(score1).toBe(score2);
      expect(score2).toBe(score3);
    });

    it('should filter stop words', () => {
      const score1 = calculateRelevanceScore('Laptop', 'Description', 'laptop');
      const score2 = calculateRelevanceScore('Laptop', 'Description', 'the laptop');

      // Stop words should be filtered, so scores should be equal
      expect(score1).toBe(score2);
    });
  });

  describe('Integration Tests', () => {
    it('should work together for search result display', () => {
      const productName = 'Wireless Gaming Laptop';
      const productDescription = 'High-performance laptop with RGB keyboard and powerful graphics card';
      const searchQuery = 'laptop gaming';

      // Process query
      const terms = processSearchQuery(searchQuery);
      expect(terms).toContain('laptop');
      expect(terms).toContain('gaming');

      // Calculate relevance
      const score = calculateRelevanceScore(productName, productDescription, searchQuery);
      expect(score).toBeGreaterThan(0);

      // Highlight terms
      const highlightedName = highlightSearchTerms(productName, searchQuery);
      expect(highlightedName).toContain('<mark>');

      // Get snippet
      const snippet = getSearchSnippet(productDescription, searchQuery, 100);
      expect(snippet).toContain('laptop');
    });

    it('should handle complex search scenarios', () => {
      const productName = 'Apple MacBook Pro 16-inch';
      const productDescription = 'Professional laptop with M2 chip, 16GB RAM, and stunning Retina display';
      const searchQuery = 'macbook pro laptop';

      const terms = processSearchQuery(searchQuery);
      expect(terms.length).toBe(3);

      const score = calculateRelevanceScore(productName, productDescription, searchQuery);
      expect(score).toBeGreaterThan(20);

      const highlightedName = highlightSearchTerms(productName, searchQuery);
      expect(highlightedName).toContain('<mark>MacBook</mark>');
      expect(highlightedName).toContain('<mark>Pro</mark>');
    });
  });
});
