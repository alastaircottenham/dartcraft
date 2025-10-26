/**
 * UUID generation service with fallback for iOS Safari
 * where crypto.randomUUID() is not available
 */

// Fallback UUID generator for browsers that don't support crypto.randomUUID()
function generateFallbackUUID(): string {
  // Use crypto.getRandomValues if available, otherwise use Math.random
  let randomValues: Uint8Array;
  
  if (crypto && crypto.getRandomValues) {
    randomValues = new Uint8Array(16);
    crypto.getRandomValues(randomValues);
  } else {
    // Fallback to Math.random (less secure but works everywhere)
    randomValues = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Set version (4) and variant bits
  randomValues[6] = (randomValues[6] & 0x0f) | 0x40; // Version 4
  randomValues[8] = (randomValues[8] & 0x3f) | 0x80; // Variant bits
  
  // Convert to hex string with proper formatting
  const hex = Array.from(randomValues)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
}

/**
 * Generate a UUID (Universally Unique Identifier)
 * Uses crypto.randomUUID() if available, otherwise falls back to custom implementation
 */
export function generateUUID(): string {
  try {
    // Try to use crypto.randomUUID if available (works on most modern browsers)
    if (crypto && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (error) {
    console.warn('crypto.randomUUID not available, using fallback UUID generator:', error);
  }
  
  // Fallback for iOS Safari and other browsers where crypto.randomUUID is not available
  return generateFallbackUUID();
}
