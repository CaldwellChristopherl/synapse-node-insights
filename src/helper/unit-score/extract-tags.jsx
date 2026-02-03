export const extractTags = (unit) => {
  const tags = [];
  unit.rules?.forEach(rule => {
    const name = rule.name?.toLowerCase() || '';
    if (name.includes('fast')) tags.push('fast', 'speed');
    if (name.includes('scout')) tags.push('scout', 'infiltrate');
    if (name.includes('tough')) tags.push('tough', 'durable');
    if (name.includes('hero')) tags.push('hero', 'leader');
    if (name.includes('fearless')) tags.push('fearless', 'elite');
    if (name.includes('flying')) tags.push('flying', 'mobile');
    if (name.includes('ambush')) tags.push('ambush', 'infiltrate');
    if (name.includes('stealth')) tags.push('stealth', 'subtle');
    if (name.includes('regeneration')) tags.push('regeneration', 'tough');
    if (name.includes('relentless')) tags.push('relentless', 'shooting');
    if (name.includes('strider')) tags.push('strider', 'mobile');
    if (name.includes('fear')) tags.push('fear', 'psychological');
    if (name.includes('caster')) tags.push('psychic', 'magic');
  });
  unit.weapons?.forEach(weapon => {
    if (weapon.range > 24) tags.push('long-range', 'artillery');
    else if (weapon.range > 0) tags.push('ranged', 'shooting');
    else tags.push('melee', 'combat');
  });
  if (unit.size >= 10) tags.push('horde', 'numerous');
  else if (unit.size <= 3 && unit.cost > 150) tags.push('elite', 'expensive');
  if (unit.defense <= 3) tags.push('armored', 'tough');
  if (unit.quality <= 3) tags.push('skilled', 'elite');
  return [...new Set(tags)];
};