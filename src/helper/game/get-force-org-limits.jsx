// Force Organization rules (scaled by points)
  export const getForceOrgLimits = (points,gameSystem) => {
   return {
    maxHeroes: Math.floor(('age-of-fantasy' === gameSystem) ? points / 375 : points / 500),
    maxCopies: (1 + Math.floor(('age-of-fantasy' === gameSystem) ? points / 750 : points / 1000)),
    maxUnitCost: Math.floor(points * 0.35),
    maxUnits: Math.floor(points / (('age-of-fantasy' === gameSystem) ?  150: 200))
  }
  };