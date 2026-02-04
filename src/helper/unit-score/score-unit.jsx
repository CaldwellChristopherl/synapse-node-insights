import { extractTags } from './extract-tags.jsx';

export const scoreUnit = (unit, userScores) => {
  const tags = extractTags(unit);
  let score = 50;
    console.log(tags)
  // Patience dimension
  if (userScores.patience > 2) {
    if (tags.includes('defensive') || tags.includes('patient')) score += 15;
    if (tags.includes('static') || tags.includes('artillery')) score += 10;
  } else if (userScores.patience < -2) {
    if (tags.includes('aggressive') || tags.includes('furious')) score += 15;
    if (tags.includes('melee') || tags.includes('impact')) score += 10;
  }

  // Collective dimension
  if (userScores.collective > 2) {
    if (tags.includes('swarm') || tags.includes('horde')) score += 15;
    if (tags.includes('support') || tags.includes('collective')) score += 10;
  } else if (userScores.collective < -2) {
    if (tags.includes('hero') || tags.includes('independent')) score += 15;
    if (tags.includes('elite')) score += 10;
  }

  // Order dimension
  if (userScores.order > 2) {
    if (tags.includes('disciplined') || tags.includes('reliable')) score += 15;
    if (tags.includes('organized')) score += 10;
  } else if (userScores.order < -2) {
    if (tags.includes('chaotic') || tags.includes('unpredictable')) score += 15;
    if (tags.includes('cunning') || tags.includes('treacherous')) score += 10;
  }

  // Tech dimension
  if (userScores.tech > 2) {
    if (tags.includes('vehicle') || tags.includes('robot')) score += 15;
    if (tags.includes('ranged') || tags.includes('artillery')) score += 10;
    if (tags.includes('drone') || tags.includes('aircraft')) score += 10;
  } else if (userScores.tech < -2) {
    if (tags.includes('organic') || tags.includes('beast')) score += 15;
    if (tags.includes('melee') || tags.includes('combat')) score += 10;
  }

  // Elite dimension
  if (userScores.elite > 2) {
    if (tags.includes('elite') || tags.includes('veteran')) score += 15;
    if (tags.includes('hero') || tags.includes('expensive')) score += 10;
  } else if (userScores.elite < -2) {
    if (tags.includes('horde') || tags.includes('numerous')) score += 15;
    if (tags.includes('cheap') || tags.includes('expendable')) score += 10;
  }

  // Honor dimension
  if (userScores.honor > 2) {
    if (tags.includes('honorable') || tags.includes('noble')) score += 15;
  } else if (userScores.honor < -2) {
    if (tags.includes('ruthless') || tags.includes('treacherous')) score += 15;
    if (tags.includes('cunning')) score += 10;
  }

  // Faith dimension
  if (userScores.faith > 2) {
    if (tags.includes('zealot') || tags.includes('faithful')) score += 15;
    if (tags.includes('fearless')) score += 10;
  }

  // Subtlety dimension
  if (userScores.subtlety > 2) {
    if (tags.includes('infiltrate') || tags.includes('stealth')) score += 15;
    if (tags.includes('scout') || tags.includes('ambush')) score += 10;
    if (tags.includes('sniper')) score += 10;
  } else if (userScores.subtlety < -2) {
    if (tags.includes('melee') || tags.includes('tough')) score += 15;
    if (tags.includes('aggressive')) score += 10;
  }

  // Tradition dimension
  if (userScores.tradition > 2) {
    if (tags.includes('ancient') || tags.includes('traditional')) score += 15;
  } else if (userScores.tradition < -2) {
    if (tags.includes('innovative') || tags.includes('experimental')) score += 15;
  }

  // Purity dimension
  if (userScores.purity > 2) {
    if (tags.includes('pure') || tags.includes('blessed')) score += 15;
  } else if (userScores.purity < -2) {
    if (tags.includes('corrupted') || tags.includes('daemon')) score += 15;
    if (tags.includes('mutant') || tags.includes('corruption')) score += 10;
  }

  // Speed dimension
  if (userScores.speed > 2) {
    if (tags.includes('fast') || tags.includes('flying')) score += 15;
    if (tags.includes('scout') || tags.includes('ambush')) score += 10;
    if (tags.includes('cavalry') || tags.includes('mobile')) score += 10;
  } else if (userScores.speed < -2) {
    if (tags.includes('tough') || tags.includes('armored')) score += 15;
    if (tags.includes('artillery') || tags.includes('static')) score += 10;
    if (tags.includes('slow')) score += 10;
  }

  // Mystery dimension
  if (userScores.mystery > 2) {
    if (tags.includes('psychic') || tags.includes('magic')) score += 15;
    if (tags.includes('ethereal') || tags.includes('mysterious')) score += 10;
  }

  // Versatility dimension
  if (userScores.versatility > 2) {
    if (tags.includes('versatile') || tags.includes('adaptive')) score += 15;
    if (tags.includes('balanced')) score += 10;
  } else if (userScores.versatility < -2) {
    if (tags.includes('specialist') || tags.includes('focused')) score += 15;
  }

  // Humanity dimension
  if (userScores.humanity > 2) {
    if (tags.includes('human') || tags.includes('humanoid')) score += 15;
  } else if (userScores.humanity < -2) {
    if (tags.includes('alien') || tags.includes('monster')) score += 15;
    if (tags.includes('daemon') || tags.includes('robot')) score += 10;
    if (tags.includes('beast')) score += 10;
  }

  // Leadership dimension
  if (userScores.leadership > 2) {
    if (tags.includes('commander') || tags.includes('leader')) score += 15;
    if (tags.includes('inspiring') || tags.includes('hero')) score += 10;
  } else if (userScores.leadership < -2) {
    if (tags.includes('autonomous') || tags.includes('independent')) score += 15;
  }

  return Math.min(100, Math.max(0, score));
};