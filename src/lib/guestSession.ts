/**
 * Guest Session Management
 *
 * Handles session tracking for unauthenticated users who create demo URLs.
 * Uses browser fingerprinting and localStorage to track guest URLs.
 */

// LocalStorage keys
const GUEST_SESSION_KEY = "shortlink_guest_session_id";
const GUEST_URLS_KEY = "shortlink_guest_urls";
const GUEST_RATE_LIMIT_KEY = "shortlink_guest_rate_limit";

// Rate limiting configuration
const RATE_LIMIT_MAX_URLS = 10; // Max URLs per time window
const RATE_LIMIT_WINDOW_HOURS = 24; // Time window in hours

/**
 * Guest URL data structure stored in localStorage
 */
export interface GuestUrlData {
  slug: string;
  targetUrl: string;
  createdAt: string;
  expiresAt: string; // 7 days from creation
}

/**
 * Rate limit tracking structure
 */
interface RateLimitData {
  count: number;
  windowStart: string;
}

/**
 * Generate a unique session ID for guest users
 * Uses browser fingerprinting technique for consistency across page reloads
 */
export function generateGuestSessionId(): string {
  // Check if session ID already exists
  const existingId = localStorage.getItem(GUEST_SESSION_KEY);
  if (existingId) {
    return existingId;
  }

  // Create browser fingerprint based on available data
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: Date.now(),
  };

  // Generate hash-like ID from fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  const sessionId = btoa(fingerprintString)
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 32);

  // Add random suffix for uniqueness
  const uniqueId = `guest_${sessionId}_${Math.random().toString(36).substring(2, 9)}`;

  // Store in localStorage
  localStorage.setItem(GUEST_SESSION_KEY, uniqueId);

  return uniqueId;
}

/**
 * Get current guest session ID
 */
export function getGuestSessionId(): string | null {
  return localStorage.getItem(GUEST_SESSION_KEY);
}

/**
 * Get or create guest session ID
 */
export function getOrCreateGuestSessionId(): string {
  const existingId = getGuestSessionId();
  return existingId || generateGuestSessionId();
}

/**
 * Add a URL to guest's tracked URLs in localStorage
 */
export function addGuestUrl(url: GuestUrlData): void {
  const urls = getGuestUrls();
  urls.push(url);
  localStorage.setItem(GUEST_URLS_KEY, JSON.stringify(urls));
}

/**
 * Get all guest URLs from localStorage
 */
export function getGuestUrls(): GuestUrlData[] {
  const urlsJson = localStorage.getItem(GUEST_URLS_KEY);
  if (!urlsJson) {
    return [];
  }

  try {
    const urls = JSON.parse(urlsJson) as GuestUrlData[];
    // Filter out expired URLs
    const now = new Date();
    return urls.filter((url) => new Date(url.expiresAt) > now);
  } catch (error) {
    console.error("Error parsing guest URLs:", error);
    return [];
  }
}

/**
 * Get count of active guest URLs
 */
export function getGuestUrlCount(): number {
  return getGuestUrls().length;
}

/**
 * Clear all guest URLs from localStorage
 */
export function clearGuestUrls(): void {
  localStorage.removeItem(GUEST_URLS_KEY);
}

/**
 * Clear entire guest session (session ID + URLs + rate limit)
 */
export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_SESSION_KEY);
  localStorage.removeItem(GUEST_URLS_KEY);
  localStorage.removeItem(GUEST_RATE_LIMIT_KEY);
}

/**
 * Check if user has reached rate limit for creating guest URLs
 */
export function isRateLimited(): boolean {
  const rateLimitJson = localStorage.getItem(GUEST_RATE_LIMIT_KEY);

  if (!rateLimitJson) {
    return false;
  }

  try {
    const rateLimit = JSON.parse(rateLimitJson) as RateLimitData;
    const windowStart = new Date(rateLimit.windowStart);
    const now = new Date();
    const hoursSinceWindowStart =
      (now.getTime() - windowStart.getTime()) / (1000 * 60 * 60);

    // Reset if window has passed
    if (hoursSinceWindowStart >= RATE_LIMIT_WINDOW_HOURS) {
      resetRateLimit();
      return false;
    }

    // Check if limit exceeded
    return rateLimit.count >= RATE_LIMIT_MAX_URLS;
  } catch (error) {
    console.error("Error checking rate limit:", error);
    return false;
  }
}

/**
 * Increment rate limit counter
 */
export function incrementRateLimit(): void {
  const rateLimitJson = localStorage.getItem(GUEST_RATE_LIMIT_KEY);
  const now = new Date().toISOString();

  if (!rateLimitJson) {
    // Initialize rate limit tracking
    const rateLimit: RateLimitData = {
      count: 1,
      windowStart: now,
    };
    localStorage.setItem(GUEST_RATE_LIMIT_KEY, JSON.stringify(rateLimit));
    return;
  }

  try {
    const rateLimit = JSON.parse(rateLimitJson) as RateLimitData;
    const windowStart = new Date(rateLimit.windowStart);
    const currentTime = new Date();
    const hoursSinceWindowStart =
      (currentTime.getTime() - windowStart.getTime()) / (1000 * 60 * 60);

    if (hoursSinceWindowStart >= RATE_LIMIT_WINDOW_HOURS) {
      // Reset window
      rateLimit.count = 1;
      rateLimit.windowStart = now;
    } else {
      // Increment counter
      rateLimit.count += 1;
    }

    localStorage.setItem(GUEST_RATE_LIMIT_KEY, JSON.stringify(rateLimit));
  } catch (error) {
    console.error("Error incrementing rate limit:", error);
  }
}

/**
 * Reset rate limit counter
 */
export function resetRateLimit(): void {
  localStorage.removeItem(GUEST_RATE_LIMIT_KEY);
}

/**
 * Get remaining URLs allowed under rate limit
 */
export function getRemainingUrlQuota(): number {
  const rateLimitJson = localStorage.getItem(GUEST_RATE_LIMIT_KEY);

  if (!rateLimitJson) {
    return RATE_LIMIT_MAX_URLS;
  }

  try {
    const rateLimit = JSON.parse(rateLimitJson) as RateLimitData;
    const windowStart = new Date(rateLimit.windowStart);
    const now = new Date();
    const hoursSinceWindowStart =
      (now.getTime() - windowStart.getTime()) / (1000 * 60 * 60);

    // Reset if window has passed
    if (hoursSinceWindowStart >= RATE_LIMIT_WINDOW_HOURS) {
      return RATE_LIMIT_MAX_URLS;
    }

    return Math.max(0, RATE_LIMIT_MAX_URLS - rateLimit.count);
  } catch (error) {
    console.error("Error getting remaining quota:", error);
    return RATE_LIMIT_MAX_URLS;
  }
}

/**
 * Get time until rate limit resets (in hours)
 */
export function getTimeUntilReset(): number {
  const rateLimitJson = localStorage.getItem(GUEST_RATE_LIMIT_KEY);

  if (!rateLimitJson) {
    return 0;
  }

  try {
    const rateLimit = JSON.parse(rateLimitJson) as RateLimitData;
    const windowStart = new Date(rateLimit.windowStart);
    const now = new Date();
    const hoursSinceWindowStart =
      (now.getTime() - windowStart.getTime()) / (1000 * 60 * 60);

    return Math.max(0, RATE_LIMIT_WINDOW_HOURS - hoursSinceWindowStart);
  } catch (error) {
    console.error("Error getting time until reset:", error);
    return 0;
  }
}

/**
 * Check if user is a guest (not authenticated)
 */
export function isGuestUser(): boolean {
  return getGuestSessionId() !== null;
}

/**
 * Get guest session summary
 */
export function getGuestSessionSummary() {
  return {
    sessionId: getGuestSessionId(),
    urlCount: getGuestUrlCount(),
    remainingQuota: getRemainingUrlQuota(),
    isRateLimited: isRateLimited(),
    timeUntilReset: getTimeUntilReset(),
  };
}
