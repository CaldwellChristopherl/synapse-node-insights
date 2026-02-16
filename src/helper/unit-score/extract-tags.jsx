/**
 * Runtime tag extraction from unit data.
 * Used as fallback when pre-tagged data is not available.
 *
 * @param {Object} unit - Unit with rules, weapons, name, etc.
 * @param {Object} [context] - Optional faction context { factionType, monoType }
 * @returns {string[]} Array of tags
 */
export const extractTags = (unit, context) => {
  const tags = [];
  const unitName = (unit.name || '').toLowerCase();
  const factionType = context?.factionType || 'mixed';

  // Extract tags from unit rules
  unit.rules?.forEach(rule => {
    const ruleName = (typeof rule === 'string' ? rule : rule.name || '').toLowerCase();

    // Movement rules
    if (ruleName.includes('fast')) tags.push('fast');
    if (ruleName.includes('flying')) tags.push('flying', 'mobile');
    if (ruleName.includes('scout')) tags.push('scout', 'mobile');
    if (ruleName.includes('ambush')) tags.push('ambush', 'mobile');
    if (ruleName.includes('strider')) tags.push('mobile');
    if (ruleName.includes('slow')) tags.push('slow');
    if (ruleName.includes('aircraft')) {
      if (factionType === 'organic') {
        tags.push('flying');
      } else {
        tags.push('aircraft', 'flying', 'vehicle');
      }
    }
    if (ruleName.includes('bounding')) tags.push('fast');

    // Combat rules
    if (ruleName.includes('hero')) tags.push('hero', 'leader');
    if (ruleName.includes('tough')) tags.push('tough');
    if (ruleName.includes('fearless')) tags.push('fearless');
    if (ruleName.includes('furious')) tags.push('aggressive');
    if (ruleName.includes('impact')) tags.push('aggressive');
    if (ruleName.includes('shielded') || ruleName.includes('fortified')) tags.push('defensive');
    if (ruleName.includes('regeneration')) tags.push('regeneration');
    if (ruleName.includes('stealth')) tags.push('stealth');
    if (ruleName.includes('relentless')) tags.push('ranged');
    if (ruleName.includes('artillery')) tags.push('artillery', 'static', 'ranged');
    if (ruleName.includes('good shot')) tags.push('ranged');
    if (ruleName.includes('sniper')) tags.push('sniper', 'ranged');
    if (ruleName.includes('infiltrate')) tags.push('stealth', 'infiltrate');

    // Psychic/Magic
    if (ruleName.includes('caster') || ruleName.includes('wizard') || ruleName.includes('psychic')) {
      tags.push('magic', 'psychic');
    }
    if (ruleName.includes('transport')) tags.push('transport');

    // v1.8.0: Honor Code and Mercenary
    if (ruleName.includes('honor code')) tags.push('honorable', 'noble');
    if (ruleName.includes('mercenary')) tags.push('independent');

    // Faction-wide rules
    if (ruleName.includes('battleborn')) tags.push('disciplined', 'fearless');
    if (ruleName.includes('bloodborn')) tags.push('aggressive', 'melee');
    if (ruleName.includes('darkborn')) tags.push('stealth');
    if (ruleName.includes('hold the line')) tags.push('disciplined');
    if (ruleName.includes('hive bond') || ruleName.includes('hivebond')) tags.push('collective');
    if (ruleName.includes('mischievous')) tags.push('treacherous', 'cunning');
    if (ruleName.includes('reinforced')) tags.push('tough', 'resilient');
    if (ruleName.includes('for the greater good')) tags.push('collective', 'disciplined');
    if (ruleName.includes('waaagh') || ruleName.includes('ferocious')) tags.push('aggressive', 'chaotic');
    if (ruleName.includes('bound') && (ruleName.includes('change') || ruleName.includes('lust') ||
        ruleName.includes('plague') || ruleName.includes('war'))) {
      tags.push('corrupted');
    }
    if (ruleName.includes('undead')) tags.push('corrupted');
    if (ruleName.includes('poison')) tags.push('poison');
  });

  // Name-based detection for vehicles
  if (unitName.includes('tank') || unitName.includes('apc') || unitName.includes('vehicle') ||
      unitName.includes('truck') || unitName.includes('transport')) {
    tags.push('vehicle');
  }
  if (unitName.includes('walker') || unitName.includes('titan') || unitName.includes('mech') ||
      unitName.includes('dreadnought')) {
    if (factionType !== 'organic') tags.push('vehicle');
    else tags.push('monster');
  }
  if (unitName.includes('gunship') || unitName.includes('aircraft') || unitName.includes('flyer') ||
      unitName.includes('bomber') || unitName.includes('fighter')) {
    tags.push('aircraft', 'vehicle', 'flying');
  }
  if (unitName.includes('bike') || unitName.includes('speeder') || unitName.includes('jetbike') ||
      unitName.includes('hover')) {
    tags.push('vehicle', 'fast');
  }

  // Battlesuit/Mech detection
  if (unitName.includes('suit') || unitName.includes('battlesuit')) {
    tags.push('vehicle');
  }

  // Cavalry detection
  if (unitName.includes('rider') || unitName.includes('cavalry') || unitName.includes('mounted') ||
      unitName.includes('chariot') || unitName.includes('biker')) {
    tags.push('cavalry', 'fast');
  }

  // Assassin detection
  if (unitName.includes('assassin')) tags.push('stealth');

  // Robot/Drone detection
  if (unitName.includes('robot') || unitName.includes('automaton') || unitName.includes('construct')) {
    tags.push('robot');
  }
  if (unitName.includes('drone')) tags.push('drone', 'robot');

  // Faction type context tags
  if (factionType === 'organic') tags.push('organic');
  if (factionType === 'corrupted') tags.push('corrupted');
  if (factionType === 'zealot') tags.push('zealot');

  // Analyze weapons for combat style
  let hasRanged = false;
  let hasMelee = false;
  unit.weapons?.forEach(weapon => {
    if (weapon.range > 0) hasRanged = true;
    else hasMelee = true;
  });

  if (hasRanged && !hasMelee) tags.push('ranged');
  else if (hasMelee && !hasRanged) tags.push('melee');
  else if (hasRanged && hasMelee) tags.push('balanced');

  // Stats-based tags
  const costPerModel = unit.cost / (unit.size || 1);

  if (costPerModel >= 30 && unit.quality <= 3) {
    tags.push('elite');
  } else if (costPerModel >= 20 && unit.quality <= 4) {
    tags.push('veteran');
  } else if (costPerModel <= 12) {
    tags.push('cheap');
  }

  if (unit.quality >= 5) tags.push('expendable');
  if ((unit.size || 1) >= 10) tags.push('horde', 'swarm');
  if (unit.defense <= 3) tags.push('armored');

  // Mono-type versatility override (v1.8.0)
  if (context?.monoType?.isMonoType) {
    const idx1 = tags.indexOf('versatile');
    if (idx1 >= 0) tags.splice(idx1, 1);
    const idx2 = tags.indexOf('adaptive');
    if (idx2 >= 0) tags.splice(idx2, 1);
    tags.push('specialist');
  }

  return [...new Set(tags)];
};
