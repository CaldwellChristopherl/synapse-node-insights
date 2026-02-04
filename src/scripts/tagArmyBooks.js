#!/usr/bin/env node
/**
 * OPR Army Book Unit Tagger v7.0 (Node.js Edition)
 * Enhanced tagging with improved accuracy based on skill v1.7.2
 *
 * Major updates v7.0 (skill v1.7.2):
 * - NEW: Zealot faction type (Human Inquisition, Blessed Sisters)
 * - NEW: Assassin name-based detection → stealth + subtlety: +3
 * - NEW: Cyborg name-based detection → tech: +1 to +2 (keep human tag)
 * - NEW: Minimum 3 tags per unit validation
 * - NEW: Scout rule → both scout AND mobile tags
 * - NEW: Faction type determination checks for vehicles (has vehicles → NOT primitive)
 * - ENHANCED: Human faction validation (ALL infantry/heroes need human tag + humanity: +3)
 * - ENHANCED: Zealot faction rules (zealot/faithful tags, positive faith dimension)
 *
 * Previous updates v6.0 (skill v1.7.0):
 * - CRITICAL: Corrupted vs Organic distinction (daemons are NOT organic!)
 * - Pure Daemon faction handling (corrupted + monster, NO organic tag)
 * - Chaos Space Marine handling (corrupted + tech + human, KEEP tech!)
 * - ALL bikes are vehicles (regardless of faction)
 * - Expanded faction type classification (includes CORRUPTED type)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dimension weights for tags (from skill v1.7.2)
const TAG_TO_DIMENSION_WEIGHTS = {
  // Patience dimension
  aggressive: { patience: -3 },
  patient: { patience: 3 },
  defensive: { patience: 3 },
  static: { patience: 2 },

  // Collective dimension
  swarm: { collective: 4 },
  horde: { collective: 4 },
  support: { collective: 2 },
  independent: { collective: -2 },
  hero: { collective: -1 },
  collective: { collective: 3 },

  // Order dimension
  disciplined: { order: 3 },
  reliable: { order: 2 },
  chaotic: { order: -3 },
  unpredictable: { order: -3 },
  cunning: { order: -2 },

  // Tech dimension (CRITICAL: always apply for vehicles/robots!)
  vehicle: { tech: 3 },
  robot: { tech: 4, humanity: -2 },
  drone: { tech: 4, humanity: -2 },
  battlesuit: { tech: 3 },
  aircraft: { tech: 3, speed: 3 },
  cyborg: { tech: 2 }, // v1.7.2 NEW: Tech-enhanced human (keep human tag)
  organic: { tech: -2 },
  beast: { tech: -3 },

  // Elite dimension
  elite: { elite: 4 },
  veteran: { elite: 3 },
  cheap: { elite: -2 },
  expendable: { elite: -3 },

  // Honor dimension
  honorable: { honor: 4 },
  noble: { honor: 3 },
  ruthless: { honor: -3 },
  treacherous: { honor: -4 },

  // Faith dimension
  zealot: { faith: 4 },
  faithful: { faith: 3 },
  fearless: { faith: 2 },
  daemon: { faith: 3, purity: -4 },

  // Subtlety dimension
  stealth: { subtlety: 4 },
  infiltrate: { subtlety: 4 },
  scout: { subtlety: 3 },
  ambush: { subtlety: 3 },

  // Tradition dimension
  ancient: { tradition: 4 },
  traditional: { tradition: 3 },
  innovative: { tradition: -3 },
  experimental: { tradition: -2 },

  // Purity dimension
  pure: { purity: 4 },
  corrupted: { purity: -4 },
  corruption: { purity: -4 },
  mutant: { purity: -4 },

  // Speed dimension
  fast: { speed: 4 },
  mobile: { speed: 3 },
  flying: { speed: 3 },
  cavalry: { speed: 3 },
  slow: { speed: -2 },

  // Mystery dimension
  mysterious: { mystery: 4 },
  psychic: { mystery: 3 },
  magic: { mystery: 3 },
  ethereal: { mystery: 4 },

  // Versatility dimension
  versatile: { versatility: 4 },
  adaptive: { versatility: 3 },
  specialist: { versatility: -3 },
  focused: { versatility: -2 },
  balanced: { versatility: 2 },

  // Humanity dimension
  human: { humanity: 3 },
  humanoid: { humanity: 2 },
  alien: { humanity: -3 },
  monster: { humanity: -4 },
  // daemon already covered above
  // robot already covered above
  // beast already covered above

  // Leadership dimension
  commander: { leadership: 4 },
  leader: { leadership: 3 },
  inspiring: { leadership: 3 },
  autonomous: { leadership: -2 },
};

// Faction Types (Step 0)
const FactionType = {
  CORRUPTED: 'corrupted',  // Wormhole Daemons, Prime Brothers (Chaos corruption)
  ORGANIC: 'organic',      // Alien Hives, Saurians (100% biological, NOT daemons!)
  TECH: 'tech',           // DAO Union, Robot Legions, HDF (mechanical/tech-focused)
  ZEALOT: 'zealot',       // Human Inquisition, Blessed Sisters (religious/zealot)
  MIXED: 'mixed',         // Battle Brothers, Havoc Brothers (varies by unit)
  PRIMITIVE: 'primitive'  // Goblins, Orcs (low/negative tech, NO vehicles)
};

/**
 * Step 0: Determine Faction Type (CRITICAL - DO THIS FIRST!)
 */
function determineFactionType(factionName, armyBook) {
  const factionLower = factionName.toLowerCase();
  const background = (armyBook.background || '').toLowerCase();

  // CORRUPTED factions (Chaos corruption, daemons)
  // v1.7.0 CRITICAL: Daemons are NOT organic!
  const corruptedKeywords = [
    'wormhole daemon', 'wormhole demon', 'daemon', 'demon',
    'prime brothers',  // Chaos Space Marines
    'disciples',       // Mortal cultists
    'havoc brothers', 'havoc', 'chaos',
    'infected colonies'  // Genestealer Cult
  ];
  if (corruptedKeywords.some(kw => factionLower.includes(kw) || background.includes(kw))) {
    return FactionType.CORRUPTED;
  }

  // ZEALOT factions (v1.7.2 NEW - religious/inquisition themed)
  const zealotKeywords = [
    'inquisition', 'blessed sister', 'crusader', 'templar',
    'ecclesiarchy', 'adepta sororitas'
  ];
  if (zealotKeywords.some(kw => factionLower.includes(kw) || background.includes(kw))) {
    return FactionType.ZEALOT;
  }

  // ORGANIC factions (100% biological, NO vehicles/robots, NOT daemons!)
  const organicKeywords = [
    'alien hive', 'hive', 'tyranid', 'saurian', 'ratmen',
    'undead', 'ghostly', 'mummified'
  ];
  if (organicKeywords.some(kw => factionLower.includes(kw) || background.includes(kw))) {
    return FactionType.ORGANIC;
  }

  // TECH factions (mechanical, robots, vehicles)
  const techKeywords = [
    'dao union', 'tau', 'robot legion', 'machine cult',
    'defense force', 'fleet', 'automaton', 'eternal dynasty',
    'brothers'  // Space Marines (non-Prime)
  ];
  if (techKeywords.some(kw => factionLower.includes(kw) || background.includes(kw))) {
    // Exception: "Prime Brothers" are CORRUPTED, not TECH
    if (factionLower.includes('prime')) {
      return FactionType.CORRUPTED;
    }
    return FactionType.TECH;
  }

  // PRIMITIVE factions (low tech, NO vehicles)
  // v1.7.2: Check if faction has vehicles - if yes, NOT primitive
  const primitiveKeywords = ['goblin', 'orc', 'beast', 'tribal', 'barbarian'];
  if (primitiveKeywords.some(kw => factionLower.includes(kw) || background.includes(kw))) {
    // Check if any unit has vehicle-like characteristics
    const hasVehicles = (armyBook.units || []).some(unit => {
      const unitName = (unit.name || '').toLowerCase();
      const genericName = (unit.genericName || '').toLowerCase();
      const vehicleKeywords = ['tank', 'vehicle', 'apc', 'truck', 'walker', 'gunship'];
      return vehicleKeywords.some(vk => unitName.includes(vk) || genericName.includes(vk));
    });

    return hasVehicles ? FactionType.MIXED : FactionType.PRIMITIVE;
  }

  // Default to MIXED (check unit-by-unit)
  return FactionType.MIXED;
}

/**
 * Get rule name from rule object or string
 */
function getRuleName(rule) {
  if (typeof rule === 'string') return rule;
  return rule?.label || rule?.name || '';
}

/**
 * Check if unit has a specific rule (case-insensitive)
 */
function hasRule(unit, ruleName) {
  const rules = unit.rules || [];
  const ruleNameLower = ruleName.toLowerCase();
  return rules.some(rule => getRuleName(rule).toLowerCase().includes(ruleNameLower));
}

/**
 * Get the rating value for a specific rule
 */
function getRuleRating(unit, ruleName) {
  const rules = unit.rules || [];
  for (const rule of rules) {
    if (typeof rule === 'object') {
      const ruleLabel = getRuleName(rule).toLowerCase();
      if (ruleLabel.includes(ruleName.toLowerCase())) {
        return rule.rating;
      }
    }
  }
  return null;
}

/**
 * Calculate cost per model
 */
function getCostPerModel(unit) {
  const cost = unit.cost;
  let size = unit.size || 1;

  if (cost === null || cost === undefined) return 0;

  if (typeof size === 'string') {
    size = parseInt(size, 10) || 1;
  }

  return cost / Math.max(size, 1);
}

/**
 * Get unit quality with safe default
 */
function getQuality(unit) {
  return unit.quality !== null && unit.quality !== undefined ? unit.quality : 4;
}

/**
 * Get unit defense with safe default
 */
function getDefense(unit) {
  return unit.defense !== null && unit.defense !== undefined ? unit.defense : 4;
}

/**
 * Detect if unit is a Battlesuit (piloted mech armor)
 * CRITICAL: Battlesuits are vehicles, NOT monsters
 */
function isBattlesuit(name) {
  const battlesuitKeywords = [
    'suit', 'battle suit', 'battlesuit', 'stealth suit',
    'armor', 'exo-', 'power armor', 'powered',
    'mech', 'mechsuit', 'warsuit'
  ];
  return battlesuitKeywords.some(kw => name.toLowerCase().includes(kw));
}

/**
 * Detect if unit is an organic creature (not mechanical)
 */
function isOrganicCreature(name) {
  const organicKeywords = [
    'beast', 'spider', 'dragon', 'troll', 'daemon', 'demon',
    'carnifex', 'hive', 'tyranid', 'genestealer', 'ripper',
    'creature', 'monster', 'worm', 'wyrm', 'hydra',
    'giant', 'ogre', 'kraken', 'swarm', 'rapacious',
    'venom', 'ravenous', 'devourer', 'spore'
  ];
  return organicKeywords.some(kw => name.toLowerCase().includes(kw));
}

/**
 * Detect if unit is a mechanical construct (not organic)
 */
function isMechanicalConstruct(name) {
  const mechanicalKeywords = [
    'walker', 'titan', 'suit', 'mech', 'tank', 'dreadnought',
    'robot', 'automaton', 'construct', 'vehicle', 'apc',
    'truck', 'transport', 'gunship', 'aircraft', 'armor'
  ];
  return mechanicalKeywords.some(kw => name.toLowerCase().includes(kw));
}

/**
 * Step 1: Determine unit role
 */
function determineRole(unit, factionType) {
  const size = unit.size || 1;
  const costPerModel = getCostPerModel(unit);
  const quality = getQuality(unit);
  const name = unit.name || '';
  const nameLower = name.toLowerCase();

  // Hero
  if (hasRule(unit, 'Hero')) {
    return 'hero';
  }

  // Vehicle detection (name-based + rule-based)
  const vehicleKeywords = [
    'tank', 'apc', 'vehicle', 'truck', 'transport', 'walker',
    'mech', 'dreadnought', 'gunship', 'bomber', 'fighter',
    'bike', 'speeder', 'jetbike', 'hover'
  ];

  // ORGANIC factions: Even "Titan" or "Aircraft" are organic creatures
  if (factionType === FactionType.ORGANIC) {
    if (hasRule(unit, 'Fear') || isOrganicCreature(name)) {
      const toughRating = getRuleRating(unit, 'Tough') || 0;
      if (toughRating >= 6 || (size <= 3 && costPerModel > 150)) {
        return 'monster';
      }
    }
  } else {
    // TECH/MIXED factions: Normal vehicle detection
    if (isBattlesuit(name)) {
      return 'vehicle';
    }

    if (hasRule(unit, 'Vehicle') || hasRule(unit, 'Aircraft') ||
        vehicleKeywords.some(kw => nameLower.includes(kw))) {
      return 'vehicle';
    }

    // Monster vs Vehicle Decision Tree
    if (hasRule(unit, 'Fear') && hasRule(unit, 'Tough')) {
      const toughRating = getRuleRating(unit, 'Tough') || 0;

      if (toughRating >= 6 || (size === 1 && costPerModel > 200)) {
        if (isOrganicCreature(name)) {
          return 'monster';
        } else if (isMechanicalConstruct(name)) {
          return 'vehicle';
        } else {
          return toughRating >= 9 ? 'monster' : 'vehicle';
        }
      }
    }
  }

  // Swarm (large model count, cheap)
  if (size >= 10 && costPerModel <= 15) {
    return 'swarm';
  }

  // Fast Attack
  if (hasRule(unit, 'Fast') || hasRule(unit, 'Flying') || hasRule(unit, 'Aircraft') ||
      hasRule(unit, 'Ambush') || hasRule(unit, 'Scout')) {
    return 'fast-attack';
  }

  // Elite (expensive quality units)
  if (costPerModel >= 30 && quality <= 3) {
    return 'elite';
  }

  // Heavy Support
  if (hasRule(unit, 'Artillery') || (hasRule(unit, 'Slow') && costPerModel > 40)) {
    return 'heavy-support';
  }

  // Default to troops
  return 'troops';
}

/**
 * Step 1b: Calculate stats-based tags
 */
function calculateStatsBasedTags(unit) {
  const tags = new Set();
  const costPerModel = getCostPerModel(unit);
  const quality = getQuality(unit);
  const size = unit.size || 1;

  if (costPerModel === 0) return tags;

  // Elite vs Cheap calculation
  if (costPerModel >= 30 && quality <= 3) {
    tags.add('elite');
  } else if (costPerModel >= 20 && quality <= 4) {
    tags.add('veteran');
  } else if (costPerModel <= 12) {
    tags.add('cheap');
  }

  // Expendable: Q5+ regardless of Tough
  if (quality >= 5 && costPerModel <= 40) {
    tags.add('expendable');
  }

  // Horde
  if (size >= 10) {
    tags.add('horde');
  }

  return tags;
}

/**
 * Step 2b: Get faction-wide tags
 */
function getFactionWideTags(factionName, unit, factionType) {
  const tags = new Set();
  const factionLower = factionName.toLowerCase();

  // Check for faction-wide rules
  if (hasRule(unit, 'Mischievous')) {
    tags.add('treacherous');
    tags.add('cunning');
  }

  if (hasRule(unit, 'Battleborn')) {
    tags.add('disciplined');
    tags.add('fearless');
  }

  if (hasRule(unit, 'Hive Bond')) {
    tags.add('swarm');
    tags.add('collective');
  }

  if (hasRule(unit, 'Hold the Line')) {
    tags.add('disciplined');
    tags.add('reliable');
  }

  if (hasRule(unit, 'For the Greater Good')) {
    tags.add('collective');
    tags.add('disciplined');
  }

  if (hasRule(unit, 'WAAAGH!')) {
    tags.add('aggressive');
    tags.add('chaotic');
  }

  // v1.7.2: Zealot faction handling
  if (factionType === FactionType.ZEALOT) {
    // ALL infantry/heroes in zealot factions are HUMAN
    if (!hasRule(unit, 'Vehicle') && (unit.size || 1) >= 1) {
      tags.add('human');
    }

    // Religious units get zealot/faithful tags
    const unitName = (unit.name || '').toLowerCase();
    if (['missionary', 'crusader', 'acolyte', 'priest', 'preacher'].some(x => unitName.includes(x))) {
      tags.add('zealot');
    }

    // Fearless in zealot factions = religious fervor
    if (hasRule(unit, 'Fearless')) {
      tags.add('faithful');
    }
  }

  // Faction-wide Fearless indicates zealotry
  if (hasRule(unit, 'Fearless') && factionType !== FactionType.ZEALOT) {
    if (['brother', 'sister', 'zealot', 'crusad'].some(x => factionLower.includes(x))) {
      tags.add('zealot');
    }
  }

  // Faction-specific patterns
  if (factionLower.includes('goblin') || factionLower.includes('grot')) {
    tags.add('cunning');
  }

  if (factionLower.includes('daemon') || factionLower.includes('chaos') || factionLower.includes('havoc')) {
    tags.add('chaotic');
  }

  if (factionLower.includes('undead') || factionLower.includes('mummified') || factionLower.includes('ghostly')) {
    tags.add('ancient');
  }

  if (factionLower.includes('robot') || factionLower.includes('machine') || factionLower.includes('legion')) {
    tags.add('ancient');
  }

  if (factionLower.includes('ratmen') || factionLower.includes('skaven')) {
    tags.add('treacherous');
    tags.add('cunning');
  }

  if ((factionLower.includes('defense force') || factionLower.includes('human')) && factionType !== FactionType.ZEALOT) {
    // Human factions get human tag on infantry
    if (!hasRule(unit, 'Vehicle') && (unit.size || 1) >= 3) {
      tags.add('human');
    }
  }

  return tags;
}

/**
 * Step 1d: Name-Based Detection (CRITICAL)
 */
function applyNameBasedDetection(unit, factionType, factionName = '') {
  const tags = new Set();
  const name = (unit.name || '').toLowerCase();
  const genericName = (unit.genericName || '').toLowerCase();
  const factionLower = factionName.toLowerCase();

  // v1.7.2 NEW: Assassin Detection
  if (name.includes('assassin')) {
    tags.add('stealth');
  }

  // v1.7.2 NEW: Cyborg Detection
  if (name.includes('cyborg')) {
    tags.add('cyborg');
  }

  // CORRUPTED FACTION HANDLING (v1.7.0 CRITICAL)
  if (factionType === FactionType.CORRUPTED) {
    tags.add('corrupted');

    const daemonKeywords = [
      'daemon', 'demon', 'bloodthirster', 'keeper', 'great unclean',
      'lord of change', 'herald', 'plaguebearer', 'bloodletter',
      'daemonette', 'horror', 'flamer', 'screamer', 'fiend'
    ];
    const isDaemon = daemonKeywords.some(kw => name.includes(kw));

    const marineKeywords = [
      'prime brother', 'chaos marine', 'terminator', 'chosen',
      'havoc', 'raptor', 'obliterator', 'dreadnought'
    ];
    const isChaosMarine = marineKeywords.some(kw => name.includes(kw) || factionLower.includes(kw));

    if (isDaemon) {
      // Pure Daemon: corrupted + monster (NO organic!)
      tags.add('monster');
      tags.add('daemon');
    } else if (isChaosMarine || factionLower.includes('prime')) {
      // Chaos Space Marine: corrupted + tech + human (KEEP tech!)
      tags.add('tech');
      tags.add('human');

      const vehicleKeywords = ['tank', 'bike', 'dreadnought', 'walker', 'rhino'];
      if (vehicleKeywords.some(kw => name.includes(kw))) {
        tags.add('vehicle');
      }
    } else {
      // Mortal cultist: corrupted + human
      tags.add('human');
    }
  }
  // ORGANIC FACTION HANDLING (v1.5.0 CRITICAL)
  else if (factionType === FactionType.ORGANIC) {
    tags.add('organic');

    // Grunt in organic factions = organic auxiliaries (NOT robots!)
    if (name.includes('grunt') || genericName.includes('grunt')) {
      tags.add('organic');
      tags.add('beast');
    }

    // Beast detection
    if (isOrganicCreature(name) || name.includes('beast') || genericName.includes('beast')) {
      tags.add('beast');
    }

    // Swarm detection
    if (name.includes('swarm') || genericName.includes('swarm')) {
      tags.add('swarm');
      tags.add('horde');
    }

    return tags;
  }

  // TECH/MIXED/PRIMITIVE FACTION HANDLING
  // Battlesuit Detection
  if (isBattlesuit(name) || isBattlesuit(genericName)) {
    tags.add('battlesuit');
    tags.add('vehicle');
  }

  // Vehicle Detection (v1.7.0: ALL bikes are vehicles)
  const vehicleKeywords = [
    'tank', 'apc', 'vehicle', 'truck', 'transport',
    'walker', 'titan', 'mech', 'dreadnought',
    'gunship', 'aircraft', 'flyer', 'bomber', 'fighter',
    'bike', 'speeder', 'jetbike', 'hover', 'cannon'
  ];

  if (vehicleKeywords.some(kw => name.includes(kw) || genericName.includes(kw))) {
    tags.add('vehicle');
  }

  // Extra check for bikes (ALWAYS vehicles)
  const bikeKeywords = ['bike', 'biker', 'jetbike', 'speeder'];
  if (bikeKeywords.some(kw => name.includes(kw) || genericName.includes(kw))) {
    tags.add('vehicle');
  }

  // Aircraft Detection (for TECH factions only)
  const aircraftKeywords = ['gunship', 'aircraft', 'flyer', 'bomber', 'fighter', 'helicopter'];
  if (aircraftKeywords.some(kw => name.includes(kw) || genericName.includes(kw))) {
    tags.add('aircraft');
    tags.add('flying');
    tags.add('vehicle');
  }

  // Cavalry Detection
  const cavalryKeywords = ['rider', 'cavalry', 'mounted', 'chariot', 'biker'];
  if (cavalryKeywords.some(kw => name.includes(kw) || genericName.includes(kw))) {
    tags.add('cavalry');
  }

  // Drone Detection
  if (name.includes('drone') || genericName.includes('drone')) {
    tags.add('drone');
    tags.add('robot');
  }

  // Grunt Detection (for TECH factions)
  if (name.includes('grunt') || genericName.includes('grunt')) {
    const techFactionKeywords = ['dao', 'union', 'tau', 'greater good'];
    if (techFactionKeywords.some(kw => factionLower.includes(kw))) {
      tags.add('robot');
    }
  }

  // Robot/Automaton Detection
  const robotKeywords = ['robot', 'automaton', 'construct', 'android'];
  if (robotKeywords.some(kw => name.includes(kw) || genericName.includes(kw))) {
    tags.add('robot');
  }

  // Infantry Faction Detection (for human armies)
  const humanKeywords = ['guard', 'soldier', 'trooper', 'marine', 'brother', 'recruit', 'militia'];
  if (humanKeywords.some(kw => name.includes(kw) || genericName.includes(kw))) {
    tags.add('human');
  }

  return tags;
}

/**
 * Analyze weapons to determine combat style
 */
function analyzeWeapons(unit) {
  const tags = new Set();
  const weapons = unit.weapons || [];

  if (weapons.length === 0) return tags;

  let rangedCount = 0;
  let meleeCount = 0;
  let maxRange = 0;

  for (const weapon of weapons) {
    const weaponRange = weapon.range || 0;

    if (weaponRange >= 12) {
      rangedCount++;
      maxRange = Math.max(maxRange, weaponRange);
    } else {
      meleeCount++;
    }
  }

  // Ranged vs Melee
  if (rangedCount > 0 && meleeCount === 0) {
    tags.add('ranged');
  } else if (meleeCount > 0 && rangedCount === 0) {
    tags.add('melee');
  } else if (rangedCount > 0 && meleeCount > 0) {
    tags.add('balanced');
  }

  // Artillery (long range static weapons)
  if (maxRange >= 36) {
    tags.add('static');
  }

  return tags;
}

/**
 * Step 2: Analyze unit rules to assign tags
 */
function analyzeRules(unit, factionType) {
  const tags = new Set();
  const rules = unit.rules || [];

  for (const rule of rules) {
    const ruleName = getRuleName(rule).toLowerCase();

    // Combat style
    if (['frenzy', 'furious', 'berserk', 'impact'].some(x => ruleName.includes(x))) {
      tags.add('aggressive');
    }

    if (ruleName.includes('shield') || ruleName.includes('phalanx')) {
      tags.add('defensive');
    }

    if (ruleName.includes('relentless') || ruleName.includes('artillery')) {
      tags.add('ranged');
    }

    // Unit type
    if (ruleName.includes('hero')) {
      tags.add('hero');
      const toughRating = getRuleRating(unit, 'Tough') || 0;
      if (toughRating >= 3) {
        tags.add('leader');
      }
    }

    if (ruleName.includes('veteran')) {
      tags.add('veteran');
    }

    // Movement
    if (ruleName.includes('fast')) {
      tags.add('fast');
    }

    if (ruleName.includes('flying') || ruleName === 'fly') {
      tags.add('flying');
    }

    // Aircraft (CRITICAL v1.5.0: depends on faction type!)
    if (ruleName.includes('aircraft')) {
      if (factionType === FactionType.ORGANIC) {
        // Organic factions: Aircraft = flying organic creature
        tags.add('flying');
        tags.add('beast');
        tags.add('organic');
      } else {
        // Tech/Mixed factions: Aircraft = mechanical vehicle
        tags.add('aircraft');
        tags.add('flying');
        tags.add('vehicle');
      }
    }

    if (ruleName.includes('slow')) {
      tags.add('slow');
    }

    // v1.7.2: Scout rule → BOTH scout AND mobile tags
    if (ruleName.includes('scout')) {
      tags.add('scout');
      tags.add('mobile');
    }

    if (ruleName.includes('ambush') || ruleName.includes('strider')) {
      tags.add('mobile');
    }

    if (ruleName.includes('stealth')) {
      tags.add('stealth');
    }

    // Artillery on GROUND units only
    if (ruleName.includes('artillery')) {
      tags.add('static');
    }

    // Special abilities (CRITICAL: Casters MUST add mystery dimension)
    if (['psychic', 'wizard', 'caster', 'spellcaster'].some(x => ruleName.includes(x))) {
      tags.add('psychic');
      tags.add('magic');
    }

    if (ruleName.includes('fearless')) {
      tags.add('fearless');
    }

    if (ruleName.includes('regeneration') || ruleName.includes('regenerate')) {
      tags.add('regeneration');
    }

    // Tough tag only if unit is also elite
    if (ruleName.includes('tough')) {
      const costPerModel = getCostPerModel(unit);
      if (costPerModel >= 25) {
        tags.add('tough');
      }
    }

    if (['unpredictable', 'random', 'unstable'].some(x => ruleName.includes(x))) {
      tags.add('unpredictable');
    }

    if (['chaotic', 'berserk', 'frenzy'].some(x => ruleName.includes(x))) {
      tags.add('chaotic');
    }

    if (ruleName.includes('mischievous')) {
      tags.add('treacherous');
      tags.add('cunning');
    }

    // Technology (only for non-organic factions)
    if (factionType !== FactionType.ORGANIC) {
      if (ruleName.includes('vehicle') || ruleName.includes('transport')) {
        tags.add('vehicle');
      }
    }

    // Faction theme
    if (['mutation', 'daemon', 'warp', 'corrupt'].some(x => ruleName.includes(x))) {
      tags.add('corruption');
    }

    if (ruleName.includes('daemon')) {
      tags.add('daemon');
    }

    if (['blessed', 'pure', 'holy'].some(x => ruleName.includes(x))) {
      tags.add('pure');
    }

    if (['backstab', 'poison', 'assassin'].some(x => ruleName.includes(x))) {
      tags.add('treacherous');
    }

    // Fear on organic creatures = monster
    if (ruleName.includes('fear')) {
      if (factionType === FactionType.ORGANIC || ((unit.size || 1) <= 3 && !tags.has('vehicle'))) {
        tags.add('monster');
      }
    }
  }

  return tags;
}

/**
 * Analyze unit name for additional tags
 */
function analyzeUnitName(unit, factionType) {
  const tags = new Set();
  const name = (unit.name || '').toLowerCase();
  const genericName = (unit.genericName || '').toLowerCase();

  // Beast/Monster
  const beastKeywords = [
    'beast', 'monster', 'creature', 'dragon', 'troll', 'giant', 'ogre',
    'spider', 'worm', 'wyrm', 'hydra'
  ];
  if (beastKeywords.some(kw => name.includes(kw) || genericName.includes(kw))) {
    tags.add('beast');
    if (factionType === FactionType.ORGANIC) {
      tags.add('organic');
    }
  }

  // Daemon
  if (name.includes('daemon') || name.includes('demon')) {
    tags.add('daemon');
  }

  // Caster
  const casterKeywords = [
    'wizard', 'mage', 'sorcerer', 'shaman', 'priest', 'warlock',
    'psyker', 'librarian', 'channeler', 'synapse'
  ];
  if (casterKeywords.some(kw => name.includes(kw))) {
    tags.add('magic');
    tags.add('psychic');
  }

  return tags;
}

/**
 * Step 1c: Apply tags required by certain roles
 */
function applyRoleRequiredTags(unit, role, tags) {
  if (role === 'monster') {
    tags.add('monster');
  }

  if (role === 'vehicle') {
    tags.add('vehicle');
  }

  if (role === 'swarm') {
    tags.add('horde');
    tags.add('swarm');
  }

  if (role === 'hero') {
    tags.add('hero');
  }

  return tags;
}

/**
 * Step 2a: Check for Mutually Exclusive Tags
 */
function checkMutuallyExclusiveTags(unit, tags, factionType) {
  const name = (unit.name || '').toLowerCase();
  const tagsSet = new Set(tags);

  // Movement Contradictions
  // CRITICAL: Aircraft are NEVER static or slow!
  if (tagsSet.has('aircraft') || tagsSet.has('flying')) {
    tagsSet.delete('static');
    tagsSet.delete('slow');
  }

  if (tagsSet.has('fast') || tagsSet.has('flying') || tagsSet.has('mobile')) {
    tagsSet.delete('static');
  }

  if (tagsSet.has('slow') && tagsSet.has('fast')) {
    tagsSet.delete('slow');
  }

  // Combat Style Contradictions
  if (tagsSet.has('aggressive') && tagsSet.has('defensive')) {
    if (hasRule(unit, 'Impact') || hasRule(unit, 'Furious') || hasRule(unit, 'Frenzy')) {
      tagsSet.delete('defensive');
    } else if (hasRule(unit, 'Shield') || hasRule(unit, 'Phalanx')) {
      tagsSet.delete('aggressive');
    } else {
      tagsSet.delete('defensive');
    }
  }

  // Type Contradictions
  // CRITICAL v1.5.0: In ORGANIC factions, NEVER have vehicle/robot tags
  if (factionType === FactionType.ORGANIC) {
    tagsSet.delete('vehicle');
    tagsSet.delete('robot');
    tagsSet.delete('battlesuit');
    tagsSet.delete('aircraft'); // Keep flying, but remove aircraft
  } else {
    // monster ↔ vehicle (for non-organic factions)
    if (tagsSet.has('monster') && tagsSet.has('vehicle')) {
      if (tagsSet.has('battlesuit') || isBattlesuit(name)) {
        tagsSet.delete('monster');
      } else if (isMechanicalConstruct(name)) {
        tagsSet.delete('monster');
      } else if (isOrganicCreature(name)) {
        tagsSet.delete('vehicle');
      } else {
        tagsSet.delete('monster');
      }
    }

    // monster ↔ battlesuit
    if (tagsSet.has('monster') && tagsSet.has('battlesuit')) {
      tagsSet.delete('monster');
    }
  }

  // robot ↔ organic
  if (tagsSet.has('robot') && tagsSet.has('organic')) {
    tagsSet.delete('organic');
  }

  // Elite/Cheap Contradictions
  if (tagsSet.has('elite') && tagsSet.has('cheap')) {
    tagsSet.delete('cheap');
  }

  if (tagsSet.has('elite') && tagsSet.has('expendable')) {
    tagsSet.delete('expendable');
  }

  return tagsSet;
}

/**
 * Apply special tagging logic and refinements
 */
function applySpecialLogic(unit, tags, factionType) {
  const tagsSet = new Set(tags);

  // Artillery/static ranged = defensive
  if (tagsSet.has('static') && tagsSet.has('ranged')) {
    tagsSet.add('defensive');
  }

  // Remove contradictions
  const costPerModel = getCostPerModel(unit);
  const quality = getQuality(unit);

  if (tagsSet.has('defensive') && tagsSet.has('cheap') &&
      !(tagsSet.has('static') && tagsSet.has('ranged'))) {
    if (quality >= 5) {
      tagsSet.delete('defensive');
    }
  }

  // v1.7.2: Ensure MINIMUM 3 TAGS per unit (CRITICAL)
  // Track previous size to detect infinite loops
  let previousSize = -1;
  let attempts = 0;
  const MAX_ATTEMPTS = 10;

  while (tagsSet.size < 3 && attempts < MAX_ATTEMPTS) {
    attempts++;

    // If size hasn't changed since last iteration, we're stuck
    if (tagsSet.size === previousSize) {
      // Force add a fallback tag to break the loop
      if (!tagsSet.has('balanced')) {
        tagsSet.add('balanced');
      } else if (!tagsSet.has('versatile')) {
        tagsSet.add('versatile');
      } else if (!tagsSet.has('reliable')) {
        tagsSet.add('reliable');
      } else {
        // Last resort: add generic infantry tag
        tagsSet.add('infantry');
      }
      break;
    }
    previousSize = tagsSet.size;

    // Try to add combat style tags
    const weapons = unit.weapons || [];
    if (weapons.length > 0 && !tagsSet.has('ranged') && !tagsSet.has('melee') && !tagsSet.has('balanced')) {
      const hasRanged = weapons.some(w => (w.range || 0) >= 12);
      const hasMelee = weapons.some(w => (w.range || 0) < 12);

      if (hasRanged && hasMelee) {
        tagsSet.add('balanced');
        continue;
      } else if (hasRanged) {
        tagsSet.add('ranged');
        continue;
      } else if (hasMelee) {
        tagsSet.add('melee');
        continue;
      }
    }

    // Try to add quality-based tags (FIXED: include 'reliable' in check)
    if (!tagsSet.has('elite') && !tagsSet.has('veteran') &&
        !tagsSet.has('cheap') && !tagsSet.has('expendable') && !tagsSet.has('reliable')) {
      if (quality <= 3 && costPerModel >= 25) {
        tagsSet.add('veteran');
      } else if (quality >= 5) {
        tagsSet.add('expendable');
      } else if (costPerModel >= 15) {
        tagsSet.add('reliable');
      } else {
        tagsSet.add('cheap');
      }
      continue;
    }

    // Try to add role-based tags
    if (!['fast', 'slow', 'mobile', 'static'].some(t => tagsSet.has(t))) {
      if (hasRule(unit, 'Fast') || hasRule(unit, 'Flying')) {
        tagsSet.add('fast');
      } else if (hasRule(unit, 'Slow')) {
        tagsSet.add('slow');
      } else {
        // Add balanced instead of reliable to avoid duplicates
        if (!tagsSet.has('balanced')) {
          tagsSet.add('balanced');
        } else {
          tagsSet.add('versatile');
        }
      }
      continue;
    }

    // Last resort: add generic tags
    if (!tagsSet.has('balanced')) {
      tagsSet.add('balanced');
      continue;
    }

    if (!tagsSet.has('versatile')) {
      tagsSet.add('versatile');
      continue;
    }

    // If we still can't find tags, break to avoid infinite loop
    break;
  }

  // Final safety check
  if (tagsSet.size < 3) {
    console.log(`  WARNING: Could not reach 3 tags for '${unit.name || 'unknown'}'. Final tags: ${Array.from(tagsSet).sort()}`);
  }

  return tagsSet;
}

/**
 * Step 3: Calculate dimension scores from tags
 */
function calculateDimensionScores(tags) {
  const scores = {};

  for (const tag of tags) {
    if (TAG_TO_DIMENSION_WEIGHTS[tag]) {
      const weights = TAG_TO_DIMENSION_WEIGHTS[tag];
      for (const [dimension, value] of Object.entries(weights)) {
        scores[dimension] = (scores[dimension] || 0) + value;
      }
    }
  }

  // Clamp to [-5, +5]
  for (const dim of Object.keys(scores)) {
    scores[dim] = Math.max(-5, Math.min(5, scores[dim]));
  }

  // Only return non-zero scores
  return Object.fromEntries(
    Object.entries(scores).filter(([_, v]) => v !== 0)
  );
}

/**
 * Tag a single unit with personality dimensions
 */
function tagUnit(unit, factionType, factionName) {
  // Skip units without cost
  if (unit.cost === null || unit.cost === undefined) {
    return null;
  }

  // Step 1: Determine role
  const role = determineRole(unit, factionType);

  // Step 1b: Calculate stats-based tags
  let tags = calculateStatsBasedTags(unit);

  // Step 1c: Apply role-required tags
  tags = applyRoleRequiredTags(unit, role, tags);

  // Step 1d: Name-based detection
  const nameBasedTags = applyNameBasedDetection(unit, factionType, factionName);
  nameBasedTags.forEach(tag => tags.add(tag));

  // Step 2: Analyze rules
  const ruleTags = analyzeRules(unit, factionType);
  ruleTags.forEach(tag => tags.add(tag));

  // Step 2a: Check for mutually exclusive tags
  tags = checkMutuallyExclusiveTags(unit, tags, factionType);

  // Step 2b: Apply faction-wide tags
  const factionTags = getFactionWideTags(factionName, unit, factionType);
  factionTags.forEach(tag => tags.add(tag));

  // Analyze weapons
  const weaponTags = analyzeWeapons(unit);
  weaponTags.forEach(tag => tags.add(tag));

  // Analyze unit name
  const nameTags = analyzeUnitName(unit, factionType);
  nameTags.forEach(tag => tags.add(tag));

  // Apply special logic and cleanup
  tags = applySpecialLogic(unit, tags, factionType);

  // Re-check mutually exclusive tags after all tagging
  tags = checkMutuallyExclusiveTags(unit, tags, factionType);

  // Quality Validation
  // Ensure drone units have BOTH drone AND robot tags (unless organic faction)
  if (factionType !== FactionType.ORGANIC) {
    if (tags.has('drone') && !tags.has('robot')) {
      tags.add('robot');
    }
  }

  // v1.7.2: Final minimum tag check (CRITICAL)
  if (tags.size < 3) {
    console.log(`  WARNING: Unit '${unit.name || 'unknown'}' has only ${tags.size} tags: ${Array.from(tags).sort()}`);
    // Force add a generic tag to meet minimum
    if (!tags.has('balanced')) {
      tags.add('balanced');
    }
  }

  // Calculate dimension scores
  const dimensionScores = calculateDimensionScores(tags);

  // Extract simplified rules list
  const rulesList = (unit.rules || []).map(r => getRuleName(r));

  // Build output
  return {
    id: unit.id || '',
    name: unit.name || '',
    cost: unit.cost,
    size: unit.size || 1,
    quality: getQuality(unit),
    defense: getDefense(unit),
    role,
    rules: rulesList,
    tags: Array.from(tags).sort(),
    dimensionScores
  };
}

/**
 * Process a single army book file
 */
function processArmyBook(inputPath, outputDir) {
  console.log(`Processing: ${path.basename(inputPath)}`);

  const armyBook = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  const factionName = armyBook.name || '';
  const factionUid = armyBook.uid || '';

  // STEP 0: Determine Faction Type (CRITICAL!)
  const factionType = determineFactionType(factionName, armyBook);
  console.log(`  Faction Type: ${factionType}`);

  // Determine game system from path
  let gameSystem = 'unknown';
  if (inputPath.includes('grimdark-future')) {
    gameSystem = 'grimdark-future';
  } else if (inputPath.includes('age-of-fantasy')) {
    gameSystem = 'age-of-fantasy';
  }

  // Tag all units
  const taggedUnits = [];
  let skipped = 0;
  for (const unit of armyBook.units || []) {
    try {
      const taggedUnit = tagUnit(unit, factionType, factionName);
      if (taggedUnit !== null) {
        taggedUnits.push(taggedUnit);
      } else {
        skipped++;
      }
    } catch (error) {
      console.log(`  ERROR tagging unit ${unit.name || 'unknown'}: ${error.message}`);
      continue;
    }
  }

  // Build output structure
  const output = {
    factionId: factionUid,
    factionName,
    gameSystem,
    factionType, // v1.7.2: Includes ZEALOT type
    version: '1.7.2',
    taggedAt: new Date().toISOString(),
    units: taggedUnits
  };

  // Generate output filename
  const factionSlug = factionUid || path.basename(inputPath, '.json');
  const outputFilename = `${factionSlug}-tagged.json`;
  const outputPath = path.join(outputDir, outputFilename);

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  let msg = `  ✓ Tagged ${taggedUnits.length} units`;
  if (skipped > 0) {
    msg += ` (skipped ${skipped} upgrades)`;
  }
  msg += ` → ${outputFilename}`;
  console.log(msg);

  return output;
}

/**
 * Main processing function
 */
function main() {
  // Set up paths
  const dataDir = path.join(__dirname, '..', 'data');
  const outputBase = path.join(__dirname, '..', 'tagged-units');

  // Create output directories
  if (!fs.existsSync(outputBase)) {
    fs.mkdirSync(outputBase, { recursive: true });
  }

  const aofDir = path.join(outputBase, 'age-of-fantasy');
  const gfDir = path.join(outputBase, 'grimdark-future');

  if (!fs.existsSync(aofDir)) {
    fs.mkdirSync(aofDir, { recursive: true });
  }
  if (!fs.existsSync(gfDir)) {
    fs.mkdirSync(gfDir, { recursive: true });
  }

  // Check if specific faction provided as argument
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const factionName = args[0];
    console.log(`OPR Unit Personality Tagger v7.0 (Skill v1.7.2 - Node.js Edition)`);
    console.log(`Processing single faction: ${factionName}\n`);

    // Find the faction file
    const findFile = (dir, filename) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          const result = findFile(fullPath, filename);
          if (result) return result;
        } else if (file.name === filename || file.name === `${filename}.json`) {
          return fullPath;
        }
      }
      return null;
    };

    const bookPath = findFile(dataDir, factionName);
    if (!bookPath) {
      console.error(`ERROR: Could not find faction '${factionName}'`);
      process.exit(1);
    }

    // Determine output directory
    let outputDir;
    if (bookPath.includes('grimdark-future')) {
      outputDir = gfDir;
    } else if (bookPath.includes('age-of-fantasy')) {
      outputDir = aofDir;
    } else {
      outputDir = outputBase;
    }

    const output = processArmyBook(bookPath, outputDir);

    console.log('\n' + '='.repeat(60));
    console.log('Processing complete!');
    const outputFile = path.join(outputDir, `${path.basename(bookPath, '.json')}-tagged.json`);
    console.log(`  Output: ${outputFile}`);
    console.log('='.repeat(60));

    // Print output for user verification
    console.log('\nOUTPUT (for verification):');
    console.log(JSON.stringify(output, null, 2));

    process.exit(0);
  }

  // Process all army books
  const getAllJsonFiles = (dir) => {
    const results = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        results.push(...getAllJsonFiles(fullPath));
      } else if (file.name.endsWith('.json') && !file.name.endsWith('-tagged.json')) {
        results.push(fullPath);
      }
    }
    return results;
  };

  const armyBooks = getAllJsonFiles(dataDir);

  console.log(`OPR Unit Personality Tagger v7.0 (Skill v1.7.2 - Node.js Edition)`);
  console.log(`Found ${armyBooks.length} army books to process\n`);

  let processed = 0;
  let errors = 0;

  for (const bookPath of armyBooks.sort()) {
    try {
      // Determine output directory
      let outputDir;
      if (bookPath.includes('grimdark-future')) {
        outputDir = gfDir;
      } else if (bookPath.includes('age-of-fantasy')) {
        outputDir = aofDir;
      } else {
        outputDir = outputBase;
      }

      processArmyBook(bookPath, outputDir);
      processed++;
    } catch (error) {
      console.log(`ERROR processing ${path.basename(bookPath)}: ${error.message}`);
      errors++;
      continue;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Processing complete!');
  console.log(`  Successful: ${processed}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Output directory: ${outputBase}`);
  console.log('='.repeat(60));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { tagUnit, determineFactionType, processArmyBook };
