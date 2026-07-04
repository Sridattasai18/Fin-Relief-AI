/**
 * Centralized stress scoring utilities.
 *
 * Single source of truth for score-to-label and score-to-color mapping.
 * The backend's compute_stress_level() uses the same four bands — keep in sync.
 *
 * Bands: Low 0-25 | Medium 26-60 | High 61-85 | Critical 86-100
 */

/**
 * Returns a human-readable label for the given numeric stress score.
 * @param {number} score - 0 to 100
 * @returns {string}
 */
export function stressLabel(score) {
  if (score <= 25) return 'Low stress'
  if (score <= 60) return 'Medium stress'
  if (score <= 85) return 'High stress'
  return 'Critical'
}

/**
 * Returns the CSS variable string for the stress color.
 * High and Critical share var(--color-danger) — distinguished by label only.
 * @param {number} score - 0 to 100
 * @returns {string} e.g. "var(--color-green)"
 */
export function stressColor(score) {
  if (score <= 25) return 'var(--color-green)'
  if (score <= 60) return 'var(--color-warning)'
  return 'var(--color-danger)'
}
