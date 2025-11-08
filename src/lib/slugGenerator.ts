export function generateSlug(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isValidSlug(slug: string): boolean {
  // Only allow alphanumeric, hyphens, and underscores, 3-50 characters
  return /^[a-zA-Z0-9_-]{3,50}$/.test(slug);
}

export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol');
    }
    return urlObj.href;
  } catch {
    throw new Error('Invalid URL');
  }
}
