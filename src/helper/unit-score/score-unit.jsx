export const scoreUnit = (unit, userScores) => {
  const tags = extractTags(unit);
  let score = 50;
  if (userScores.speed > 2) {
    if (tags.includes('fast') || tags.includes('flying')) score += 15;
    if (tags.includes('scout') || tags.includes('ambush')) score += 10;
  } else if (userScores.speed < -2) {
    if (tags.includes('tough') || tags.includes('armored')) score += 15;
    if (tags.includes('artillery')) score += 10;
  }
  if (userScores.elite > 2) {
    if (tags.includes('elite') || tags.includes('expensive')) score += 15;
    if (tags.includes('hero')) score += 10;
  } else if (userScores.elite < -2) {
    if (tags.includes('horde') || tags.includes('numerous')) score += 15;
  }
  if (userScores.subtlety > 2) {
    if (tags.includes('infiltrate') || tags.includes('stealth')) score += 15;
    if (tags.includes('sniper')) score += 10;
  } else if (userScores.subtlety < -2) {
    if (tags.includes('melee') || tags.includes('tough')) score += 15;
  }
  if (userScores.tech > 2) {
    if (tags.includes('ranged') || tags.includes('artillery')) score += 10;
  } else if (userScores.tech < -2) {
    if (tags.includes('melee') || tags.includes('combat')) score += 10;
  }
  if (userScores.mystery > 2) {
    if (tags.includes('psychic') || tags.includes('magic')) score += 15;
  }
  return Math.min(100, Math.max(0, score));
};