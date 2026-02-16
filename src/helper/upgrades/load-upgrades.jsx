const upgradeFiles = import.meta.glob('../../data/upgrades/*/*.json', { eager: false });

const cache = {};

/**
 * Lazy-load upgrade data for a specific faction.
 * @param {string} gameSystem - e.g. 'grimdark-future'
 * @param {string} factionName - e.g. 'Titan Lords'
 * @returns {Promise<Object|null>} Upgrade data with packages array, or null
 */
export async function loadUpgrades(gameSystem, factionName) {
  const cacheKey = `${gameSystem}/${factionName}`;
  if (cache[cacheKey]) return cache[cacheKey];

  // Convert faction name to filename: "Titan Lords" -> "titan-lords"
  const fileName = factionName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const key = `../../data/upgrades/${gameSystem}/${fileName}.json`;
  const loader = upgradeFiles[key];

  if (!loader) return null;

  try {
    const data = await loader();
    const result = data.default || data;
    cache[cacheKey] = result;
    return result;
  } catch {
    return null;
  }
}

/**
 * Get upgrade packages applicable to a specific unit.
 * @param {Object} upgradeData - Full faction upgrade data from loadUpgrades()
 * @param {string} unitId - The unit ID to find packages for
 * @returns {Object[]} Array of applicable packages with their sections/options
 */
export function getUnitUpgrades(upgradeData, unitId) {
  if (!upgradeData?.packages) return [];
  return upgradeData.packages.filter(pkg =>
    pkg.forUnits.includes(unitId)
  );
}
