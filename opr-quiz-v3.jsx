import React, { useState, useEffect, useMemo } from 'react';

// Army Book API URLs
const ARMY_BOOK_URLS = {
  "grimdark-future": {
    "Alien Hives": "https://army-forge.onepagerules.com/api/army-books/w7qor7b2kuifcyvk?gameSystem=2&simpleMode=false",
    "Battle Brothers": "https://army-forge.onepagerules.com/api/army-books/78qp9l5alslt6yj8?gameSystem=2&simpleMode=false",
    "Blessed Sisters": "https://army-forge.onepagerules.com/api/army-books/7oi8zeiqfamiur21?gameSystem=2&simpleMode=false",
    "Custodian Brothers": "https://army-forge.onepagerules.com/api/army-books/ewbra8nv3nq3k27p?gameSystem=2&simpleMode=false",
    "DAO Union": "https://army-forge.onepagerules.com/api/army-books/z8205ez2boggzs22?gameSystem=2&simpleMode=false",
    "Dark Elf Raiders": "https://army-forge.onepagerules.com/api/army-books/q11la9v8h1heu9ja?gameSystem=2&simpleMode=false",
    "Dwarf Guilds": "https://army-forge.onepagerules.com/api/army-books/fk1mkbp8apvltu0z?gameSystem=2&simpleMode=false",
    "Elven Jesters": "https://army-forge.onepagerules.com/api/army-books/nyh41t82jugcdq8m?gameSystem=2&simpleMode=false",
    "Eternal Dynasty": "https://army-forge.onepagerules.com/api/army-books/vux1Y5vvULmaxZ8P?gameSystem=2&simpleMode=false",
    "Goblin Reclaimers": "https://army-forge.onepagerules.com/api/army-books/k5T0f2XIfpmPO28h?gameSystem=2&simpleMode=false",
    "Havoc Brothers": "https://army-forge.onepagerules.com/api/army-books/7o6om21wxlvvy3hq?gameSystem=2&simpleMode=false",
    "High Elf Fleets": "https://army-forge.onepagerules.com/api/army-books/7i7blhft75q9zfdc?gameSystem=2&simpleMode=false",
    "Human Defense Force": "https://army-forge.onepagerules.com/api/army-books/z65fgu0l29i4lnlu?gameSystem=2&simpleMode=false",
    "Human Inquisition": "https://army-forge.onepagerules.com/api/army-books/jpc0kyil0juwy602?gameSystem=2&simpleMode=false",
    "Infected Colonies": "https://army-forge.onepagerules.com/api/army-books/dnthspt7c0klhmt8?gameSystem=2&simpleMode=false",
    "Jackals": "https://army-forge.onepagerules.com/api/army-books/BKi_hJaJflN8ZorH?gameSystem=2&simpleMode=false",
    "Machine Cult": "https://army-forge.onepagerules.com/api/army-books/7el7k3hgy5pb9o9i?gameSystem=2&simpleMode=false",
    "Orc Marauders": "https://army-forge.onepagerules.com/api/army-books/1wj1ysgxpuuz9bc7?gameSystem=2&simpleMode=false",
    "Prime Brothers": "https://army-forge.onepagerules.com/api/army-books/oqnnu0gk8q6hyyny?gameSystem=2&simpleMode=false",
    "Ratmen Clans": "https://army-forge.onepagerules.com/api/army-books/hk70l4d471plza00?gameSystem=2&simpleMode=false",
    "Rebel Guerrillas": "https://army-forge.onepagerules.com/api/army-books/5wbcv465hacdwvkb?gameSystem=2&simpleMode=false",
    "Robot Legions": "https://army-forge.onepagerules.com/api/army-books/4k5amkxoybdiqotm?gameSystem=2&simpleMode=false",
    "Saurian Starhost": "https://army-forge.onepagerules.com/api/army-books/U6hwlur14RpnInZr?gameSystem=2&simpleMode=false",
    "Soul-Snatcher Cults": "https://army-forge.onepagerules.com/api/army-books/zz3kp5ry7ks6mxcx?gameSystem=2&simpleMode=false",
    "Titan Lords": "https://army-forge.onepagerules.com/api/army-books/3j10zage1lddt6sr?gameSystem=2&simpleMode=false",
    "Wormhole Daemons": "https://army-forge.onepagerules.com/api/army-books/04z57ua0bwth37zh?gameSystem=2&simpleMode=false"
  },
  "age-of-fantasy": {
    "Beastmen": "https://army-forge.onepagerules.com/api/army-books/TciwNI3AOMXAM-dr?gameSystem=4&simpleMode=false",
    "Chivalrous Kingdoms": "https://army-forge.onepagerules.com/api/army-books/FF4UemWHh60T1VRq?gameSystem=4&simpleMode=false",
    "Dark Elves": "https://army-forge.onepagerules.com/api/army-books/IKT625BeGZtF67EA?gameSystem=4&simpleMode=false",
    "Deep-Sea Elves": "https://army-forge.onepagerules.com/api/army-books/L1zCkfmeAongLj1X?gameSystem=4&simpleMode=false",
    "Duchies of Vinci": "https://army-forge.onepagerules.com/api/army-books/VU1EFPa2uODffW8D?gameSystem=4&simpleMode=false",
    "Dwarves": "https://army-forge.onepagerules.com/api/army-books/RJDq2ZD7wjlAcUVB?gameSystem=4&simpleMode=false",
    "Eternal Wardens": "https://army-forge.onepagerules.com/api/army-books/-MrGWaleoZR7pxIn?gameSystem=4&simpleMode=false",
    "Ghostly Undead": "https://army-forge.onepagerules.com/api/army-books/mdT4HVzHUmxGevc_?gameSystem=4&simpleMode=false",
    "Giant Tribes": "https://army-forge.onepagerules.com/api/army-books/HjmV6_v6dmBmEdy7?gameSystem=4&simpleMode=false",
    "Goblins": "https://army-forge.onepagerules.com/api/army-books/q9BQlBp583ZuuOnQ?gameSystem=4&simpleMode=false",
    "Halflings": "https://army-forge.onepagerules.com/api/army-books/0EXXlzFwAk3q1n5e?gameSystem=4&simpleMode=false",
    "Havoc Dwarves": "https://army-forge.onepagerules.com/api/army-books/8siLk9I6-H8lk78b?gameSystem=4&simpleMode=false",
    "Havoc Warriors": "https://army-forge.onepagerules.com/api/army-books/PGxKcq4R571OtwqD?gameSystem=4&simpleMode=false",
    "High Elves": "https://army-forge.onepagerules.com/api/army-books/bPAtRGFrpFfyAjLW?gameSystem=4&simpleMode=false",
    "Human Empire": "https://army-forge.onepagerules.com/api/army-books/jZ02AVPLx_S48Mnb?gameSystem=4&simpleMode=false",
    "Kingdom of Angels": "https://army-forge.onepagerules.com/api/army-books/RgHxqAlAXnUuF3ty?gameSystem=4&simpleMode=false",
    "Mummified Undead": "https://army-forge.onepagerules.com/api/army-books/t-sIke2snonFSL6Q?gameSystem=4&simpleMode=false",
    "Ogres": "https://army-forge.onepagerules.com/api/army-books/lpRj9EBwROpO1um7?gameSystem=4&simpleMode=false",
    "Orcs": "https://army-forge.onepagerules.com/api/army-books/AQSDPFVL1DiNNnSU?gameSystem=4&simpleMode=false",
    "Ossified Undead": "https://army-forge.onepagerules.com/api/army-books/a_HXTYv06IFtSs9G?gameSystem=4&simpleMode=false",
    "Ratmen": "https://army-forge.onepagerules.com/api/army-books/tOWt5fgqK2nfpoBN?gameSystem=4&simpleMode=false",
    "Rift Daemons": "https://army-forge.onepagerules.com/api/army-books/yxVDySKYQYRhdEgA?gameSystem=4&simpleMode=false",
    "Saurians": "https://army-forge.onepagerules.com/api/army-books/BubhE1kUpgYbqZvW?gameSystem=4&simpleMode=false",
    "Shadow Stalkers": "https://army-forge.onepagerules.com/api/army-books/gHTrjw-g76vfGCSt?gameSystem=4&simpleMode=false",
    "Sky-City Dwarves": "https://army-forge.onepagerules.com/api/army-books/AcDXPPXmWrgHChlS?gameSystem=4&simpleMode=false",
    "Vampiric Undead": "https://army-forge.onepagerules.com/api/army-books/qABIfXYbYxmA75yL?gameSystem=4&simpleMode=false",
    "Volcanic Dwarves": "https://army-forge.onepagerules.com/api/army-books/Ir5XtqTM8JS3YEAJ?gameSystem=4&simpleMode=false",
    "Wood Elves": "https://army-forge.onepagerules.com/api/army-books/qtuyeoRfXKlNflK0?gameSystem=4&simpleMode=false"
  }
};

// Personality Archetypes
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
    conditions: (scores) => scores.versatility > 2,
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
  }
];

// Faction dimension scores
const FACTION_DATA = {
  "grimdark-future": {
    "Alien Hives": {
      dimensionScores: { patience: -1, collective: 5, order: 3, tech: -3, elite: -3, honor: -3, faith: 0, subtlety: 2, tradition: -2, purity: -4, speed: 3, mystery: 3, versatility: 4, humanity: -5, leadership: 3 },
      description: "The swarm hungers. Adaptation is survival.",
      themes: ["swarm", "evolution", "bio-organic", "collective"]
    },
    "Battle Brothers": {
      dimensionScores: { patience: 2, collective: 4, order: 4, tech: 3, elite: 3, honor: 4, faith: 4, subtlety: -2, tradition: 4, purity: 4, speed: 1, mystery: 1, versatility: 4, humanity: 2, leadership: 4 },
      description: "Honor. Duty. Brotherhood eternal.",
      themes: ["elite", "brotherhood", "honor", "power-armor"]
    },
    "Blessed Sisters": {
      dimensionScores: { patience: 1, collective: 4, order: 5, tech: 2, elite: 2, honor: 4, faith: 5, subtlety: -1, tradition: 4, purity: 5, speed: 1, mystery: 2, versatility: 3, humanity: 3, leadership: 3 },
      description: "Faith is our shield. Flame purifies all.",
      themes: ["faith", "fire", "zealotry", "purity"]
    },
    "Custodian Brothers": {
      dimensionScores: { patience: 3, collective: 2, order: 5, tech: 4, elite: 5, honor: 5, faith: 3, subtlety: -1, tradition: 5, purity: 5, speed: 1, mystery: 3, versatility: 2, humanity: 2, leadership: 5 },
      description: "Perfection incarnate. Guardians of eternity.",
      themes: ["elite", "perfection", "guardians", "ancient"]
    },
    "DAO Union": {
      dimensionScores: { patience: 3, collective: 5, order: 3, tech: 4, elite: 0, honor: 2, faith: 1, subtlety: 2, tradition: -2, purity: 2, speed: 2, mystery: 2, versatility: 5, humanity: 4, leadership: 3 },
      description: "Unity through diversity. Progress through cooperation.",
      themes: ["alliance", "diversity", "cooperation", "adaptable"]
    },
    "Dark Elf Raiders": {
      dimensionScores: { patience: -2, collective: 2, order: 1, tech: 2, elite: 2, honor: -4, faith: -2, subtlety: 4, tradition: 1, purity: -2, speed: 4, mystery: 3, versatility: 3, humanity: 1, leadership: 1 },
      description: "Pain is currency. Suffering is art.",
      themes: ["raiders", "speed", "cruelty", "pirates"]
    },
    "Dwarf Guilds": {
      dimensionScores: { patience: 4, collective: 4, order: 4, tech: 5, elite: 2, honor: 4, faith: 2, subtlety: -2, tradition: 5, purity: 3, speed: -2, mystery: 1, versatility: 3, humanity: 3, leadership: 3 },
      description: "Craft perfected over millennia. Grudges remembered forever.",
      themes: ["technology", "tradition", "grudges", "craftsmanship"]
    },
    "Elven Jesters": {
      dimensionScores: { patience: 0, collective: 2, order: -3, tech: 2, elite: 3, honor: -3, faith: -1, subtlety: 5, tradition: -3, purity: -2, speed: 5, mystery: 5, versatility: 4, humanity: 0, leadership: 0 },
      description: "Reality bends to our whims. Madness is truth.",
      themes: ["trickery", "chaos", "speed", "psychic"]
    },
    "Eternal Dynasty": {
      dimensionScores: { patience: 5, collective: 4, order: 5, tech: 5, elite: 2, honor: 2, faith: 1, subtlety: 1, tradition: 5, purity: 4, speed: 0, mystery: 4, versatility: 3, humanity: -4, leadership: 4 },
      description: "We ruled before. We shall rule again.",
      themes: ["ancient", "resurrection", "technology", "immortal"]
    },
    "Goblin Reclaimers": {
      dimensionScores: { patience: -2, collective: 4, order: -2, tech: 3, elite: -3, honor: -2, faith: 1, subtlety: 2, tradition: -3, purity: -3, speed: 3, mystery: 1, versatility: 4, humanity: 2, leadership: 1 },
      description: "Everything has value. Everything can be salvaged.",
      themes: ["scavengers", "horde", "improvised", "cunning"]
    },
    "Havoc Brothers": {
      dimensionScores: { patience: -2, collective: 2, order: -4, tech: 2, elite: 2, honor: -4, faith: 4, subtlety: 1, tradition: -4, purity: -5, speed: 2, mystery: 3, versatility: 4, humanity: -1, leadership: 2 },
      description: "The gods demand blood. We deliver.",
      themes: ["chaos", "corruption", "mutation", "dark-gods"]
    },
    "High Elf Fleets": {
      dimensionScores: { patience: 2, collective: 3, order: 3, tech: 4, elite: 3, honor: 3, faith: 2, subtlety: 2, tradition: 3, purity: 3, speed: 3, mystery: 3, versatility: 4, humanity: 2, leadership: 3 },
      description: "Grace in all things. Excellence without exception.",
      themes: ["elegance", "precision", "fleet", "psychic"]
    },
    "Human Defense Force": {
      dimensionScores: { patience: 2, collective: 5, order: 4, tech: 2, elite: -2, honor: 2, faith: 2, subtlety: -1, tradition: 2, purity: 2, speed: 0, mystery: 0, versatility: 5, humanity: 5, leadership: 4 },
      description: "Humanity's shield. Countless and unbreaking.",
      themes: ["combined-arms", "numbers", "tanks", "artillery"]
    },
    "Human Inquisition": {
      dimensionScores: { patience: 1, collective: 3, order: 4, tech: 3, elite: 2, honor: 1, faith: 5, subtlety: 3, tradition: 3, purity: 5, speed: 1, mystery: 4, versatility: 5, humanity: 3, leadership: 4 },
      description: "Heresy must burn. None escape judgment.",
      themes: ["witch-hunters", "faith", "investigation", "zealotry"]
    },
    "Infected Colonies": {
      dimensionScores: { patience: 2, collective: 5, order: 2, tech: 1, elite: -1, honor: -2, faith: 3, subtlety: 3, tradition: -2, purity: -5, speed: 1, mystery: 4, versatility: 3, humanity: 1, leadership: 2 },
      description: "The blessing spreads. Join the congregation.",
      themes: ["infection", "corruption", "cult", "transformation"]
    },
    "Jackals": {
      dimensionScores: { patience: -3, collective: 2, order: -2, tech: 1, elite: 0, honor: -3, faith: 1, subtlety: 2, tradition: -3, purity: -2, speed: 4, mystery: 2, versatility: 3, humanity: 2, leadership: 0 },
      description: "Speed is survival. Take everything.",
      themes: ["raiders", "speed", "scavengers", "nomads"]
    },
    "Machine Cult": {
      dimensionScores: { patience: 3, collective: 4, order: 5, tech: 5, elite: 1, honor: 2, faith: 4, subtlety: 0, tradition: 4, purity: 3, speed: 0, mystery: 3, versatility: 3, humanity: -2, leadership: 3 },
      description: "Flesh is weak. The machine endures.",
      themes: ["technology", "cyborgs", "worship", "mechanical"]
    },
    "Orc Marauders": {
      dimensionScores: { patience: -4, collective: 3, order: -3, tech: 1, elite: -1, honor: 0, faith: 1, subtlety: -4, tradition: 1, purity: 0, speed: 3, mystery: 0, versatility: 3, humanity: 1, leadership: 2 },
      description: "WAAAGH! Might makes right!",
      themes: ["brutality", "speed", "improvised", "melee"]
    },
    "Prime Brothers": {
      dimensionScores: { patience: 2, collective: 4, order: 4, tech: 4, elite: 4, honor: 4, faith: 3, subtlety: -1, tradition: 3, purity: 4, speed: 2, mystery: 2, versatility: 4, humanity: 2, leadership: 4 },
      description: "The next evolution. Humanity perfected.",
      themes: ["elite", "new-generation", "versatile", "superior"]
    },
    "Ratmen Clans": {
      dimensionScores: { patience: 0, collective: 4, order: -1, tech: 4, elite: -2, honor: -4, faith: 2, subtlety: 4, tradition: -2, purity: -3, speed: 2, mystery: 3, versatility: 4, humanity: 0, leadership: 2 },
      description: "Numbers are strength. Treachery is wisdom.",
      themes: ["horde", "technology", "treachery", "underworld"]
    },
    "Rebel Guerrillas": {
      dimensionScores: { patience: 1, collective: 3, order: 1, tech: 2, elite: 0, honor: 1, faith: 2, subtlety: 3, tradition: -1, purity: 1, speed: 2, mystery: 2, versatility: 5, humanity: 4, leadership: 2 },
      description: "Freedom at any cost. Fight the power.",
      themes: ["guerrilla", "resistance", "freedom", "adaptable"]
    },
    "Robot Legions": {
      dimensionScores: { patience: 4, collective: 5, order: 5, tech: 5, elite: 3, honor: 0, faith: -2, subtlety: 0, tradition: 4, purity: 5, speed: 0, mystery: 4, versatility: 2, humanity: -5, leadership: 4 },
      description: "Cold logic. Perfect efficiency. Eternal patience.",
      themes: ["machines", "logic", "immortal", "relentless"]
    },
    "Saurian Starhost": {
      dimensionScores: { patience: 3, collective: 4, order: 4, tech: 3, elite: 1, honor: 3, faith: 4, subtlety: 0, tradition: 5, purity: 3, speed: 1, mystery: 4, versatility: 3, humanity: -2, leadership: 4 },
      description: "The great plan unfolds. Destiny awaits.",
      themes: ["dinosaurs", "prophecy", "ancient", "cosmic"]
    },
    "Soul-Snatcher Cults": {
      dimensionScores: { patience: 2, collective: 4, order: 2, tech: 2, elite: 0, honor: -3, faith: 3, subtlety: 5, tradition: -2, purity: -3, speed: 2, mystery: 5, versatility: 3, humanity: 1, leadership: 2 },
      description: "The harvest approaches. Souls are currency.",
      themes: ["cult", "infiltration", "xenos", "hybrid"]
    },
    "Titan Lords": {
      dimensionScores: { patience: 1, collective: 1, order: 2, tech: 4, elite: 5, honor: 1, faith: 2, subtlety: -3, tradition: 2, purity: 0, speed: 1, mystery: 2, versatility: 2, humanity: 0, leadership: 3 },
      description: "Engines of war. Mountains that walk.",
      themes: ["titans", "knights", "war-machines", "nobility"]
    },
    "Wormhole Daemons": {
      dimensionScores: { patience: -2, collective: 2, order: -5, tech: -3, elite: 2, honor: -5, faith: 5, subtlety: 1, tradition: -5, purity: -5, speed: 2, mystery: 5, versatility: 3, humanity: -5, leadership: 2 },
      description: "Reality tears. Madness pours through.",
      themes: ["daemons", "warp", "chaos", "horror"]
    }
  },
  "age-of-fantasy": {
    "Beastmen": {
      dimensionScores: { patience: -2, collective: 3, order: -3, tech: -4, elite: -1, honor: -3, faith: 2, subtlety: 2, tradition: 2, purity: -3, speed: 3, mystery: 2, versatility: 3, humanity: -2, leadership: 1 },
      description: "The wild calls. Civilization must fall.",
      themes: ["primal", "ambush", "beasts", "nature"]
    },
    "Chivalrous Kingdoms": {
      dimensionScores: { patience: 1, collective: 3, order: 3, tech: 0, elite: 2, honor: 4, faith: 3, subtlety: -2, tradition: 4, purity: 2, speed: 2, mystery: 0, versatility: 3, humanity: 4, leadership: 4 },
      description: "For honor and glory! The realm endures.",
      themes: ["knights", "honor", "feudal", "cavalry"]
    },
    "Dark Elves": {
      dimensionScores: { patience: 0, collective: 2, order: 2, tech: 1, elite: 2, honor: -4, faith: -1, subtlety: 3, tradition: 2, purity: -1, speed: 4, mystery: 3, versatility: 3, humanity: 0, leadership: 2 },
      description: "Freedom through strength. Mercy is weakness.",
      themes: ["pirates", "monsters", "raiders", "independence"]
    },
    "Deep-Sea Elves": {
      dimensionScores: { patience: 2, collective: 3, order: 4, tech: 2, elite: 3, honor: -2, faith: 2, subtlety: 2, tradition: 3, purity: 1, speed: 2, mystery: 5, versatility: 2, humanity: -1, leadership: 4 },
      description: "Knowledge is power. The depths hide secrets.",
      themes: ["underwater", "magic", "monsters", "knowledge"]
    },
    "Duchies of Vinci": {
      dimensionScores: { patience: 2, collective: 3, order: 3, tech: 5, elite: 1, honor: 1, faith: 0, subtlety: 1, tradition: -2, purity: 2, speed: 1, mystery: 2, versatility: 4, humanity: 4, leadership: 3 },
      description: "Innovation conquers all. The future is ours.",
      themes: ["renaissance", "automatons", "invention", "crossbows"]
    },
    "Dwarves": {
      dimensionScores: { patience: 4, collective: 4, order: 5, tech: 4, elite: 2, honor: 4, faith: 2, subtlety: -3, tradition: 5, purity: 4, speed: -3, mystery: 1, versatility: 2, humanity: 3, leadership: 3 },
      description: "The mountain stands. Oaths are eternal.",
      themes: ["defensive", "grudges", "runes", "artillery"]
    },
    "Eternal Wardens": {
      dimensionScores: { patience: 2, collective: 3, order: 4, tech: 3, elite: 4, honor: 3, faith: 3, subtlety: 0, tradition: 2, purity: 3, speed: 1, mystery: 3, versatility: 3, humanity: 1, leadership: 4 },
      description: "Guardians of the gate. Defenders of all realms.",
      themes: ["elite", "planar", "magical", "defenders"]
    },
    "Ghostly Undead": {
      dimensionScores: { patience: 3, collective: 4, order: 2, tech: -2, elite: 2, honor: -2, faith: 3, subtlety: 3, tradition: 3, purity: -3, speed: 2, mystery: 5, versatility: 2, humanity: -4, leadership: 3 },
      description: "Death is not the end. The spirits hunger.",
      themes: ["ethereal", "fear", "undead", "incorporeal"]
    },
    "Giant Tribes": {
      dimensionScores: { patience: -1, collective: 2, order: -2, tech: -3, elite: 4, honor: 0, faith: 1, subtlety: -4, tradition: 2, purity: 0, speed: 1, mystery: 1, versatility: 2, humanity: 1, leadership: 2 },
      description: "Bigger is better. Crush them all.",
      themes: ["giants", "mercenaries", "brute-force", "monstrous"]
    },
    "Goblins": {
      dimensionScores: { patience: -2, collective: 4, order: -3, tech: 2, elite: -4, honor: -3, faith: 1, subtlety: 3, tradition: -2, purity: -2, speed: 3, mystery: 2, versatility: 4, humanity: 1, leadership: 0 },
      description: "Numbers win wars. Cunning wins battles.",
      themes: ["horde", "trickery", "expendable", "cunning"]
    },
    "Halflings": {
      dimensionScores: { patience: 2, collective: 4, order: 2, tech: 2, elite: -1, honor: 2, faith: 2, subtlety: 2, tradition: 3, purity: 2, speed: 1, mystery: 1, versatility: 4, humanity: 4, leadership: 2 },
      description: "Home is worth fighting for. Never underestimate us.",
      themes: ["underdogs", "community", "inventive", "determined"]
    },
    "Havoc Dwarves": {
      dimensionScores: { patience: 2, collective: 3, order: 3, tech: 3, elite: 2, honor: -3, faith: 4, subtlety: -1, tradition: 3, purity: -4, speed: -2, mystery: 2, versatility: 2, humanity: -1, leadership: 3 },
      description: "Forge-fire and dark pacts. Vengeance eternal.",
      themes: ["corruption", "industry", "grudges", "dark-magic"]
    },
    "Havoc Warriors": {
      dimensionScores: { patience: -2, collective: 2, order: -3, tech: 0, elite: 1, honor: -4, faith: 4, subtlety: 0, tradition: -3, purity: -5, speed: 2, mystery: 2, versatility: 4, humanity: -1, leadership: 2 },
      description: "Blood for the gods! Let havoc reign!",
      themes: ["chaos", "mutation", "warriors", "dark-gods"]
    },
    "High Elves": {
      dimensionScores: { patience: 2, collective: 3, order: 3, tech: 2, elite: 3, honor: 3, faith: 2, subtlety: 1, tradition: 4, purity: 3, speed: 3, mystery: 2, versatility: 4, humanity: 2, leadership: 3 },
      description: "Grace and glory. The old ways endure.",
      themes: ["cavalry", "magic", "archers", "nobility"]
    },
    "Human Empire": {
      dimensionScores: { patience: 2, collective: 4, order: 4, tech: 2, elite: 0, honor: 2, faith: 3, subtlety: 0, tradition: 3, purity: 2, speed: 1, mystery: 0, versatility: 5, humanity: 5, leadership: 4 },
      description: "Unity is strength. The Empire prevails.",
      themes: ["combined-arms", "faith", "gunpowder", "versatile"]
    },
    "Kingdom of Angels": {
      dimensionScores: { patience: 1, collective: 4, order: 5, tech: 1, elite: 2, honor: 3, faith: 5, subtlety: -1, tradition: 3, purity: 5, speed: 2, mystery: 3, versatility: 3, humanity: 2, leadership: 4 },
      description: "Divine light guides us. Heresy shall burn.",
      themes: ["angels", "faith", "zealotry", "divine"]
    },
    "Mummified Undead": {
      dimensionScores: { patience: 4, collective: 4, order: 4, tech: 1, elite: 0, honor: 1, faith: 3, subtlety: 0, tradition: 5, purity: -2, speed: -1, mystery: 4, versatility: 3, humanity: -3, leadership: 4 },
      description: "The ancient kingdom rises. Eternity serves us.",
      themes: ["ancient", "constructs", "undead", "desert"]
    },
    "Ogres": {
      dimensionScores: { patience: -1, collective: 2, order: -1, tech: -1, elite: 3, honor: 0, faith: 1, subtlety: -3, tradition: 2, purity: 0, speed: 1, mystery: 1, versatility: 2, humanity: 1, leadership: 1 },
      description: "Strength decides. The strong feast.",
      themes: ["mercenaries", "brute-force", "eating", "cavalry"]
    },
    "Orcs": {
      dimensionScores: { patience: -3, collective: 3, order: -2, tech: 0, elite: 0, honor: 1, faith: 2, subtlety: -3, tradition: 2, purity: 0, speed: 2, mystery: 0, versatility: 3, humanity: 1, leadership: 2 },
      description: "WAAAGH! Green is best!",
      themes: ["brutality", "melee", "tribal", "savage"]
    },
    "Ossified Undead": {
      dimensionScores: { patience: 4, collective: 5, order: 5, tech: 2, elite: 0, honor: 0, faith: 2, subtlety: -1, tradition: 4, purity: -3, speed: -1, mystery: 4, versatility: 2, humanity: -5, leadership: 4 },
      description: "Death is only the beginning. March eternal.",
      themes: ["skeleton", "horde", "necromancy", "relentless"]
    },
    "Ratmen": {
      dimensionScores: { patience: 0, collective: 4, order: -1, tech: 4, elite: -2, honor: -4, faith: 2, subtlety: 4, tradition: -1, purity: -4, speed: 2, mystery: 3, versatility: 4, humanity: 0, leadership: 2 },
      description: "Yes-yes! Scheme and multiply!",
      themes: ["horde", "warpstone", "treachery", "technology"]
    },
    "Rift Daemons": {
      dimensionScores: { patience: -1, collective: 2, order: -4, tech: -2, elite: 2, honor: -5, faith: 5, subtlety: 1, tradition: -4, purity: -5, speed: 2, mystery: 5, versatility: 4, humanity: -5, leadership: 2 },
      description: "The rift opens. Reality bends to our will.",
      themes: ["daemons", "chaos", "magic", "horror"]
    },
    "Saurians": {
      dimensionScores: { patience: 3, collective: 4, order: 4, tech: 1, elite: 1, honor: 3, faith: 4, subtlety: 0, tradition: 5, purity: 3, speed: 1, mystery: 4, versatility: 3, humanity: -3, leadership: 4 },
      description: "The Great Plan unfolds. Destiny calls.",
      themes: ["dinosaurs", "prophecy", "magic", "ancient"]
    },
    "Shadow Stalkers": {
      dimensionScores: { patience: 2, collective: 3, order: 2, tech: 2, elite: 2, honor: 0, faith: 1, subtlety: 4, tradition: 1, purity: 0, speed: 2, mystery: 5, versatility: 3, humanity: -3, leadership: 2 },
      description: "From shadow we strike. Fear is our weapon.",
      themes: ["alien", "terror", "stealth", "otherworldly"]
    },
    "Sky-City Dwarves": {
      dimensionScores: { patience: 2, collective: 3, order: 3, tech: 5, elite: 2, honor: 2, faith: 1, subtlety: 0, tradition: 3, purity: 2, speed: 2, mystery: 2, versatility: 3, humanity: 3, leadership: 2 },
      description: "Above the clouds, we endure. Innovation soars.",
      themes: ["airships", "technology", "trade", "sky-cities"]
    },
    "Vampiric Undead": {
      dimensionScores: { patience: 3, collective: 3, order: 3, tech: 0, elite: 3, honor: -2, faith: 2, subtlety: 3, tradition: 4, purity: -4, speed: 2, mystery: 4, versatility: 3, humanity: -2, leadership: 4 },
      description: "Immortality has its privileges. Bow before your betters.",
      themes: ["vampires", "nobility", "undead", "dark-magic"]
    },
    "Volcanic Dwarves": {
      dimensionScores: { patience: 1, collective: 3, order: 2, tech: 2, elite: 2, honor: -1, faith: 4, subtlety: -2, tradition: 3, purity: -2, speed: 1, mystery: 2, versatility: 2, humanity: 1, leadership: 2 },
      description: "Fire and fury! The mountain's wrath unleashed!",
      themes: ["fire", "berserkers", "volcanic", "aggressive"]
    },
    "Wood Elves": {
      dimensionScores: { patience: 2, collective: 3, order: 2, tech: 0, elite: 2, honor: 1, faith: 3, subtlety: 3, tradition: 5, purity: 3, speed: 3, mystery: 3, versatility: 2, humanity: 1, leadership: 2 },
      description: "The forest watches. Trespassers beware.",
      themes: ["archers", "nature", "forest", "guerrilla"]
    }
  }
};

// Tag-to-Dimension mapping for unit scoring
const TAG_TO_DIMENSION = {
  // Patience (aggressive vs patient)
  aggressive: { patience: -3 }, patient: { patience: 3 }, defensive: { patience: 3 },
  static: { patience: 2 }, charge: { patience: -2 }, frenzy: { patience: -3 },
  // Collective (individual vs teamwork)
  swarm: { collective: 4 }, horde: { collective: 4 }, support: { collective: 2 },
  independent: { collective: -2 }, solo: { collective: -3 }, buff: { collective: 3 },
  aura: { collective: 3 }, synapse: { collective: 3 }, orders: { collective: 2 },
  // Order (chaotic vs disciplined)
  disciplined: { order: 3 }, reliable: { order: 2 }, chaotic: { order: -3 },
  unpredictable: { order: -3 }, formation: { order: 3 }, random: { order: -2 },
  // Tech (primitive vs technological)
  vehicle: { tech: 3 }, robot: { tech: 4 }, drone: { tech: 3 }, warmachine: { tech: 3 },
  organic: { tech: -2 }, beast: { tech: -3 }, tech: { tech: 3 }, battlesuit: { tech: 4 },
  // Elite (horde vs few powerful)
  elite: { elite: 4 }, veteran: { elite: 3 }, cheap: { elite: -2 },
  expendable: { elite: -3 }, expensive: { elite: 3 }, devastating: { elite: 2 },
  // Honor (pragmatic vs honorable)
  honorable: { honor: 4 }, noble: { honor: 3 }, ruthless: { honor: -3 },
  treacherous: { honor: -4 }, poison: { honor: -2 }, assassin: { honor: -2 },
  // Faith (skeptical vs devout)
  zealot: { faith: 4 }, faithful: { faith: 3 }, fearless: { faith: 2 },
  daemon: { faith: 3 }, prayer: { faith: 3 }, shrine: { faith: 3 },
  // Subtlety (direct vs cunning)
  stealth: { subtlety: 4 }, infiltrate: { subtlety: 4 }, scout: { subtlety: 3 },
  ambush: { subtlety: 3 }, sniper: { subtlety: 3 }, shadow: { subtlety: 3 },
  // Tradition (progressive vs traditional)
  ancient: { tradition: 4 }, traditional: { tradition: 3 }, innovative: { tradition: -3 },
  experimental: { tradition: -2 }, rune: { tradition: 3 },
  // Purity (embracing vs purist)
  pure: { purity: 4 }, corruption: { purity: -4 }, mutant: { purity: -4 },
  undead: { purity: -3 }, regenerate: { purity: -2 },
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
  hero: { leadership: 2, elite: 1 }, unique: { elite: 2, leadership: 1 }
};

// Dimension metadata for display
const DIMENSION_INFO = {
  patience: { name: "Patience", low: "Aggressive", high: "Patient", color: "#ef4444" },
  collective: { name: "Collective", low: "Independent", high: "Team-Oriented", color: "#f97316" },
  order: { name: "Order", low: "Chaotic", high: "Disciplined", color: "#eab308" },
  tech: { name: "Technology", low: "Primal", high: "High-Tech", color: "#84cc16" },
  elite: { name: "Elite", low: "Horde", high: "Elite", color: "#22c55e" },
  honor: { name: "Honor", low: "Pragmatic", high: "Honorable", color: "#14b8a6" },
  faith: { name: "Faith", low: "Skeptical", high: "Devout", color: "#06b6d4" },
  subtlety: { name: "Subtlety", low: "Direct", high: "Subtle", color: "#0ea5e9" },
  tradition: { name: "Tradition", low: "Progressive", high: "Traditional", color: "#3b82f6" },
  purity: { name: "Purity", low: "Embracing", high: "Purist", color: "#6366f1" },
  speed: { name: "Speed", low: "Attrition", high: "Alpha Strike", color: "#8b5cf6" },
  mystery: { name: "Mystery", low: "Transparent", high: "Enigmatic", color: "#a855f7" },
  versatility: { name: "Versatility", low: "Specialist", high: "Generalist", color: "#d946ef" },
  humanity: { name: "Humanity", low: "Monstrous", high: "Humanoid", color: "#ec4899" },
  leadership: { name: "Leadership", low: "Autonomous", high: "Commander", color: "#f43f5e" }
};

// Fun, lighthearted personality questions - no war references!
const QUESTIONS = [
  {
    id: 1,
    text: "Your pizza is taking FOREVER to arrive. What's your move? 🍕",
    dimension: "patience",
    weight: 1.0,
    options: [
      { text: "Already called twice and I'm hangry", value: -4 },
      { text: "Checking the app every 30 seconds", value: -1 },
      { text: "Made a snack, it'll get here when it gets here", value: 2 },
      { text: "Perfect time to reorganize my spice rack", value: 4 },
      { text: "I ordered 2 hours early specifically for this", value: 5 }
    ]
  },
  {
    id: 2,
    text: "Dream vacation style? ✈️",
    dimension: "collective",
    weight: 0.6,
    options: [
      { text: "Solo backpacking - just me and the unknown", value: -4 },
      { text: "Me plus one ride-or-die bestie", value: -1 },
      { text: "Small group of close friends", value: 2 },
      { text: "Big family reunion trip - the more the merrier!", value: 4 },
      { text: "Massive group tour - instant community!", value: 5 }
    ]
  },
  {
    id: 3,
    text: "Peek at your desk/workspace right now... 👀",
    dimension: "order",
    weight: 1.6,
    options: [
      { text: "Chaos is a ladder. I know where everything is... mostly", value: -5 },
      { text: "Creative clutter - organized mess", value: -2 },
      { text: "Reasonably tidy with a few piles", value: 1 },
      { text: "Everything has its designated spot", value: 3 },
      { text: "Color-coded, labeled, museum-level pristine", value: 5 }
    ]
  },
  {
    id: 4,
    text: "Your ideal smart home situation? 🏠",
    dimension: "tech",
    weight: 1.1,
    options: [
      { text: "Cabin in the woods, no wifi, bliss", value: -4 },
      { text: "Minimal tech - plants and natural light", value: -2 },
      { text: "Normal amount of gadgets I guess?", value: 1 },
      { text: "Voice-controlled everything, obviously", value: 3 },
      { text: "Full automation - my house basically runs itself", value: 5 }
    ]
  },
  {
    id: 5,
    text: "You're building a fantasy sports team. Strategy? 🏆",
    dimension: "elite",
    weight: 1.2,
    options: [
      { text: "Maximum roster depth - quantity has quality", value: -4 },
      { text: "Solid starters with lots of bench options", value: -1 },
      { text: "Balanced approach to stars and depth", value: 1 },
      { text: "Stack the starters, worry about depth later", value: 3 },
      { text: "ALL the superstars, bench who?", value: 5 }
    ]
  },
  {
    id: 6,
    text: "You find $100 on the ground with someone's ID nearby 💵",
    dimension: "honor",
    weight: 1.6,
    options: [
      { text: "Finders keepers, they should be more careful", value: -5 },
      { text: "Keep the cash, mail back the ID", value: -2 },
      { text: "Depends... do they look like they need it?", value: 0 },
      { text: "Return everything and feel great about it", value: 3 },
      { text: "Track them down personally to return it", value: 5 }
    ]
  },
  {
    id: 7,
    text: "How do you make big life decisions? 🤔",
    dimension: "faith",
    weight: 0.9,
    options: [
      { text: "Spreadsheets, pros/cons lists, data only", value: -3 },
      { text: "Research heavily, then decide logically", value: -1 },
      { text: "Mix of research and gut feeling", value: 1 },
      { text: "Trust my instincts - they haven't failed me", value: 3 },
      { text: "The universe guides me, I just listen", value: 5 }
    ]
  },
  {
    id: 8,
    text: "You need to tell a friend their new haircut is... not great 💇",
    dimension: "subtlety",
    weight: 1.4,
    options: [
      { text: "\"Wow, that's certainly... a choice you made\"", value: -4 },
      { text: "Be honest but gentle - they asked!", value: -1 },
      { text: "Focus on what DOES work about it", value: 1 },
      { text: "\"Have you tried styling it differently?\"", value: 3 },
      { text: "Compliment something else, change subject forever", value: 5 }
    ]
  },
  {
    id: 9,
    text: "Grandma's secret recipe - what do you do with it? 👵",
    dimension: "tradition",
    weight: 1.1,
    options: [
      { text: "Completely reinvent it with modern twists", value: -5 },
      { text: "Use it as inspiration for something new", value: -2 },
      { text: "Keep the base, add my own flair", value: 1 },
      { text: "Follow it closely with tiny improvements", value: 3 },
      { text: "Make it EXACTLY as written, it's sacred", value: 5 }
    ]
  },
  {
    id: 10,
    text: "Pineapple on pizza? 🍍",
    dimension: "purity",
    weight: 1.7,
    options: [
      { text: "Put anything on pizza! Chaos is delicious!", value: -5 },
      { text: "I'll try weird toppings, why not?", value: -2 },
      { text: "Not my thing but you do you", value: 0 },
      { text: "Pizza should stay relatively traditional", value: 3 },
      { text: "Absolutely not. Some things are sacred.", value: 5 }
    ]
  },
  {
    id: 11,
    text: "Morning routine vibes? ☀️",
    dimension: "speed",
    weight: 0.8,
    options: [
      { text: "Slow morning coffee ritual, no rushing", value: -3 },
      { text: "Steady and predictable, plenty of time", value: -1 },
      { text: "Depends on the day honestly", value: 1 },
      { text: "Quick and efficient, time is precious", value: 3 },
      { text: "Speed run every morning, sleep is priority", value: 5 }
    ]
  },
  {
    id: 12,
    text: "Your social media presence is... 📱",
    dimension: "mystery",
    weight: 1.0,
    options: [
      { text: "An open book - stories, posts, live updates", value: -2 },
      { text: "Pretty active, people know what I'm up to", value: 0 },
      { text: "Selective sharing of the highlights", value: 2 },
      { text: "Mostly lurking with occasional mysterious posts", value: 4 },
      { text: "Ghost mode - no photos, no info, no trace", value: 5 }
    ]
  },
  {
    id: 13,
    text: "At a buffet, you... 🍽️",
    dimension: "versatility",
    weight: 0.6,
    options: [
      { text: "Beeline to my ONE favorite thing, pile it high", value: -3 },
      { text: "Focus on a few dishes I know I love", value: -1 },
      { text: "Strategic variety - best of each station", value: 2 },
      { text: "Try a little of everything available", value: 4 },
      { text: "Must. Sample. EVERYTHING. Multiple trips.", value: 5 }
    ]
  },
  {
    id: 14,
    text: "If you could be any creature in a fantasy world? 🐉",
    dimension: "humanity",
    weight: 1.6,
    options: [
      { text: "Something truly alien - eldritch horror vibes", value: -5 },
      { text: "Dragon, giant spider, or kraken please", value: -2 },
      { text: "Centaur or merfolk - half and half", value: 0 },
      { text: "Elf, dwarf - humanoid but special", value: 2 },
      { text: "Human with cool magic powers", value: 5 }
    ]
  },
  {
    id: 15,
    text: "Group project time! You naturally... 📚",
    dimension: "leadership",
    weight: 0.8,
    options: [
      { text: "Do my part independently, merge at the end", value: -2 },
      { text: "Contribute ideas but let others organize", value: 0 },
      { text: "Take initiative when needed", value: 2 },
      { text: "Create the timeline and delegate tasks", value: 4 },
      { text: "I AM the project manager now", value: 5 }
    ]
  },
  {
    id: 16,
    text: "Playing board games with family... 🎲",
    dimension: "honor",
    weight: 1.6,
    options: [
      { text: "All's fair in love and Monopoly", value: -4 },
      { text: "Bend the rules creatively when I can", value: -1 },
      { text: "Play to win but keep it friendly", value: 1 },
      { text: "Strict rule follower - no house rules!", value: 3 },
      { text: "I'd rather lose than win unfairly", value: 5 }
    ]
  },
  {
    id: 17,
    text: "Your dream car vibes? 🚗",
    dimension: "tech",
    weight: 1.1,
    options: [
      { text: "Classic vintage, mechanical, soulful", value: -4 },
      { text: "Simple and reliable, no frills needed", value: -2 },
      { text: "Modern comfort with reasonable tech", value: 0 },
      { text: "Latest features, all the smart stuff", value: 3 },
      { text: "Fully autonomous, basically a spaceship", value: 5 }
    ]
  },
  {
    id: 18,
    text: "Friend is going through a breakup. You... 💔",
    dimension: "collective",
    weight: 0.6,
    options: [
      { text: "Send a supportive text, give them space", value: -3 },
      { text: "Check in but let them process solo", value: -1 },
      { text: "Offer to hang whenever they're ready", value: 2 },
      { text: "Show up with ice cream, no questions", value: 4 },
      { text: "Rally the whole friend group for support", value: 5 }
    ]
  },
  {
    id: 19,
    text: "You're stuck in a never-ending meeting... 😴",
    dimension: "patience",
    weight: 1.0,
    options: [
      { text: "Interrupt to wrap it up, we all have lives", value: -4 },
      { text: "Visibly checking my watch/phone", value: -1 },
      { text: "Mentally checked out but politely present", value: 1 },
      { text: "Finding something useful in the discussion", value: 3 },
      { text: "Genuinely engaged - meetings have value!", value: 5 }
    ]
  },
  {
    id: 20,
    text: "Horoscopes, tarot, fortune cookies? 🔮",
    dimension: "mystery",
    weight: 1.0,
    options: [
      { text: "Complete nonsense, show me the data", value: -2 },
      { text: "Fun but not something I take seriously", value: 0 },
      { text: "Interesting to think about sometimes", value: 2 },
      { text: "There's something to it, I pay attention", value: 4 },
      { text: "The universe speaks in mysterious ways", value: 5 }
    ]
  },
  {
    id: 21,
    text: "Shopping style for a special occasion outfit? 👔",
    dimension: "elite",
    weight: 1.2,
    options: [
      { text: "Thrift stores - treasure hunting is half the fun", value: -4 },
      { text: "Budget-friendly with one splurge piece", value: -1 },
      { text: "Mid-range, good quality for the price", value: 1 },
      { text: "Invest in quality pieces that last", value: 3 },
      { text: "Designer only - this is important!", value: 5 }
    ]
  },
  {
    id: 22,
    text: "Someone cuts in line right in front of you 😤",
    dimension: "subtlety",
    weight: 1.4,
    options: [
      { text: "\"HEY! End of the line, buddy!\"", value: -3 },
      { text: "Firmly but politely point out the line", value: -1 },
      { text: "Loudly mention to my friend how lines work", value: 1 },
      { text: "Strategic coughing and pointed staring", value: 3 },
      { text: "Silently judge while doing nothing", value: 4 }
    ]
  },
  {
    id: 23,
    text: "How do you feel about people who don't recycle? ♻️",
    dimension: "purity",
    weight: 1.7,
    options: [
      { text: "To each their own, not my business", value: -4 },
      { text: "I notice but don't say anything", value: -1 },
      { text: "I recycle but won't preach about it", value: 1 },
      { text: "I'd gently encourage better habits", value: 3 },
      { text: "HOW CAN THEY LIVE WITH THEMSELVES", value: 5 }
    ]
  },
  {
    id: 24,
    text: "What keeps you going through tough times? 💪",
    dimension: "faith",
    weight: 0.9,
    options: [
      { text: "Logic and problem-solving - emotions later", value: -3 },
      { text: "Making a plan and executing it", value: 0 },
      { text: "Support from friends and family", value: 2 },
      { text: "Believing things happen for a reason", value: 4 },
      { text: "Faith that the universe has my back", value: 5 }
    ]
  },
  {
    id: 25,
    text: "Texting style? 📲",
    dimension: "speed",
    weight: 0.8,
    options: [
      { text: "I'll respond when I respond, no rush", value: -3 },
      { text: "Usually reply within a few hours", value: -1 },
      { text: "Depends who's texting honestly", value: 1 },
      { text: "Pretty quick, I like staying connected", value: 3 },
      { text: "Instant reply gang - phone in hand 24/7", value: 5 }
    ]
  },
  {
    id: 26,
    text: "The restaurant you've been going to for years changes the menu 📋",
    dimension: "tradition",
    weight: 1.1,
    options: [
      { text: "Finally! Time to try new things!", value: -4 },
      { text: "Excited to explore the new options", value: -1 },
      { text: "Hope they kept some classics", value: 1 },
      { text: "Low-key upset, I had my order perfected", value: 3 },
      { text: "Devastated. Why fix what isn't broken?!", value: 5 }
    ]
  },
  {
    id: 27,
    text: "Planning a party - your approach? 🎉",
    dimension: "order",
    weight: 1.6,
    options: [
      { text: "Wing it! Best parties are spontaneous", value: -4 },
      { text: "Basic plan but go with the flow", value: -1 },
      { text: "Have a structure with room for flexibility", value: 2 },
      { text: "Detailed timeline and backup plans", value: 4 },
      { text: "Spreadsheet with contingencies for everything", value: 5 }
    ]
  },
  {
    id: 28,
    text: "At a restaurant, ordering is... 🍜",
    dimension: "versatility",
    weight: 0.6,
    options: [
      { text: "The same thing I always get, perfection found", value: -2 },
      { text: "Rotate between my top 3 favorites", value: 0 },
      { text: "Depends on my mood that day", value: 3 },
      { text: "Always trying something new", value: 4 },
      { text: "\"What's the weirdest thing on the menu?\"", value: 5 }
    ]
  },
  {
    id: 29,
    text: "Lost in a new city with friends - you... 🗺️",
    dimension: "leadership",
    weight: 0.8,
    options: [
      { text: "Follow whoever seems confident", value: -1 },
      { text: "Offer suggestions but don't push", value: 1 },
      { text: "Take turns navigating with the group", value: 3 },
      { text: "Pull up maps and take charge", value: 4 },
      { text: "I'm the navigator now, follow me!", value: 5 }
    ]
  },
  {
    id: 30,
    text: "Your pet (or dream pet) would be... 🐾",
    dimension: "humanity",
    weight: 1.6,
    options: [
      { text: "Something exotic - tarantula, snake, scorpion", value: -4 },
      { text: "Unusual but cool - ferret, hedgehog, lizard", value: -1 },
      { text: "Classic but interesting - bird, rabbit, fish", value: 2 },
      { text: "Cat - independent but affectionate", value: 3 },
      { text: "Dog - loyal best friend energy", value: 5 }
    ]
  }
];

// Army point presets
const POINT_PRESETS = [
  { label: "Skirmish", value: 500 },
  { label: "Standard", value: 1000 },
  { label: "Large", value: 1500 },
  { label: "Epic", value: 2000 },
  { label: "Apocalypse", value: 3000 }
];

// Helper functions
const extractTags = (unit) => {
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

const calculateMatchScore = (userScores, factionScores) => {
  let totalScore = 0;
  let maxPossible = 0;
  Object.keys(userScores).forEach(dim => {
    const userVal = userScores[dim];
    const factionVal = factionScores[dim];
    const diff = Math.abs(userVal - factionVal);
    totalScore += 10 - diff;
    maxPossible += 10;
  });
  return Math.round((totalScore / maxPossible) * 100);
};

const scoreUnit = (unit, userScores) => {
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

// Main Component
export default function OPRQuiz() {
  const [gameSystem, setGameSystem] = useState('grimdark-future');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [factionData, setFactionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFactionPicker, setShowFactionPicker] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [armyPoints, setArmyPoints] = useState(1000);
  const [armyList, setArmyList] = useState([]);
  const [activeTab, setActiveTab] = useState('matches');
  const [savedResults, setSavedResults] = useState(null);

  // Calculate user dimension scores
  const userScores = useMemo(() => {
    const scores = {};
    QUESTIONS.forEach(q => {
      if (answers[q.id] !== undefined) {
        const weight = q.weight || 1;
        scores[q.dimension] = (scores[q.dimension] || 0) + (answers[q.id] * weight);
      }
    });
    Object.keys(scores).forEach(dim => {
      scores[dim] = Math.max(-5, Math.min(5, scores[dim] / 2));
    });
    return scores;
  }, [answers]);

  // Detect personality archetype
  const detectedArchetype = useMemo(() => {
    if (Object.keys(userScores).length === 0) return null;
    for (const arch of ARCHETYPES) {
      if (arch.conditions(userScores)) return arch;
    }
    return ARCHETYPES.find(a => a.id === 'balanced-commander');
  }, [userScores]);

  // Calculate faction matches
  const factionMatches = useMemo(() => {
    if (Object.keys(userScores).length === 0) return [];
    const factions = FACTION_DATA[gameSystem];
    return Object.entries(factions)
      .map(([name, data]) => ({
        name,
        ...data,
        matchScore: calculateMatchScore(userScores, data.dimensionScores)
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [userScores, gameSystem]);

  // Force Organization rules (scaled by points)
  const getForceOrgLimits = (points) => {
    if (points <= 500) return { maxHeroes: 1, maxCopies: 2, maxUnitCost: 250, maxUnits: 5 };
    if (points <= 1000) return { maxHeroes: 2, maxCopies: 3, maxUnitCost: 400, maxUnits: 7 };
    if (points <= 1500) return { maxHeroes: 3, maxCopies: 3, maxUnitCost: 500, maxUnits: 8 };
    if (points <= 2000) return { maxHeroes: 4, maxCopies: 3, maxUnitCost: 700, maxUnits: 10 };
    return { maxHeroes: 5, maxCopies: 4, maxUnitCost: 900, maxUnits: 15 }; // 3000+
  };

  // Recommended units - computed from faction data
  const recommendedUnits = useMemo(() => {
    if (!factionData?.units) return [];
    return factionData.units
      .map(unit => ({
        ...unit,
        personalityScore: scoreUnit(unit, userScores),
        tags: extractTags(unit)
      }))
      .sort((a, b) => b.personalityScore - a.personalityScore);
  }, [factionData, userScores]);

  // Build army list with force organization rules
  useEffect(() => {
    if (!recommendedUnits.length) {
      setArmyList([]);
      return;
    }
    
    const limits = getForceOrgLimits(armyPoints);
    const list = [];
    let remaining = armyPoints;
    const unitCounts = {}; // Track copies of each unit
    let heroCount = 0;
    
    // Sort units: heroes first (by personality), then non-heroes (by personality)
    const heroes = recommendedUnits.filter(u => u.rules?.some(r => r.name === 'Hero'));
    const troops = recommendedUnits.filter(u => !u.rules?.some(r => r.name === 'Hero'));
    
    // Add heroes (up to limit)
    for (const hero of heroes) {
      if (heroCount >= limits.maxHeroes) break;
      if (hero.cost > limits.maxUnitCost) continue;
      if (hero.cost > remaining) continue;
      
      const copies = unitCounts[hero.id] || 0;
      if (copies >= limits.maxCopies) continue;
      
      list.push({ ...hero, quantity: 1 });
      unitCounts[hero.id] = copies + 1;
      remaining -= hero.cost;
      heroCount++;
    }
    
    // Fill with troops - allow multiples!
    let iterations = 0;
    const maxIterations = 50; // Prevent infinite loops
    
    while (remaining >= 50 && list.length < limits.maxUnits && iterations < maxIterations) {
      iterations++;
      let addedUnit = false;
      
      for (const unit of troops) {
        if (unit.cost > limits.maxUnitCost) continue;
        if (unit.cost > remaining) continue;
        if (list.length >= limits.maxUnits) break;
        
        const copies = unitCounts[unit.id] || 0;
        if (copies >= limits.maxCopies) continue;
        
        // Check if we already have this unit in the list
        const existingIdx = list.findIndex(u => u.id === unit.id);
        
        if (existingIdx >= 0) {
          // Increment quantity of existing unit
          list[existingIdx].quantity = (list[existingIdx].quantity || 1) + 1;
        } else {
          // Add new unit entry
          list.push({ ...unit, quantity: 1 });
        }
        
        unitCounts[unit.id] = copies + 1;
        remaining -= unit.cost;
        addedUnit = true;
        break; // Restart loop to re-evaluate best options
      }
      
      if (!addedUnit) break; // No more units can be added
    }
    
    // Consolidate list - group by unit and sum quantities
    const consolidated = [];
    const seen = new Set();
    for (const unit of list) {
      if (seen.has(unit.id)) continue;
      seen.add(unit.id);
      const totalQty = list.filter(u => u.id === unit.id).reduce((sum, u) => sum + (u.quantity || 1), 0);
      consolidated.push({ ...unit, quantity: totalQty });
    }
    
    setArmyList(consolidated);
  }, [recommendedUnits, armyPoints]);

  // Fetch faction data - generates units based on faction personality
  const handleSelectFaction = (factionName) => {
    setSelectedFaction(factionName);
    setLoading(true);
    
    // Generate units based on faction personality
    const factionInfo = FACTION_DATA[gameSystem][factionName];
    const scores = factionInfo?.dimensionScores || {};
    const isElite = scores.elite > 2;
    const isHorde = scores.elite < -2;
    const isFast = scores.speed > 2;
    const isTech = scores.tech > 2;
    const isMagic = scores.mystery > 2;
    const isPure = scores.purity > 2;
    const isChaos = scores.order < -2;
    const isDefensive = scores.patience > 2;
    const isSubtle = scores.subtlety > 2;
    
    const units = [
      // HEROES
      { id: 'h1', name: `${factionName} Warlord`, cost: isElite ? 180 : 120, size: 1, quality: 3, defense: 3,
        rules: [{ name: 'Hero' }, { name: 'Tough', rating: 3 }], weapons: [{ range: 0, attacks: 4 }] },
      { id: 'h2', name: `${factionName} Captain`, cost: isElite ? 140 : 95, size: 1, quality: 3, defense: 4,
        rules: [{ name: 'Hero' }, { name: 'Tough', rating: 3 }], weapons: [{ range: 0, attacks: 3 }] },
      isMagic ? { id: 'h3', name: `${factionName} Sorcerer`, cost: 110, size: 1, quality: 4, defense: 5,
        rules: [{ name: 'Hero' }, { name: 'Caster' }], weapons: [{ range: 18, attacks: 2 }] } : null,
      isFast ? { id: 'h4', name: `${factionName} Swift Lord`, cost: 130, size: 1, quality: 3, defense: 4,
        rules: [{ name: 'Hero' }, { name: 'Fast' }, { name: 'Tough', rating: 3 }], weapons: [{ range: 0, attacks: 3 }] } : null,
      
      // CORE TROOPS (can take multiples)
      { id: 't1', name: `${factionName} Warriors`, cost: isHorde ? 65 : (isElite ? 140 : 100), 
        size: isHorde ? 20 : (isElite ? 5 : 10), quality: isElite ? 4 : 5, defense: isElite ? 4 : 5,
        rules: [], weapons: [{ range: 0, attacks: 1 }] },
      isTech ? { id: 't2', name: `${factionName} Gunners`, cost: 110, size: 10, quality: 4, defense: 5,
        rules: [{ name: 'Relentless' }], weapons: [{ range: 24, attacks: 1 }] } :
        { id: 't2', name: `${factionName} Berserkers`, cost: 100, size: 10, quality: 4, defense: 6,
          rules: [{ name: 'Fearless' }], weapons: [{ range: 0, attacks: 2 }] },
      isHorde ? { id: 't3', name: `${factionName} Mob`, cost: 45, size: 20, quality: 6, defense: 6,
        rules: [], weapons: [{ range: 0, attacks: 1 }] } : null,
      isSubtle ? { id: 't4', name: `${factionName} Scouts`, cost: 80, size: 5, quality: 4, defense: 5,
        rules: [{ name: 'Scout' }, { name: 'Stealth' }], weapons: [{ range: 18, attacks: 1 }] } : null,
        
      // ELITE UNITS
      { id: 'e1', name: `${factionName} Veterans`, cost: isElite ? 185 : 145, size: 5, quality: 3, defense: 3,
        rules: [{ name: 'Tough', rating: 3 }], weapons: [{ range: 0, attacks: 2 }] },
      isFast ? { id: 'e2', name: `${factionName} Cavalry`, cost: 160, size: 5, quality: 3, defense: 4,
        rules: [{ name: 'Fast' }, { name: 'Impact', rating: 1 }], weapons: [{ range: 0, attacks: 2 }] } : null,
      isPure ? { id: 'e3', name: `${factionName} Purifiers`, cost: 150, size: 5, quality: 3, defense: 4,
        rules: [{ name: 'Fearless' }], weapons: [{ range: 12, attacks: 2 }] } : null,
      isChaos ? { id: 'e4', name: `${factionName} Mutants`, cost: 125, size: 5, quality: 4, defense: 4,
        rules: [{ name: 'Regeneration' }], weapons: [{ range: 0, attacks: 3 }] } : null,
      isMagic ? { id: 'e5', name: `${factionName} Acolytes`, cost: 130, size: 5, quality: 4, defense: 5,
        rules: [{ name: 'Caster' }], weapons: [{ range: 12, attacks: 1 }] } : null,
        
      // HEAVY SUPPORT
      { id: 'v1', name: `${factionName} Monster`, cost: 180, size: 1, quality: 4, defense: 3,
        rules: [{ name: 'Tough', rating: 6 }, { name: 'Fear' }], weapons: [{ range: 0, attacks: 4 }] },
      isTech ? { id: 'v2', name: `${factionName} Artillery`, cost: 135, size: 1, quality: 4, defense: 4,
        rules: [{ name: 'Relentless' }], weapons: [{ range: 36, attacks: 2 }] } : null,
      isDefensive ? { id: 'v3', name: `${factionName} Ironclad`, cost: 200, size: 3, quality: 4, defense: 2,
        rules: [{ name: 'Tough', rating: 6 }], weapons: [{ range: 0, attacks: 2 }] } : null,
      { id: 'v4', name: `${factionName} Elite Guard`, cost: 220, size: 3, quality: 3, defense: 2,
        rules: [{ name: 'Tough', rating: 3 }], weapons: [{ range: 0, attacks: 3 }] },
      isTech ? { id: 'v5', name: `${factionName} Walker`, cost: 250, size: 1, quality: 4, defense: 2,
        rules: [{ name: 'Tough', rating: 6 }], weapons: [{ range: 24, attacks: 4 }] } : null,
    ].filter(Boolean);
    
    // Small delay to show loading state
    setTimeout(() => {
      setFactionData({ name: factionName, units });
      setLoading(false);
    }, 300);
  };

  const handleAnswer = (value) => {
    setFadeIn(false);
    setTimeout(() => {
      setAnswers({ ...answers, [QUESTIONS[currentQuestion].id]: value });
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResults(true);
      }
      setFadeIn(true);
    }, 200);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setSelectedFaction(null);
    setFactionData(null);
    setShowFactionPicker(false);
    setArmyList([]);
    setActiveTab('matches');
  };

  const switchGameSystem = (system) => {
    setGameSystem(system);
    setSelectedFaction(null);
    setFactionData(null);
    setShowFactionPicker(false);
    setArmyList([]);
  };

  // Save results
  const saveResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      gameSystem,
      userScores,
      archetype: detectedArchetype,
      topFactions: factionMatches.slice(0, 5),
      selectedFaction,
      armyList: armyList.map(u => ({ name: u.name, cost: u.cost, quantity: u.quantity })),
      armyPoints
    };
    setSavedResults(results);
    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('opr-quiz-results') || '[]');
    saved.unshift(results);
    localStorage.setItem('opr-quiz-results', JSON.stringify(saved.slice(0, 10)));
    alert('Results saved!');
  };

  // Export for AI analysis
  const exportForAI = () => {
    const totalPoints = armyList.reduce((sum, u) => sum + (u.cost * u.quantity), 0);
    const exportData = {
      title: "OPR Army Alignment Quiz Results",
      exportDate: new Date().toISOString(),
      gameSystem: gameSystem === 'grimdark-future' ? 'Grimdark Future' : 'Age of Fantasy',
      personalityProfile: {
        archetype: detectedArchetype ? {
          name: detectedArchetype.name,
          description: detectedArchetype.description,
          playstyle: detectedArchetype.playstyle
        } : null,
        dimensionScores: Object.entries(userScores).map(([dim, score]) => ({
          dimension: DIMENSION_INFO[dim].name,
          score: Math.round(score * 10) / 10,
          interpretation: score > 2 ? DIMENSION_INFO[dim].high : score < -2 ? DIMENSION_INFO[dim].low : 'Balanced'
        }))
      },
      factionRecommendations: factionMatches.slice(0, 10).map(f => ({
        faction: f.name,
        matchPercentage: f.matchScore,
        description: f.description,
        themes: f.themes
      })),
      selectedArmy: selectedFaction ? {
        faction: selectedFaction,
        pointLimit: armyPoints,
        forceOrgLimits: armyPoints <= 500 ? "500pts: 1 hero, 2 copies max, 5 units" :
                        armyPoints <= 1000 ? "1000pts: 2 heroes, 3 copies max, 7 units" :
                        armyPoints <= 1500 ? "1500pts: 3 heroes, 3 copies max, 8 units" :
                        armyPoints <= 2000 ? "2000pts: 4 heroes, 3 copies max, 10 units" :
                        "3000pts: 5 heroes, 4 copies max, 15 units",
        units: armyList.map(u => ({
          name: u.name,
          quantity: u.quantity,
          costEach: u.cost,
          totalCost: u.cost * u.quantity,
          modelCount: u.size * u.quantity,
          personalityFit: u.personalityScore,
          rules: u.rules?.map(r => r.name + (r.rating ? `(${r.rating})` : '')),
          tags: u.tags?.slice(0, 5)
        })),
        totalPoints,
        totalUnits: armyList.reduce((sum, u) => sum + u.quantity, 0),
        totalModels: armyList.reduce((sum, u) => sum + (u.size * u.quantity), 0)
      } : null,
      analysisPrompt: `Please analyze this OPR Army Alignment Quiz result. The user's personality archetype is "${detectedArchetype?.name}" with a playstyle of "${detectedArchetype?.playstyle}". Their top faction match is ${factionMatches[0]?.name} at ${factionMatches[0]?.matchScore}% compatibility. Their ${armyPoints}pt army has ${armyList.reduce((s,u) => s + u.quantity, 0)} units totaling ${totalPoints} points. Please provide: 1) An analysis of their tactical personality, 2) Suggestions for how to build armies that match their playstyle, 3) Tips for playing to their strengths, 4) Potential weaknesses to be aware of, and 5) Specific tactics that would work well with this army composition.`
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opr-quiz-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render game system toggle
  const GameSystemToggle = () => (
    <div className="flex justify-center gap-2 mb-8">
      <button
        onClick={() => switchGameSystem('grimdark-future')}
        className={`px-6 py-3 rounded-lg font-bold text-sm tracking-wider transition-all duration-300 ${
          gameSystem === 'grimdark-future'
            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-900/50'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        }`}
      >
        GRIMDARK FUTURE
      </button>
      <button
        onClick={() => switchGameSystem('age-of-fantasy')}
        className={`px-6 py-3 rounded-lg font-bold text-sm tracking-wider transition-all duration-300 ${
          gameSystem === 'age-of-fantasy'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/50'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        }`}
      >
        AGE OF FANTASY
      </button>
    </div>
  );

  // Dimension bar component
  const DimensionBar = ({ dimension, score }) => {
    const info = DIMENSION_INFO[dimension];
    const percentage = ((score + 5) / 10) * 100;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-zinc-500">{info.low}</span>
          <span className="text-zinc-400 font-medium">{info.name}</span>
          <span className="text-zinc-500">{info.high}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: info.color
            }}
          />
        </div>
        <div className="text-right text-xs text-zinc-600 mt-0.5">
          {score > 0 ? '+' : ''}{score.toFixed(1)}
        </div>
      </div>
    );
  };

  // Question card
  const QuestionCard = () => (
    <div className={`transition-opacity duration-200 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-zinc-500 text-sm font-mono">
            QUESTION {currentQuestion + 1} OF {QUESTIONS.length}
          </span>
          <span className="text-zinc-600 text-xs uppercase tracking-widest">
            {DIMENSION_INFO[QUESTIONS[currentQuestion].dimension]?.name}
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1 mb-6">
          <div 
            className={`h-1 rounded-full transition-all duration-500 ${
              gameSystem === 'grimdark-future' 
                ? 'bg-gradient-to-r from-red-600 to-orange-500' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-500'
            }`}
            style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
          {QUESTIONS[currentQuestion].text}
        </h2>
      </div>
      <div className="space-y-3">
        {QUESTIONS[currentQuestion].options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option.value)}
            className="w-full text-left p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700/50 transition-all duration-200 group"
          >
            <span className="text-zinc-300 group-hover:text-white transition-colors">
              {option.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // Results view
  const ResultsView = () => (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {['matches', 'personality', 'army'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab 
                ? gameSystem === 'grimdark-future'
                  ? 'text-red-400 border-b-2 border-red-400'
                  : 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab === 'matches' && 'Faction Matches'}
            {tab === 'personality' && 'Your Profile'}
            {tab === 'army' && 'Army Builder'}
          </button>
        ))}
      </div>

      {/* Archetype Display */}
      {detectedArchetype && activeTab !== 'army' && (
        <div className={`p-4 rounded-xl border ${
          gameSystem === 'grimdark-future' 
            ? 'bg-red-900/20 border-red-800' 
            : 'bg-emerald-900/20 border-emerald-800'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{detectedArchetype.icon}</span>
            <div>
              <h3 className="font-bold text-white">{detectedArchetype.name}</h3>
              <p className="text-xs text-zinc-400">{detectedArchetype.playstyle}</p>
            </div>
          </div>
          <p className="text-sm text-zinc-300 italic">"{detectedArchetype.description}"</p>
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Your Top Faction Matches</h3>
          {factionMatches.slice(0, 5).map((faction, idx) => (
            <button
              key={faction.name}
              onClick={() => handleSelectFaction(faction.name)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                selectedFaction === faction.name
                  ? gameSystem === 'grimdark-future'
                    ? 'bg-red-900/30 border-red-500'
                    : 'bg-emerald-900/30 border-emerald-500'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${
                    idx === 0 
                      ? gameSystem === 'grimdark-future' ? 'text-red-400' : 'text-emerald-400'
                      : 'text-zinc-500'
                  }`}>#{idx + 1}</span>
                  <h4 className="font-bold text-white">{faction.name}</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  faction.matchScore >= 80 ? 'bg-green-900/50 text-green-400' :
                  faction.matchScore >= 60 ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-zinc-700 text-zinc-400'
                }`}>{faction.matchScore}%</span>
              </div>
              <p className="text-zinc-400 text-sm italic mb-2">"{faction.description}"</p>
              <div className="flex flex-wrap gap-1">
                {faction.themes.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-zinc-700/50 rounded text-xs text-zinc-500">{t}</span>
                ))}
              </div>
            </button>
          ))}
          <button
            onClick={() => setShowFactionPicker(true)}
            className="w-full text-center text-zinc-500 hover:text-zinc-300 py-2 underline"
          >
            Browse all {Object.keys(FACTION_DATA[gameSystem]).length} factions →
          </button>
        </div>
      )}

      {/* Personality Tab */}
      {activeTab === 'personality' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Your Personality Profile</h3>
          <div className="grid gap-1">
            {Object.entries(userScores).map(([dim, score]) => (
              <DimensionBar key={dim} dimension={dim} score={score} />
            ))}
          </div>
        </div>
      )}

      {/* Army Tab */}
      {activeTab === 'army' && (
        <div className="space-y-6">
          {/* Points Selector */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Army Points</label>
            <div className="flex gap-2 flex-wrap">
              {POINT_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setArmyPoints(p.value)}
                  className={`px-3 py-1.5 rounded text-sm transition-all ${
                    armyPoints === p.value
                      ? gameSystem === 'grimdark-future'
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {p.label} ({p.value})
                </button>
              ))}
            </div>
          </div>

          {/* Faction Selection */}
          {!selectedFaction ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 mb-4">Select a faction to build an army</p>
              <button
                onClick={() => setActiveTab('matches')}
                className={`px-4 py-2 rounded-lg ${
                  gameSystem === 'grimdark-future'
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                } text-white transition-colors`}
              >
                View Faction Matches →
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className={`w-12 h-12 border-4 rounded-full animate-spin mb-4 ${
                gameSystem === 'grimdark-future' ? 'border-red-600 border-t-transparent' : 'border-emerald-600 border-t-transparent'
              }`} />
              <p className="text-zinc-500">Generating army list...</p>
            </div>
          ) : (
            <>
              {/* Force Org Info */}
              {(() => {
                const limits = armyPoints <= 500 ? { h: 1, c: 2, u: 5 } :
                              armyPoints <= 1000 ? { h: 2, c: 3, u: 7 } :
                              armyPoints <= 1500 ? { h: 3, c: 3, u: 8 } :
                              armyPoints <= 2000 ? { h: 4, c: 3, u: 10 } :
                              { h: 5, c: 4, u: 15 };
                const heroCount = armyList.filter(u => u.rules?.some(r => r.name === 'Hero')).reduce((s, u) => s + u.quantity, 0);
                const unitCount = armyList.reduce((s, u) => s + u.quantity, 0);
                return (
                  <div className="flex gap-4 text-xs text-zinc-500 bg-zinc-800/30 rounded-lg p-2">
                    <span>Heroes: <span className={heroCount > limits.h ? 'text-red-400' : 'text-zinc-300'}>{heroCount}/{limits.h}</span></span>
                    <span>Units: <span className={unitCount > limits.u ? 'text-red-400' : 'text-zinc-300'}>{unitCount}/{limits.u}</span></span>
                    <span>Max copies: {limits.c}</span>
                  </div>
                );
              })()}
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedFaction}</h3>
                  <p className="text-xs text-zinc-500">Units matched to your personality</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    gameSystem === 'grimdark-future' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {armyList.reduce((s, u) => s + (u.cost * u.quantity), 0)}
                  </span>
                  <span className="text-zinc-500"> / {armyPoints} pts</span>
                </div>
              </div>
              
              {armyList.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <p>No units available. Try selecting a different faction.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {armyList.map((unit, idx) => (
                    <div key={unit.id || idx} className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {unit.quantity > 1 && (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              gameSystem === 'grimdark-future' ? 'bg-red-900/50 text-red-300' : 'bg-emerald-900/50 text-emerald-300'
                            }`}>×{unit.quantity}</span>
                          )}
                          <div>
                            <span className="font-medium text-white">{unit.name}</span>
                            <span className="text-xs text-zinc-500 ml-2">
                              ({unit.size} model{unit.size > 1 ? 's' : ''} each)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500">
                            {unit.quantity > 1 ? `${unit.cost}×${unit.quantity} = ${unit.cost * unit.quantity}` : unit.cost} pts
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            unit.personalityScore >= 70 ? 'bg-green-900/50 text-green-400' :
                            unit.personalityScore >= 50 ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-zinc-700 text-zinc-400'
                          }`}>{unit.personalityScore}%</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {unit.rules?.filter(r => r.name !== 'Hero').slice(0, 3).map((r, i) => (
                          <span key={i} className={`px-1.5 py-0.5 rounded text-xs ${
                            gameSystem === 'grimdark-future' ? 'bg-red-900/30 text-red-400' : 'bg-emerald-900/30 text-emerald-400'
                          }`}>{r.name}{r.rating ? `(${r.rating})` : ''}</span>
                        ))}
                        {unit.tags?.slice(0, 3).map((t, i) => (
                          <span key={`t${i}`} className="px-1.5 py-0.5 bg-zinc-700/50 rounded text-xs text-zinc-500">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-zinc-600 text-center pt-2 space-y-1">
                <p>Army auto-built using OPR Force Organization rules</p>
                <p className="text-zinc-700">Max {armyPoints <= 500 ? 2 : 3} copies per unit • Units sorted by personality fit</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800">
        <button
          onClick={saveResults}
          className="px-4 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-colors text-sm"
        >
          💾 Save Results
        </button>
        <button
          onClick={exportForAI}
          className="px-4 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-colors text-sm"
        >
          📤 Export for AI
        </button>
        <button
          onClick={resetQuiz}
          className={`px-4 py-2 rounded-lg text-white transition-colors text-sm ${
            gameSystem === 'grimdark-future'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
          }`}
        >
          🔄 Retake Quiz
        </button>
      </div>
    </div>
  );

  // Faction Picker Modal
  const FactionPicker = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowFactionPicker(false)}>
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-zinc-700" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-white">All Factions</h3>
          <button onClick={() => setShowFactionPicker(false)} className="text-zinc-500 hover:text-white text-xl">×</button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(FACTION_DATA[gameSystem]).map(([name]) => {
              const match = factionMatches.find(f => f.name === name);
              return (
                <button
                  key={name}
                  onClick={() => { handleSelectFaction(name); setShowFactionPicker(false); setActiveTab('army'); }}
                  className="text-left p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-500 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-white text-sm">{name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      match?.matchScore >= 70 ? 'bg-green-900/50 text-green-400' : 'text-zinc-500'
                    }`}>{match?.matchScore || 0}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-1 tracking-tight">
            <span className={gameSystem === 'grimdark-future' ? 'text-red-500' : 'text-emerald-500'}>OPR</span>{' '}
            <span className="text-white">ARMY ALIGNMENT</span>
          </h1>
          <p className="text-zinc-500 text-sm">Find your perfect army • v3.0</p>
        </div>

        <GameSystemToggle />

        <div className="bg-zinc-900/50 backdrop-blur rounded-2xl p-6 border border-zinc-800">
          {!showResults ? <QuestionCard /> : <ResultsView />}
        </div>

        <div className="text-center mt-6 text-zinc-600 text-xs">
          <p>Data from Army Forge API • One Page Rules</p>
        </div>
      </div>

      {showFactionPicker && <FactionPicker />}
    </div>
  );
}
