/**
 * Score an upgrade option against user personality scores.
 * Uses pre-computed dimensionScores from the retag script.
 *
 * @param {Object} option - Upgrade option with dimensionScores, tags
 * @param {Object} userScores - User's personality dimension scores
 * @returns {number} Score 0-100
 */
export function scoreUpgrade(option, userScores) {
  const upgradeDims = option.dimensionScores;
  if (!upgradeDims || Object.keys(upgradeDims).length === 0) return 50;

  let alignment = 0;
  let maxAlignment = 0;

  const allDims = new Set([
    ...Object.keys(userScores),
    ...Object.keys(upgradeDims)
  ]);

  for (const dim of allDims) {
    const userVal = userScores[dim] || 0;
    const upgradeVal = upgradeDims[dim] || 0;
    if (userVal === 0 && upgradeVal === 0) continue;

    alignment += userVal * upgradeVal;
    maxAlignment += Math.abs(userVal) * Math.abs(upgradeVal);
  }

  if (maxAlignment === 0) return 50;

  const normalized = alignment / maxAlignment;
  return Math.min(100, Math.max(0, Math.round(50 + normalized * 50)));
}

/**
 * Get recommended upgrades for a unit, sorted by personality fit.
 *
 * @param {Object[]} packages - Upgrade packages applicable to this unit
 * @param {string} unitId - The unit's ID (for per-unit costs)
 * @param {Object} userScores - User personality scores
 * @returns {Object[]} Flattened sorted list of { packageHint, sectionLabel, option, score, cost }
 */
export function getRecommendedUpgrades(packages, unitId, userScores) {
  const results = [];

  for (const pkg of packages) {
    for (const section of pkg.sections) {
      for (const option of section.options) {
        const score = scoreUpgrade(option, userScores);

        // Get per-unit cost if available, otherwise use default
        const perUnitCost = option.costs?.find(c => c.unitId === unitId);
        const cost = perUnitCost ? perUnitCost.cost : option.cost;

        results.push({
          packageHint: pkg.hint,
          sectionLabel: section.label,
          option,
          score,
          cost
        });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
