#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// === DIRECTORIES ===
const UNTAGGED_DIR = path.join(__dirname, '../data/untagged-army-books');
const TAGGED_DIR = path.join(__dirname, '../data/factions/units');
const UPGRADES_DIR = path.join(__dirname, '../data/upgrades');

const GAME_SYSTEMS = {
  'grimdark-future': 'grimdark-future',
  'age-of-fantasy': 'age-of-fantasy'
};

const VERSION = '1.9.0';

// === TAG-TO-DIMENSION MAP (mirrors tag-to-dimension.jsx) ===
const TAG_TO_DIM = {
  aggressive: { patience: -3 }, patient: { patience: 3 }, defensive: { patience: 3 },
  static: { patience: 2 }, frenzy: { patience: -3 },
  swarm: { collective: 4 }, horde: { collective: 4 }, support: { collective: 2 },
  independent: { collective: -2 }, collective: { collective: 3 },
  disciplined: { order: 3 }, reliable: { order: 2 }, chaotic: { order: -3 },
  unpredictable: { order: -3 }, cunning: { subtlety: 2, honor: -2, order: -2 },
  vehicle: { tech: 3 }, robot: { tech: 4, humanity: -2 }, drone: { tech: 3, humanity: -2 },
  organic: { tech: -2 }, beast: { tech: -3, humanity: -2 },
  elite: { elite: 4 }, veteran: { elite: 3 }, cheap: { elite: -2 },
  expendable: { elite: -3 },
  honorable: { honor: 4 }, noble: { honor: 3 }, ruthless: { honor: -3 },
  treacherous: { honor: -4 }, poison: { honor: -2 },
  zealot: { faith: 4 }, faithful: { faith: 3 }, fearless: { faith: 2 },
  daemon: { faith: 3, purity: -4, humanity: -4 },
  stealth: { subtlety: 4 }, infiltrate: { subtlety: 4 }, scout: { subtlety: 3 },
  ambush: { subtlety: 3 }, sniper: { subtlety: 3 },
  ancient: { tradition: 4 }, traditional: { tradition: 3 },
  innovative: { tradition: -3 }, experimental: { tradition: -2 },
  pure: { purity: 4 }, corrupted: { purity: -4 }, mutant: { purity: -4 },
  fast: { speed: 4 }, mobile: { speed: 3 }, flying: { speed: 3 },
  cavalry: { speed: 3 }, slow: { speed: -2 },
  psychic: { mystery: 3 }, magic: { mystery: 3 }, ethereal: { mystery: 4 },
  versatile: { versatility: 4 }, adaptive: { versatility: 3 },
  specialist: { versatility: -3 }, balanced: { versatility: 2 },
  human: { humanity: 3 }, humanoid: { humanity: 2 }, alien: { humanity: -3 },
  monster: { humanity: -3 },
  commander: { leadership: 4 }, leader: { leadership: 3 },
  hero: { leadership: 2, elite: 1 },
  ranged: { patience: 1, tech: 1 }, melee: { patience: -1, tech: -1 },
  artillery: { patience: 2, tech: 2 }, tough: { patience: 1, elite: 1 },
  transport: { collective: 2, versatility: 1 },
  resilient: { patience: 2, elite: 1 },
  indirect: { subtlety: 1, patience: 1 },
  aircraft: { tech: 3, speed: 3 },
};

// === FACTION TYPE INFERENCE ===
// Known faction types for precise classification
const FACTION_TYPE_OVERRIDES = {
  // Grimdark Future
  'Alien Hives': 'organic',
  'Battle Brothers': 'tech',
  'Blessed Sisters': 'zealot',
  'Blood Brothers': 'tech',
  'Custodian Brothers': 'tech',
  'DAO Union': 'tech',
  'Dark Brothers': 'tech',
  'Dark Elf Raiders': 'mixed',
  'Dwarf Guilds': 'tech',
  'Elven Jesters': 'mixed',
  'Eternal Dynasty': 'tech',
  'Goblin Reclaimers': 'mixed',
  'Havoc Brothers': 'corrupted',
  'Havoc Warriors': 'corrupted',
  'High Elf Fleets': 'mixed',
  'Human Defense Force': 'human',
  'Human Inquisition': 'zealot',
  'Infected Colonies': 'corrupted',
  'Jackals': 'mixed',
  'Knight Brothers': 'tech',
  'Machine Cult': 'tech',
  'Orc Marauders': 'primitive',
  'Prime Brothers': 'tech',
  'Ratmen Clans': 'mixed',
  'Rebel Guerrillas': 'human',
  'Robot Legions': 'tech',
  'Saurian Starhost': 'organic',
  'Soul-Snatcher Cults': 'mixed',
  'Titan Lords': 'tech',
  'Watch Brothers': 'tech',
  'Wolf Brothers': 'tech',
  'Wormhole Daemons': 'corrupted',
  // Corrupted sub-factions
  'Blood Prime Brothers': 'corrupted',
  'Dark Prime Brothers': 'corrupted',
  'Knight Prime Brothers': 'corrupted',
  'Watch Prime Brothers': 'corrupted',
  'Wolf Prime Brothers': 'corrupted',
  'Wormhole Daemons of Change': 'corrupted',
  'Wormhole Daemons of Lust': 'corrupted',
  'Wormhole Daemons of Plague': 'corrupted',
  'Wormhole Daemons of War': 'corrupted',
};

function inferFactionType(raw) {
  const name = raw.name || '';

  // Check overrides first
  if (FACTION_TYPE_OVERRIDES[name]) return FACTION_TYPE_OVERRIDES[name];

  // Name-based inference
  const lowerName = name.toLowerCase();
  if (lowerName.includes('daemon') || lowerName.includes('wormhole')) return 'corrupted';
  if (lowerName.includes('prime brothers') || lowerName.includes('havoc')) return 'corrupted';
  if (lowerName.includes('hive') || lowerName.includes('saurian')) return 'organic';
  if (lowerName.includes('brothers') || lowerName.includes('robot') || lowerName.includes('machine')) return 'tech';
  if (lowerName.includes('inquisition') || lowerName.includes('sister')) return 'zealot';
  if (lowerName.includes('orc') || lowerName.includes('goblin')) return 'primitive';
  if (lowerName.includes('human') || lowerName.includes('defense')) return 'human';

  // Check unit composition
  const units = raw.units || [];
  const hasVehicles = units.some(u => {
    const gn = (u.genericName || '').toLowerCase();
    return gn.includes('tank') || gn.includes('walker') || gn.includes('vehicle') || gn.includes('apc');
  });
  const hasPsychic = units.some(u =>
    (u.rules || []).some(r => (r.name || '').toLowerCase().includes('caster'))
  );

  if (hasVehicles) return 'mixed';
  return 'mixed';
}

// === ROLE INFERENCE ===
function inferRole(unit) {
  const rules = unit.rules || [];
  const unitName = (unit.name || '').toLowerCase();
  const genericName = (unit.genericName || '').toLowerCase();

  const hasRule = (name) => rules.some(r =>
    (typeof r === 'string' ? r : r.name || '').toLowerCase().includes(name)
  );

  if (hasRule('hero')) return 'hero';

  // Vehicle detection
  if (genericName.includes('tank') || genericName.includes('walker') || genericName.includes('vehicle') ||
      genericName.includes('apc') || genericName.includes('transport') || genericName.includes('gunship') ||
      genericName.includes('aircraft') || genericName.includes('hover') || genericName.includes('titan walker')) {
    return 'vehicle';
  }
  if (unitName.includes('tank') || unitName.includes('walker') || unitName.includes('titan') ||
      unitName.includes('mech') || unitName.includes('gunship') || unitName.includes('apc')) {
    return 'vehicle';
  }
  if (hasRule('aircraft')) return 'vehicle';

  // Monster detection
  if (genericName.includes('monster') || genericName.includes('great beast') ||
      genericName.includes('titan monster')) {
    return 'monster';
  }

  // Swarm detection
  if ((unit.size || 1) >= 10) return 'swarm';

  // Artillery
  if (hasRule('artillery')) return 'heavy-support';

  // Fast-attack
  if (hasRule('fast') || hasRule('scout') || hasRule('ambush')) return 'fast-attack';
  if (genericName.includes('cavalry') || genericName.includes('bike') || genericName.includes('rider')) return 'fast-attack';

  // Elite
  const costPerModel = unit.cost / (unit.size || 1);
  if (costPerModel >= 30 && unit.quality <= 3) return 'elite';

  return 'troops';
}

// === MONO-TYPE DETECTION ===
function detectMonoType(units) {
  const validUnits = units.filter(u => u.cost > 0);
  const nonHeroes = validUnits.filter(u => {
    return !(u.rules || []).some(r =>
      (typeof r === 'string' ? r : r.name || '').toLowerCase() === 'hero'
    );
  });

  if (nonHeroes.length === 0) return { isMonoType: false, dominantRole: null, rolePercentage: 0 };

  const roleCounts = {};
  nonHeroes.forEach(u => {
    const role = inferRole(u);
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  const sorted = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0];
  const percentage = Math.round((dominant[1] / nonHeroes.length) * 100);

  return {
    isMonoType: percentage >= 80,
    dominantRole: dominant[0],
    rolePercentage: percentage
  };
}

// === FACTION-WIDE RULE DETECTION ===
function extractFactionWideRules(units) {
  if (units.length === 0) return [];
  // Rules that appear on >60% of units
  const ruleCounts = {};
  units.forEach(u => {
    (u.rules || []).forEach(r => {
      const name = (typeof r === 'string' ? r : r.name || '').toLowerCase();
      ruleCounts[name] = (ruleCounts[name] || 0) + 1;
    });
  });
  const threshold = units.length * 0.6;
  return Object.entries(ruleCounts)
    .filter(([, count]) => count >= threshold)
    .map(([name]) => name);
}

// === UNIT TAGGING ===
function tagUnit(unit, factionContext) {
  const tags = [];
  const unitName = (unit.name || '').toLowerCase();
  const genericName = (unit.genericName || '').toLowerCase();
  const factionType = factionContext.factionType;

  // --- Rule-based tags ---
  (unit.rules || []).forEach(rule => {
    const ruleName = (typeof rule === 'string' ? rule : rule.name || '').toLowerCase();

    // Movement
    if (ruleName === 'fast' || ruleName.includes('fast')) tags.push('fast');
    if (ruleName === 'flying' || ruleName.includes('flying')) tags.push('flying', 'mobile');
    if (ruleName === 'scout' || ruleName.includes('scout')) tags.push('scout', 'mobile');
    if (ruleName === 'ambush' || ruleName.includes('ambush')) tags.push('ambush', 'mobile');
    if (ruleName === 'strider' || ruleName.includes('strider')) tags.push('mobile');
    if (ruleName === 'slow' || ruleName.includes('slow')) tags.push('slow');
    if (ruleName === 'aircraft' || ruleName.includes('aircraft')) {
      if (factionType === 'organic') {
        tags.push('flying'); // organic flyers are NOT vehicles
      } else {
        tags.push('aircraft', 'flying', 'vehicle');
      }
    }
    if (ruleName.includes('bounding')) tags.push('fast');

    // Combat
    if (ruleName === 'hero') tags.push('hero', 'leader');
    if (ruleName.includes('tough')) tags.push('tough');
    if (ruleName === 'fearless' || ruleName.includes('fearless')) tags.push('fearless');
    if (ruleName === 'furious' || ruleName.includes('furious')) tags.push('aggressive');
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
    if (ruleName.includes('caster') || ruleName.includes('wizard') || ruleName.includes('psychic') ||
        ruleName.includes('spellcaster')) {
      tags.push('magic', 'psychic');
    }

    // Transport
    if (ruleName.includes('transport')) tags.push('transport');

    // v1.8.0: Honor Code and Mercenary
    if (ruleName.includes('honor code') || ruleName === 'honor code') tags.push('honorable', 'noble');
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
    if (ruleName.includes('fear') && !ruleName.includes('fearless')) { /* Fear doesn't determine monster */ }
  });

  // --- Items-based tags ---
  (unit.items || []).forEach(item => {
    (item.content || []).forEach(c => {
      const cName = (c.name || '').toLowerCase();
      if (cName.includes('shielded') || cName.includes('fortified')) tags.push('defensive');
      if (cName.includes('stealth')) tags.push('stealth');
    });
  });

  // --- Name-based detection ---
  // Vehicles
  if (unitName.includes('tank') || unitName.includes('apc') || unitName.includes('truck')) {
    tags.push('vehicle');
  }
  if (unitName.includes('walker') || unitName.includes('titan') || unitName.includes('mech') ||
      unitName.includes('dreadnought')) {
    if (factionType !== 'organic') tags.push('vehicle');
    else tags.push('monster');
  }
  if (unitName.includes('gunship') || unitName.includes('bomber') || unitName.includes('fighter')) {
    tags.push('aircraft', 'vehicle', 'flying');
  }
  if (unitName.includes('bike') || unitName.includes('speeder') || unitName.includes('jetbike') ||
      unitName.includes('hover')) {
    tags.push('vehicle', 'fast');
  }
  if (unitName.includes('suit') || unitName.includes('battlesuit')) {
    tags.push('vehicle');
  }
  // Cavalry
  if (unitName.includes('rider') || unitName.includes('cavalry') || unitName.includes('mounted') ||
      unitName.includes('chariot') || unitName.includes('biker')) {
    tags.push('cavalry', 'fast');
  }
  // Assassin
  if (unitName.includes('assassin')) tags.push('stealth');
  // Robot/Drone
  if (unitName.includes('robot') || unitName.includes('automaton') || unitName.includes('construct')) {
    tags.push('robot');
  }
  if (unitName.includes('drone')) tags.push('drone', 'robot');
  // Cyborg
  if (unitName.includes('cyborg')) tags.push('human');

  // genericName-based detection
  if (genericName.includes('tank') || genericName.includes('walker') || genericName.includes('vehicle') ||
      genericName.includes('apc') || genericName.includes('gunship') || genericName.includes('transport')) {
    if (factionType !== 'organic') tags.push('vehicle');
  }
  if (genericName.includes('monster') || genericName.includes('beast')) {
    tags.push('monster');
  }
  if (genericName.includes('swarm')) tags.push('horde', 'swarm');
  if (genericName.includes('infantry')) {
    if (factionType === 'human' || factionType === 'zealot') tags.push('human');
  }

  // --- Faction type context tags ---
  if (factionType === 'organic') tags.push('organic');
  if (factionType === 'corrupted') {
    tags.push('corrupted');
    // Daemons: corrupted + monster, NOT organic
    if (factionContext.factionName.toLowerCase().includes('daemon')) {
      tags.push('daemon');
    }
  }
  if (factionType === 'human' || factionType === 'zealot') {
    // Human infantry/heroes get human tag (not vehicles/robots)
    const role = inferRole(unit);
    if (role !== 'vehicle' && !unitName.includes('robot') && !unitName.includes('drone')) {
      tags.push('human');
    }
    if (factionType === 'zealot') tags.push('zealot');
  }
  if (factionType === 'tech') {
    // Tech factions: Space Marines, etc. - infantry are human
    const isBrothers = factionContext.factionName.toLowerCase().includes('brothers');
    const role = inferRole(unit);
    if (isBrothers && role !== 'vehicle') tags.push('human');
  }

  // --- Weapon analysis ---
  let hasRanged = false;
  let hasMelee = false;
  (unit.weapons || []).forEach(weapon => {
    if (weapon.range > 24) { hasRanged = true; }
    else if (weapon.range > 0) { hasRanged = true; }
    else { hasMelee = true; }

    (weapon.specialRules || []).forEach(sr => {
      const srName = (sr.name || '').toLowerCase();
      if (srName.includes('indirect')) tags.push('indirect');
      if (srName.includes('poison')) tags.push('poison');
    });
  });

  if (hasRanged && !hasMelee) tags.push('ranged');
  else if (hasMelee && !hasRanged) tags.push('melee');
  else if (hasRanged && hasMelee) tags.push('balanced');

  // --- Stats-based tags ---
  const costPerModel = unit.cost / (unit.size || 1);
  if (costPerModel >= 30 && unit.quality <= 3) tags.push('elite');
  else if (costPerModel >= 20 && unit.quality <= 4) tags.push('veteran');
  else if (costPerModel <= 12) tags.push('cheap');
  if (unit.quality >= 5) tags.push('expendable');
  if ((unit.size || 1) >= 10) tags.push('horde', 'swarm');
  if (unit.defense <= 3) tags.push('armored');

  // --- Mono-type versatility override (v1.8.0) ---
  if (factionContext.monoType && factionContext.monoType.isMonoType) {
    const idx1 = tags.indexOf('versatile');
    if (idx1 >= 0) tags.splice(idx1, 1);
    const idx2 = tags.indexOf('adaptive');
    if (idx2 >= 0) tags.splice(idx2, 1);
    tags.push('specialist');
  }

  // Deduplicate
  const uniqueTags = [...new Set(tags)];

  // Apply mutually exclusive tag checks
  return applyMutualExclusions(uniqueTags);
}

function applyMutualExclusions(tags) {
  const has = (t) => tags.includes(t);
  const remove = (t) => {
    const idx = tags.indexOf(t);
    if (idx >= 0) tags.splice(idx, 1);
  };

  // static vs fast/flying
  if (has('static') && has('fast')) remove('static');
  if (has('static') && has('flying')) remove('static');
  if (has('static') && has('aircraft')) remove('static');
  // slow vs fast
  if (has('slow') && has('fast')) remove('slow');
  // monster vs vehicle (vehicle wins for tech factions)
  if (has('monster') && has('vehicle')) remove('monster');
  // robot vs organic
  if (has('robot') && has('organic')) remove('organic');
  // elite vs cheap
  if (has('elite') && has('cheap')) remove('cheap');
  if (has('elite') && has('expendable')) remove('expendable');

  return tags;
}

// === DIMENSION SCORE COMPUTATION ===
function computeDimensionScores(tags, factionContext) {
  const scores = {};

  tags.forEach(tag => {
    const mapping = TAG_TO_DIM[tag];
    if (mapping) {
      Object.entries(mapping).forEach(([dim, val]) => {
        scores[dim] = (scores[dim] || 0) + val;
      });
    }
  });

  // Mono-type versatility override
  if (factionContext.monoType && factionContext.monoType.isMonoType) {
    const pct = factionContext.monoType.rolePercentage;
    if (pct >= 95) scores.versatility = -4;
    else if (pct >= 80) scores.versatility = Math.min(scores.versatility || 0, -2);
  }

  // Clamp to [-5, 5], remove zeros
  const clamped = {};
  Object.entries(scores).forEach(([dim, val]) => {
    const v = Math.max(-5, Math.min(5, val));
    if (v !== 0) clamped[dim] = v;
  });

  return clamped;
}

// === COMPACT WEAPONS ===
function buildCompactWeapons(weapons) {
  return (weapons || []).map(w => ({
    name: w.name,
    range: w.range || 0,
    attacks: w.attacks || 1,
    special: (w.specialRules || []).map(sr => sr.label || sr.name || '')
  }));
}

// === COMPACT UPGRADES ===
function buildCompactUpgrades(raw) {
  const packages = raw.upgradePackages || [];
  const units = raw.units || [];

  // Build reverse map: package uid -> which units reference it
  const pkgToUnits = {};
  units.forEach(u => {
    (u.upgrades || []).forEach(pkgRef => {
      if (!pkgToUnits[pkgRef]) pkgToUnits[pkgRef] = [];
      pkgToUnits[pkgRef].push(u.id);
    });
  });

  return {
    factionId: raw.uid,
    factionName: raw.name,
    packages: packages.map(pkg => ({
      uid: pkg.uid,
      hint: pkg.hint || '',
      forUnits: pkgToUnits[pkg.uid] || [],
      sections: (pkg.sections || []).map(s => ({
        label: s.label || '',
        variant: s.variant || 'upgrade',
        options: (s.options || []).map(o => {
          const gains = (o.gains || []).map(g => {
            if (g.type === 'ArmyBookWeapon') {
              return {
                name: g.name,
                type: 'weapon',
                range: g.range || 0,
                attacks: g.attacks || 1,
                special: (g.specialRules || []).map(sr => sr.label || sr.name || '')
              };
            } else if (g.type === 'ArmyBookItem') {
              return {
                name: g.name || g.label || '',
                type: 'item',
                content: (g.content || []).map(c => c.name || '')
              };
            } else {
              return { name: g.name || g.label || '', type: g.type || 'rule' };
            }
          });

          const upgradeTags = tagUpgradeGains(gains);

          return {
            uid: o.uid,
            label: o.label || gains.map(g => g.name).join(', '),
            cost: o.cost || 0,
            costs: (o.costs || []).map(c => ({ unitId: c.unitId, cost: c.cost })),
            gains,
            tags: upgradeTags,
            dimensionScores: upgradeGainsToScores(upgradeTags)
          };
        })
      }))
    }))
  };
}

function tagUpgradeGains(gains) {
  const tags = [];
  gains.forEach(g => {
    if (g.type === 'weapon') {
      if (g.range > 24) tags.push('long-range', 'ranged');
      else if (g.range > 0) tags.push('ranged');
      else tags.push('melee');

      (g.special || []).forEach(sp => {
        const s = (typeof sp === 'string' ? sp : '').toLowerCase();
        if (s.includes('ap(')) tags.push('anti-armor');
        if (s.includes('blast')) tags.push('anti-horde');
        if (s.includes('deadly')) tags.push('anti-elite');
        if (s.includes('indirect')) tags.push('indirect');
        if (s.includes('poison')) tags.push('poison');
        if (s.includes('rending')) tags.push('anti-armor');
        if (s.includes('sniper')) tags.push('sniper');
      });
    }
    if (g.type === 'item') {
      (g.content || []).forEach(c => {
        const cn = (c || '').toLowerCase();
        if (cn.includes('stealth')) tags.push('stealth');
        if (cn.includes('shielded') || cn.includes('fortified')) tags.push('defensive');
      });
    }
  });
  return [...new Set(tags)];
}

function upgradeGainsToScores(tags) {
  const scores = {};
  // Simplified dimension scoring for upgrades
  const map = {
    ranged: { patience: 1, tech: 1 }, melee: { patience: -1 },
    'long-range': { patience: 2, tech: 2 }, 'anti-armor': { elite: 1 },
    'anti-horde': { collective: 1 }, 'anti-elite': { elite: 1 },
    indirect: { subtlety: 1, patience: 1 }, stealth: { subtlety: 3 },
    defensive: { patience: 2 }, sniper: { subtlety: 2, patience: 1 },
    poison: { honor: -2 },
  };
  tags.forEach(tag => {
    const mapping = map[tag];
    if (mapping) {
      Object.entries(mapping).forEach(([dim, val]) => {
        scores[dim] = (scores[dim] || 0) + val;
      });
    }
  });
  const clamped = {};
  Object.entries(scores).forEach(([dim, val]) => {
    const v = Math.max(-5, Math.min(5, val));
    if (v !== 0) clamped[dim] = v;
  });
  return clamped;
}

// === MAIN PROCESSING ===
function processArmyBook(filePath, gameSystem) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const factionName = raw.name;
  if (!factionName) {
    console.warn(`  Skipping ${filePath}: no faction name`);
    return null;
  }

  const units = (raw.units || []).filter(u => u.cost > 0);
  if (units.length === 0) {
    console.warn(`  Skipping ${factionName}: no valid units`);
    return null;
  }

  // Detect mono-type
  const monoType = detectMonoType(units);

  // Build faction context
  const factionContext = {
    factionName,
    gameSystem,
    factionType: inferFactionType(raw),
    monoType,
    factionRules: extractFactionWideRules(units),
  };

  // Tag each unit
  const taggedUnits = units.map(u => {
    const tags = tagUnit(u, factionContext);
    const role = inferRole(u);
    const dimensionScores = computeDimensionScores(tags, factionContext);

    const result = {
      id: u.id,
      name: u.name,
      cost: u.cost,
      size: u.size || 1,
      quality: u.quality,
      defense: u.defense,
      role,
      rules: (u.rules || []).map(r => typeof r === 'string' ? r : r.label || r.name),
      weapons: buildCompactWeapons(u.weapons),
      upgradeIds: u.upgrades || [],
      tags,
      dimensionScores
    };
    // Preserve unit type: "1" = narrative hero, "0" = special construct
    if (u.type !== undefined) result.unitType = String(u.type);
    return result;
  });

  // Write tagged unit file
  const taggedOutput = {
    factionId: raw.uid || '',
    factionName,
    gameSystem,
    factionType: factionContext.factionType,
    version: VERSION,
    taggedAt: new Date().toISOString(),
    monoType,
    units: taggedUnits,
    background: raw.background || '',
    backgroundFull: raw.backgroundFull || '',
  };

  const fileName = path.basename(filePath);
  const taggedPath = path.join(TAGGED_DIR, gameSystem, fileName);
  fs.mkdirSync(path.dirname(taggedPath), { recursive: true });
  fs.writeFileSync(taggedPath, JSON.stringify(taggedOutput, null, 2));

  // Write compact upgrade file
  if ((raw.upgradePackages || []).length > 0) {
    const upgradesOutput = buildCompactUpgrades(raw);
    const upgradePath = path.join(UPGRADES_DIR, gameSystem, fileName);
    fs.mkdirSync(path.dirname(upgradePath), { recursive: true });
    fs.writeFileSync(upgradePath, JSON.stringify(upgradesOutput, null, 2));
  }

  const honorCodeCount = taggedUnits.filter(u => u.tags.includes('honorable')).length;
  const monoInfo = monoType.isMonoType
    ? `MONO-TYPE (${monoType.dominantRole}, ${monoType.rolePercentage}%)`
    : `diverse`;

  console.log(`  ${factionName}: ${taggedUnits.length} units, type=${factionContext.factionType}, ${monoInfo}${honorCodeCount > 0 ? `, honor=${honorCodeCount}/${taggedUnits.length}` : ''}`);

  return { factionName, unitCount: taggedUnits.length, factionType: factionContext.factionType };
}

// === MAIN ===
function main() {
  console.log(`=== OPR Army Book Retagger v${VERSION} ===`);
  console.log('');

  let totalFactions = 0;
  let totalUnits = 0;

  for (const gameSystem of Object.keys(GAME_SYSTEMS)) {
    const inputDir = path.join(UNTAGGED_DIR, gameSystem);
    if (!fs.existsSync(inputDir)) {
      console.log(`Skipping ${gameSystem}: no untagged directory`);
      continue;
    }

    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.json'));
    console.log(`\n=== ${gameSystem.toUpperCase()} (${files.length} files) ===`);

    let systemFactions = 0;
    let systemUnits = 0;

    for (const file of files.sort()) {
      const result = processArmyBook(path.join(inputDir, file), gameSystem);
      if (result) {
        systemFactions++;
        systemUnits += result.unitCount;
      }
    }

    console.log(`  Subtotal: ${systemFactions} factions, ${systemUnits} units`);
    totalFactions += systemFactions;
    totalUnits += systemUnits;
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total: ${totalFactions} factions, ${totalUnits} units`);
  console.log(`Version: ${VERSION}`);
  console.log('Done!');
}

main();
