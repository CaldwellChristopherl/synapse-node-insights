import { extractTags } from './extract-tags.jsx';
import { TAG_TO_DIMENSION } from '../../data/personality/tag-to-dimension.jsx';

/**
 * Score a unit against user personality scores using dimension-alignment.
 *
 * Three-tier approach:
 *   1. Pre-tagged dimensionScores (from retag script) — fastest, most accurate
 *   2. Pre-tagged tags → TAG_TO_DIMENSION conversion — fallback
 *   3. Runtime extractTags() → TAG_TO_DIMENSION — last resort
 *
 * @param {Object} unit - Unit with optional dimensionScores, tags, rules, weapons
 * @param {Object} userScores - User's personality dimension scores (-5 to 5)
 * @param {Object} [factionContext] - Optional faction context (factionType, monoType)
 * @returns {number} Score 0-100
 */
export const scoreUnit = (unit, userScores, factionContext) => {
  // Get unit dimension scores (three-tier)
  let unitDimScores = unit.dimensionScores;

  if (!unitDimScores || Object.keys(unitDimScores).length === 0) {
    // Tier 2: convert pre-tagged tags to dimension scores
    const tags = unit.tags && unit.tags.length > 0
      ? unit.tags
      : extractTags(unit, factionContext); // Tier 3: runtime extraction

    unitDimScores = tagsToScores(tags);
  }

  // Compute alignment via dot product
  let alignment = 0;
  let maxAlignment = 0;

  const allDims = new Set([
    ...Object.keys(userScores),
    ...Object.keys(unitDimScores)
  ]);

  for (const dim of allDims) {
    const userVal = userScores[dim] || 0;
    const unitVal = unitDimScores[dim] || 0;

    if (userVal === 0 && unitVal === 0) continue;

    // Alignment: positive when user and unit agree on a dimension
    alignment += userVal * unitVal;
    // Max possible: both at full agreement
    maxAlignment += Math.abs(userVal) * Math.abs(unitVal);
  }

  if (maxAlignment === 0) return 50; // No dimensional overlap

  // Normalize to 0-100 range (50 = neutral, 100 = perfect alignment)
  const normalizedAlignment = alignment / maxAlignment; // -1 to 1
  const score = 50 + normalizedAlignment * 50;

  return Math.min(100, Math.max(0, Math.round(score)));
};

/**
 * Convert tags array to dimension scores using TAG_TO_DIMENSION mapping.
 */
function tagsToScores(tags) {
  const scores = {};
  for (const tag of tags) {
    const mapping = TAG_TO_DIMENSION[tag];
    if (mapping) {
      for (const [dim, val] of Object.entries(mapping)) {
        scores[dim] = (scores[dim] || 0) + val;
      }
    }
  }
  // Clamp to [-5, 5]
  for (const dim of Object.keys(scores)) {
    scores[dim] = Math.max(-5, Math.min(5, scores[dim]));
  }
  return scores;
}
