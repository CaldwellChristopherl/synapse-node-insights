export // Personality Archetypes
const ARCHETYPES = [
  {
    id: "overwhelming-force",
    name: "The Overwhelming Force",
    icon: "⚔️",
    description: "You believe in crushing your enemies through sheer weight of numbers. Why send one soldier when you can send a hundred?",
    conditions: (scores) => scores.elite < -1 && scores.patience < 0,
    playstyle: "Horde armies, expendable troops, attrition warfare"
  },
  {
    id: "elite-strikeforce",
    name: "The Elite Strikeforce",
    icon: "🎯",
    description: "Quality over quantity. Each of your warriors is worth ten of the enemy, and you use them with surgical precision.",
    conditions: (scores) => scores.elite > 2 && scores.speed > 1,
    playstyle: "Few powerful units, alpha strikes, decisive engagements"
  },
  {
    id: "immovable-wall",
    name: "The Immovable Wall",
    icon: "🛡️",
    description: "Let them come. Your defenses are unbreakable, and every enemy charge breaks upon your shields like waves on rock.",
    conditions: (scores) => scores.patience > 2 && scores.speed < 0,
    playstyle: "Defensive positions, attrition, counter-attacks"
  },
  {
    id: "shadow-hand",
    name: "The Shadow Hand",
    icon: "🗡️",
    description: "The best battles are won before the enemy knows they've begun. Strike from the shadows, disappear before retaliation.",
    conditions: (scores) => scores.subtlety > 2 && scores.mystery > 1,
    playstyle: "Infiltrators, assassins, psychological warfare"
  },
  {
    id: "faithful-crusade",
    name: "The Faithful Crusade",
    icon: "✨",
    description: "Your warriors fight with divine conviction. Faith shields them from fear, and righteous fury drives them forward.",
    conditions: (scores) => scores.faith > 3 && scores.purity > 1,
    playstyle: "Zealots, divine support, unwavering morale"
  },
  {
    id: "iron-legion",
    name: "The Iron Legion",
    icon: "🔫",
    description: "Superior firepower wins wars. Your enemies fall before they can even reach your lines, cut down by disciplined volleys.",
    conditions: (scores) => scores.tech > 2 && scores.order > 2,
    playstyle: "Ranged dominance, artillery, combined arms"
  },
  {
    id: "chaos-tide",
    name: "The Chaos Tide",
    icon: "🌀",
    description: "Embrace the unpredictable. Your forces are a maelstrom of mutation and madness that no enemy can anticipate.",
    conditions: (scores) => scores.order < -2 && scores.purity < -2,
    playstyle: "Mutations, random abilities, psychological terror"
  },
  {
    id: "beast-master",
    name: "The Beast Master",
    icon: "🐉",
    description: "Why rely on fragile soldiers when monsters exist? Your army is a menagerie of terrifying creatures.",
    conditions: (scores) => scores.humanity < -2 && scores.tech < 0,
    playstyle: "Monsters, beasts, primal fury"
  },
  {
    id: "balanced-commander",
    name: "The Balanced Commander",
    icon: "⚖️",
    description: "Flexibility is the ultimate weapon. You adapt to any situation, countering enemy strategies with the perfect response.",
    conditions: (scores) => scores.versatility > 2 && Math.max(...Object.values(scores).map(Math.abs)) < 3,
    playstyle: "Mixed forces, tactical flexibility, adaptable strategies"
  },
  {
    id: "noble-knight",
    name: "The Noble Knight",
    icon: "👑",
    description: "Honor and glory guide your blade. You fight with chivalry, leading from the front as a beacon to your troops.",
    conditions: (scores) => scores.honor > 3 && scores.leadership > 2,
    playstyle: "Cavalry, heroic characters, honorable combat"
  },
  {
    id: "ancient-wisdom",
    name: "The Ancient Wisdom",
    icon: "📜",
    description: "The old ways hold power modern fools have forgotten. Tradition and accumulated wisdom guide your strategy.",
    conditions: (scores) => scores.tradition > 3 && scores.patience > 1,
    playstyle: "Time-tested tactics, ancestral power, methodical approach"
  },
  {
    id: "technological-supremacy",
    name: "The Technological Supremacy",
    icon: "⚙️",
    description: "Innovation conquers all. Your cutting-edge technology makes primitive weapons obsolete.",
    conditions: (scores) => scores.tech > 3 && scores.tradition < 0,
    playstyle: "Advanced weapons, vehicles, technological advantages"
  },
  {
    id: "pragmatic-general",
    name: "The Pragmatic General",
    icon: "🎖️",
    description: "You don't subscribe to any one philosophy. You assess each situation on its merits and respond accordingly.",
    conditions: () => true,
    playstyle: "Adaptable approach, situation-dependent tactics"
  }
];