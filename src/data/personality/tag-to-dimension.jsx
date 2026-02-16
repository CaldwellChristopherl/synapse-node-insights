// Tag-to-Dimension mapping for unit scoring
export const TAG_TO_DIMENSION = {
  // Patience (aggressive vs patient)
  aggressive: { patience: -3 }, patient: { patience: 3 }, defensive: { patience: 3 },
  static: { patience: 2 }, charge: { patience: -2 }, frenzy: { patience: -3 },
  // Collective (individual vs teamwork)
  swarm: { collective: 4 }, horde: { collective: 4 }, support: { collective: 2 },
  independent: { collective: -2 }, solo: { collective: -3 }, buff: { collective: 3 },
  aura: { collective: 3 }, synapse: { collective: 3 }, orders: { collective: 2 },
  collective: { collective: 3 },
  // Order (chaotic vs disciplined)
  disciplined: { order: 3 }, reliable: { order: 2 }, chaotic: { order: -3 },
  unpredictable: { order: -3 }, formation: { order: 3 }, random: { order: -2 },
  cunning: { subtlety: 2, honor: -2, order: -2 },
  // Tech (primitive vs technological)
  vehicle: { tech: 3 }, robot: { tech: 4, humanity: -2 }, drone: { tech: 3, humanity: -2 },
  warmachine: { tech: 3 },
  organic: { tech: -2 }, beast: { tech: -3, humanity: -2 }, tech: { tech: 3 },
  battlesuit: { tech: 4 }, aircraft: { tech: 3, speed: 3 },
  // Elite (horde vs few powerful)
  elite: { elite: 4 }, veteran: { elite: 3 }, cheap: { elite: -2 },
  expendable: { elite: -3 }, expensive: { elite: 3 }, devastating: { elite: 2 },
  // Honor (pragmatic vs honorable)
  honorable: { honor: 4 }, noble: { honor: 3 }, ruthless: { honor: -3 },
  treacherous: { honor: -4 }, poison: { honor: -2 }, assassin: { honor: -2 },
  // Faith (skeptical vs devout)
  zealot: { faith: 4 }, faithful: { faith: 3 }, fearless: { faith: 2 },
  daemon: { faith: 3, purity: -4, humanity: -4 }, prayer: { faith: 3 }, shrine: { faith: 3 },
  // Subtlety (direct vs cunning)
  stealth: { subtlety: 4 }, infiltrate: { subtlety: 4 }, scout: { subtlety: 3 },
  ambush: { subtlety: 3 }, sniper: { subtlety: 3 }, shadow: { subtlety: 3 },
  // Tradition (progressive vs traditional)
  ancient: { tradition: 4 }, traditional: { tradition: 3 }, innovative: { tradition: -3 },
  experimental: { tradition: -2 }, rune: { tradition: 3 },
  // Purity (embracing vs purist)
  pure: { purity: 4 }, corrupted: { purity: -4 }, corruption: { purity: -4 },
  mutant: { purity: -4 }, undead: { purity: -3 }, regenerate: { purity: -2 },
  // Speed (attrition vs alpha strike)
  fast: { speed: 4 }, mobile: { speed: 3 }, flying: { speed: 3 },
  cavalry: { speed: 3 }, slow: { speed: -2 }, jetbike: { speed: 4 },
  deepstrike: { speed: 2 }, tarpit: { speed: -3 },
  // Mystery (transparent vs enigmatic)
  mysterious: { mystery: 4 }, psychic: { mystery: 3 }, magic: { mystery: 3 },
  ethereal: { mystery: 4 }, spirit: { mystery: 3 }, summon: { mystery: 3 },
  // Versatility (specialist vs generalist)
  versatile: { versatility: 4 }, adaptive: { versatility: 3 },
  specialist: { versatility: -3 }, focused: { versatility: -2 },
  balanced: { versatility: 2 },
  // Humanity (monstrous vs humanoid)
  human: { humanity: 3 }, humanoid: { humanity: 2 }, alien: { humanity: -3 },
  monster: { humanity: -3 }, terror: { humanity: -3 },
  // Leadership (autonomous vs commander)
  commander: { leadership: 4 }, leader: { leadership: 3 }, inspiring: { leadership: 3 },
  leadership: { leadership: 3 }, autonomous: { leadership: -2 },
  // Additional common tags with mixed effects
  ranged: { patience: 1, tech: 1 }, melee: { patience: -1, tech: -1 },
  artillery: { patience: 2, tech: 2 }, tough: { patience: 1, elite: 1 },
  bodyguard: { collective: 2, honor: 1 }, transport: { collective: 2, versatility: 1 },
  indirect: { subtlety: 1, patience: 1 }, flame: { patience: -1, purity: 1 },
  hero: { leadership: 2, elite: 1 }, unique: { elite: 2, leadership: 1 },
  resilient: { patience: 2, elite: 1 }, armored: { patience: 1, elite: 1 },
};
