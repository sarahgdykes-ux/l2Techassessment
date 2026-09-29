/**
 * Urgency Scorer - rule-based priority calculation.
 *
 * Priority is driven by explicit incident language first, with sentiment
 * and message structure used as supporting signals. We intentionally avoid
 * using message length, punctuation count, business hours, or weekends as
 * direct urgency penalties because those signals are unreliable.
 */

const CRITICAL_PATTERNS = [
  /\b(server|service|site|system|production)\s+(is\s+)?(down|offline|unavailable)\b/i,
  /\b(outage|outages|service disruption|major incident)\b/i,
  /\b(can't|cannot|unable to)\s+(access|log in|login|use)\b/i,
  /\b(data|database)\s+(loss|lost|corrupt|corruption)\b/i,
  /\b(database|db)\s+(connection|connectivity)\s+(lost|failed|down)\b/i,
  /\bsecurity breach\b/i,
  /\baccount (hacked|compromised)\b/i,
  /\bcharged twice\b/i,
  /\bproduction (error|failure)\b/i,
  /\bcompletely\s+broken\b/i
]

const HIGH_PATTERNS = [
  /\b(error|bug|crash|failed|failure|broken|not working|timeout|timed out)\b/i,
  /\b(payment|charge|refund)\b.*\b(failed|wrong|missing|declined)\b/i,
  /\b(blocked|locked out|can't log in|cannot log in)\b/i,
  /\b(asap|urgent|urgently|immediately|right away)\b/i
]

const LOW_PATTERNS = [
  /\bthank(s| you)?\b/i,
  /\bappreciate\b/i,
  /\b(love|great|excellent|wonderful|happy)\b/i,
  /\b(just wanted to (say|share)|positive feedback)\b/i
]

export function calculateUrgency(message) {
  const normalized = message.trim()

  if (!normalized || normalized.length < 3) return "Low"

  // Explicit operational incidents should never be downgraded just because
  // the customer used a short message.
  if (CRITICAL_PATTERNS.some(pattern => pattern.test(normalized))) {
    return "High"
  }

  // High-confidence support failures take priority over generic questions.
  if (HIGH_PATTERNS.some(pattern => pattern.test(normalized))) {
    return "High"
  }

  // Positive feedback and simple questions are normally low priority.
  if (LOW_PATTERNS.some(pattern => pattern.test(normalized))) {
    return "Low"
  }

  if (/\?\s*$/.test(normalized) && !/\b(problem|issue|error|failed|can't|cannot)\b/i.test(normalized)) {
    return "Low"
  }

  return "Medium"
}
