/**
 * SHA-256 hash service for content deduplication
 * Includes fallback for iOS Safari where crypto.subtle is not available
 */

// Simple hash function fallback for iOS Safari
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Convert ArrayBuffer to a string representation for hashing
function arrayBufferToString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256(buf: ArrayBuffer): Promise<string> {
  try {
    // Try to use crypto.subtle if available (works on most browsers)
    if (crypto.subtle && typeof crypto.subtle.digest === 'function') {
      const hash = await crypto.subtle.digest('SHA-256', buf);
      const bytes = new Uint8Array(hash);
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    console.warn('crypto.subtle not available, using fallback hash:', error);
  }
  
  // Fallback for iOS Safari and other browsers where crypto.subtle is not available
  const str = arrayBufferToString(buf);
  return simpleHash(str);
}

export async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return sha256(arrayBuffer);
}

