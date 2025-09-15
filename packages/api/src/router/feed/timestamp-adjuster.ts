/**
 * Timestamp adjustment utility for mock data
 * Calculates offset to make the most recent posts appear recent
 */

let timestampOffset: number | null = null;

/**
 * Calculate the timestamp offset to make the most recent post appear recent
 * This is calculated once when the server starts and cached for the session
 */
export function calculateTimestampOffset(mostRecentPostDate: Date): number {
  if (timestampOffset !== null) {
    return timestampOffset;
  }

  // Set target time to 6 AM today (or yesterday if it's before 6 AM)
  const now = new Date();
  const targetTime = new Date(now);
  targetTime.setHours(6, 0, 0, 0);
  
  // If it's before 6 AM today, use 6 AM yesterday
  if (now.getHours() < 6) {
    targetTime.setDate(targetTime.getDate() - 1);
  }

  // Calculate offset: targetTime - mostRecentPostDate
  timestampOffset = targetTime.getTime() - mostRecentPostDate.getTime();
  
  return timestampOffset;
}

/**
 * Adjust a timestamp using the calculated offset
 */
export function adjustTimestamp(originalDate: Date): Date {
  const offset = timestampOffset ?? 0;
  return new Date(originalDate.getTime() + offset);
}

/**
 * Get the current timestamp offset (for debugging)
 */
export function getTimestampOffset(): number | null {
  return timestampOffset;
}

/**
 * Reset the timestamp offset (useful for testing)
 */
export function resetTimestampOffset(): void {
  timestampOffset = null;
}

