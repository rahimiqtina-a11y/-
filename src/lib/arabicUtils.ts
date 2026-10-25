/**
 * Utility functions for Arabic and English text normalization and matching
 */

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // Normalize Hamza variants
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي')
    // Normalize Ta Marbuta to Ha
    .replace(/ة/g, 'ه')
    // Normalize Alif Maqsura to Ya
    .replace(/ى/g, 'ي')
    // Remove Tashkeel (diacritics: Fatha, Damma, Kasra, Sukun, Tanwin, Shadda)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove Tatweel (Kashida)
    .replace(/\u0640/g, '');
}

export function matchesKeyword(haystack: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!haystack) return false;

  const normalizedHaystack = normalizeArabic(haystack);
  const normalizedQuery = normalizeArabic(query);

  const queryTokens = normalizedQuery
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean);

  if (queryTokens.length === 0) return true;

  // Check if all tokens match haystack
  return queryTokens.every(token => normalizedHaystack.includes(token));
}
