# OPR Unit Personality Tagger Skill - Version 1.8.0

## Overview

This skill enables an AI agent to analyze One Page Rules (OPR) army book JSON files and add personality-based tags to each unit. These tags are used by the OPR Army Alignment Quiz to match units to player personalities based on 15 psychological dimensions.

**Version 1.8.0 Update:** Titan Lords & Mono-Type Army Fixes — Mono-type army versatility override, Honor Code rule mapping, Titan Lords faction guidance, Dimension Inflation Check.

## Critical Distinction: Corrupted vs Organic

**THIS IS THE #1 MOST IMPORTANT TAGGING RULE**

### The Core Difference

| Concept | What It Means | Tags | Example |
|---------|---------------|------|---------|
| **Corrupted** | Chaos corruption, daemonic influence | `corrupted` + type | Chaos Marines, Daemons |
| **Organic** | Biological creatures (Tyranids, beasts) | `organic` + type | Alien Hives, Saurians |

### Critical Rules

**Pure Daemons (Wormhole Daemons)**
```
✅ CORRECT: corrupted + monster (NO organic!)
❌ WRONG: organic + monster
Reason: Daemons are supernatural entities, NOT biological creatures
```

**Corrupted Space Marines (Prime Brothers)**
```
✅ CORRECT: corrupted + tech + human
❌ WRONG: corrupted + monster
❌ WRONG: corrupted (without tech)
Reason: They're still armored warriors with tech weapons
```

**Tyranids (Alien Hives)**
```
✅ CORRECT: organic + monster (large creatures)
✅ CORRECT: organic + horde (small creatures)
❌ WRONG: corrupted + monster
Reason: Pure biological creatures, not Chaos-corrupted
```

## Quick Faction Reference

Use this table to quickly identify faction types:

| Faction Pattern | Type | Core Tags | Example |
|-----------------|------|-----------|---------|
| "Brothers" (non-Prime) | Tech | `tech` + `human` | Battle Brothers |
| "Prime Brothers" | Corrupted | `corrupted` + `tech` + `human` | Dark Prime Brothers |
| "Wormhole Daemons" | Corrupted | `corrupted` + `monster` (NO `organic`!) | Wormhole Daemons of War |
| "Disciples" (mortal) | Corrupted | `corrupted` + `human` | Plague Disciples |
| "Alien Hives" | Organic | `organic` + `monster`/`horde` | Alien Hives |
| "Saurian" | Organic | `organic` + `monster` | Saurian Starhost |
| "Ratmen" | Organic | `organic` + `horde` | Ratmen Clans |
| "Orc"/"Goblin" | Primitive | `organic` + `primitive` | Orc Marauders, Goblin Reclaimers |
| "DAO Union" | Tech | `tech` + `ranged` | DAO Union (Tau) |
| "Robot Legions"/"Eternal Dynasty" | Tech | `tech` + `resilient` | Robot Legions, Eternal Dynasty |
| "Infected Colonies" | Corrupted | `corrupted` + `human` (hybrids) | Infected Colonies (GSC) |
| "Defense Force" | Mixed | `human` + `tech` (has vehicles) | Human Defense Force |
| "Inquisition" | Zealot | `human` + `zealot` | Human Inquisition |
| "Sisters" | Zealot | `human` + `zealot` + `tech` | Blessed Sisters |

## Input Format

The agent receives an OPR army book JSON file with the following structure:

```json
{
  "uid": "unique-id",
  "name": "Faction Name",
  "genericName": "Generic Faction Name",
  "background": "Brief lore description",
  "units": [
    {
      "id": "unitId",
      "name": "Unit Name",
      "cost": 100,
      "size": 5,
      "quality": 4,
      "defense": 4,
      "genericName": "Infantry",
      "rules": [
        { "name": "Hero", "label": "Hero" },
        { "name": "Tough", "rating": 3, "label": "Tough(3)" },
        { "name": "Fast", "label": "Fast" }
      ],
      "weapons": [
        {
          "name": "Heavy Rifle",
          "range": 24,
          "attacks": 2,
          "specialRules": [
            { "name": "AP", "rating": 1, "label": "AP(1)" }
          ]
        }
      ]
    }
  ],
  "specialRules": [
    { "id": "ruleId", "name": "RuleName", "description": "What this rule does" }
  ]
}
```

## Input Properties Reference

### Faction-Level Properties (use for faction theme detection)

| Property | Description | Tagging Use |
|----------|-------------|-------------|
| `name` | Faction display name | Faction identification |
| `genericName` | Generic faction type | Faction theme (e.g., "Space Enforcers", "Hive Aliens") |
| `background` | Lore description | Understand faction personality/themes |
| `gameSystemSlug` | Game system | "grimdark-future", "age-of-fantasy", etc. |

### Unit-Level Properties (PRIMARY tagging sources)

| Property | Description | Tagging Use |
|----------|-------------|-------------|
| `id` | Unique unit ID | Preserve in output |
| `name` | Unit name | **CRITICAL** - Name-based detection (Tank, Walker, Suit, Drone, etc.) |
| `cost` | Point cost | Elite/cheap calculation (cost ÷ size) |
| `size` | Model count | Swarm detection (10+), elite calculation |
| `quality` | Quality stat | Elite (Q3+) vs expendable (Q5+) |
| `defense` | Defense stat | Less useful for personality tagging |
| `genericName` | Generic unit type | **VERY USEFUL** - See reference table below |
| `rules[]` | Unit rules array | **CRITICAL** - Primary source of ability tags |
| `weapons[]` | Weapons array | Ranged vs melee detection |
| `items[]` | Equipment items | May contain additional rules (e.g., Shielded from Combat Shield) |

### Generic Name Reference (unit.genericName)

The `genericName` field provides pre-classified unit types. Use this for role and tag detection:

**Hero Types:**
- `"Infantry Hero"`, `"Heavy Infantry Hero"`, `"Veteran Infantry Hero"` → hero role
- `"Monster Hero"`, `"Great Monster Hero"` → hero + monster traits
- `"Brute Hero"`, `"Tank Hero"`, `"Walker Hero"` → hero + respective type

**Infantry Types:**
- `"Infantry"`, `"Light Infantry"` → troops role, often cheap/expendable
- `"Heavy Infantry"`, `"Elite Infantry"` → elite role, veteran/elite tags
- `"Assault Infantry"` → aggressive, melee
- `"Support Infantry"` → ranged, support

**Vehicle Types:**
- `"Tank"`, `"Heavy Tank"`, `"Hover Tank"` → vehicle role, `vehicle` tag
- `"Walker"`, `"Heavy Walker"`, `"Titan Walker"` → vehicle role
- `"Gunship"`, `"Heavy Gunship"` → vehicle + aircraft
- `"Transport Tank"`, `"Transport Vehicle"` → vehicle + transport
- `"APC"`, `"Hover Transport"` → vehicle + transport

**Monster/Beast Types:**
- `"Monster"`, `"Heavy Monster"`, `"Titan Monster"` → monster role, organic
- `"Beasts"`, `"Heavy Beasts"`, `"Assault Beasts"` → beast tag, organic
- `"Great Beast"`, `"Great Monster"` → monster role, elite

**Special Types:**
- `"Drones"`, `"Sniper Drones"` → drone + robot tags
- `"Robots"`, `"Heavy Robots"` → robot tag
- `"Swarms"`, `"Flying Swarms"` → swarm role, horde tag
- `"Bikers"`, `"Jetbikers"` → cavalry, fast
- `"Scouts"`, `"Elite Scouts"` → scout, mobile, stealth
- `"Artillery"`, `"Artillery Vehicle"` → static, ranged, defensive

### Unit Rules Reference (unit.rules[].name)

**Movement Rules:**
| Rule | Tags to Apply | Dimensions |
|------|---------------|------------|
| `Fast` | `fast` | speed: +4 |
| `Flying` | `flying` | speed: +3 |
| `Scout` | `scout`, `mobile` | subtlety: +3, speed: +3 |
| `Ambush` | `ambush`, `mobile` | subtlety: +3 |
| `Strider` | `mobile` | speed: +3 |
| `Slow` | `slow` | speed: -2 |
| `Aircraft` | `aircraft`, `flying`, `vehicle` | speed: +3, tech: +3 |
| `Bounding` | `fast` | speed: +2 |

**Combat Rules:**
| Rule | Tags to Apply | Dimensions |
|------|---------------|------------|
| `Hero` | `hero`, `leader` | leadership: +2, collective: -1 |
| `Tough(X)` | `tough` (if elite) | — (use stats for elite) |
| `Fear(X)` | — | — (does NOT determine monster/vehicle) |
| `Fearless` | `fearless` | faith: +2 |
| `Furious` | `aggressive` | patience: -3 |
| `Impact(X)` | `aggressive` | patience: -3 |
| `Shielded` | `defensive` | patience: +2 |
| `Regeneration` | `regeneration` | — (NOT auto-defensive) |
| `Stealth` | `stealth` | subtlety: +4 |
| `Relentless` | `ranged` | — |
| `Artillery` | `artillery`, `static`, `ranged` | speed: -3, patience: +2 |

**Special Rules:**
| Rule | Tags to Apply | Dimensions |
|------|---------------|------------|
| `Caster` / `Caster Group` / `Wizard` | `magic`, `psychic` | mystery: +3 |
| `Transport(X)` | `transport` | — |
| `Good Shot` | `ranged` | — |

**Faction-Wide Rules (Expanded):**
| Rule | Tags to Apply | Dimensions |
|------|---------------|------------|
| `Battleborn` | `disciplined`, `fearless` | order: +2, faith: +1 |
| `Bloodborn` | `aggressive`, `melee` | patience: -2, faith: +1 |
| `Darkborn` | `stealth` | subtlety: +2 |
| `Hold the Line` | `disciplined` | order: +2 |
| `Hive Bond` | `collective` | collective: +2 |
| `Mischievous` | `treacherous`, `cunning` | honor: -3, order: -2 |
| `Reinforced` | `tough`, `resilient` | — |
| `Targeting Visor` | — | (tech faction indicator) |
| `For the Greater Good` | `collective`, `disciplined` | collective: +2, order: +2 |
| `WAAAGH!` / `Ferocious` | `aggressive`, `chaotic` | patience: -2, order: -2 |
| `Changebound` / `Lustbound` / `Plaguebound` / `Warbound` | `corrupted` + god-specific | purity: -4 |
| `Honor Code` | `honorable`, `noble` | honor: +4, honor: +3 |
| `Mercenary` | `independent` | collective: -2 |

### Weapon Properties Reference (unit.weapons[])

| Property | Tagging Use |
|----------|-------------|
| `range` | 0 or null = melee; 12"+ = ranged; 24"+ = long-range |
| `attacks` | Higher = more offensive |
| `specialRules[].name` | AP, Blast, Indirect (artillery), Rending, etc. |

**Weapon-Based Combat Style:**
- ALL weapons have range 0/null → `melee` tag
- ALL weapons have range 12"+ → `ranged` tag
- Mix of melee and ranged → `balanced` tag
- Weapons with `Indirect` → artillery indicator

### Items/Equipment Reference (unit.items[])

Equipment items may contain embedded rules:
```json
{
  "name": "Combat Shield",
  "content": [{ "name": "Shielded", "type": "ArmyBookRule" }]
}
```

Check `items[].content[].name` for additional rules like:
- `Shielded` → defensive tag
- `Stealth` → stealth tag
- Various stat modifiers

## Output Format

The agent produces a tagged unit file with the following structure:

```json
{
  "factionId": "faction-slug",
  "factionName": "Faction Name",
  "gameSystem": "grimdark-future",
  "version": "1.8.0",
  "taggedAt": "2026-02-01T00:00:00Z",
  "units": [
    {
      "id": "unitId",
      "name": "Unit Name",
      "cost": 100,
      "size": 5,
      "quality": 4,
      "defense": 4,
      "role": "troops",
      "rules": ["Hero", "Tough(3)", "Fast"],
      "tags": ["hero", "elite", "fast", "melee", "leader"],
      "dimensionScores": {
        "elite": 3,
        "speed": 2,
        "leadership": 3
      }
    }
  ]
}
```

## Personality Dimensions

The quiz uses 15 personality dimensions. Each dimension ranges from -5 to +5:

| Dimension | Negative (-5) | Positive (+5) | Description |
|-----------|---------------|---------------|-------------|
| **patience** | Aggressive, rushes in | Patient, defensive, waits | Combat tempo preference |
| **collective** | Independent, solo | Swarm, horde, teamwork | Individual vs group tactics |
| **order** | Chaotic, unpredictable | Disciplined, organized | Army organization style |
| **tech** | Organic, primitive, beast | Vehicles, robots, hi-tech | Technology reliance |
| **elite** | Cheap, expendable, horde | Elite, veteran, few models | Model quality vs quantity |
| **honor** | Ruthless, treacherous | Honorable, noble, chivalric | Combat ethics |
| **faith** | Secular, pragmatic | Zealous, faithful, devout | Religious motivation |
| **subtlety** | Direct, obvious, frontal | Stealth, infiltrate, ambush | Tactical approach |
| **tradition** | Innovative, experimental | Ancient, traditional | Innovation vs tradition |
| **purity** | Corrupt, mutant, daemon | Pure, uncorrupted | Corruption level |
| **speed** | Slow, static, artillery | Fast, mobile, cavalry | Movement preference |
| **mystery** | Mundane, practical | Psychic, magical, ethereal | Supernatural elements |
| **versatility** | Specialist, focused | Versatile, adaptive | Role flexibility |
| **humanity** | Alien, monster, daemon | Human, humanoid | Species alignment |
| **leadership** | Autonomous, independent | Commander, inspiring | Leadership focus |

## Tagging Rules

### Step 0: Determine Faction Type (DO THIS FIRST!)

Before tagging ANY unit, determine the faction's nature. This affects ALL subsequent tagging decisions.

**Faction Classification (Updated v1.7.1):**

| Faction Type | Examples | Default Tech | Default Tags |
|--------------|----------|--------------|--------------|
| **Organic** | Alien Hives, Saurian Starhost, Ratmen | tech: -2 to -3 | `organic`, negative tech |
| **Tech** | DAO Union, Robot Legions, Battle Brothers | tech: +2 to +4 | `tech`, positive tech |
| **Corrupted** | Wormhole Daemons, Prime Brothers, Disciples | varies | `corrupted` + type |
| **Zealot** | Human Inquisition, Blessed Sisters | varies | `zealot`, `faithful`, positive faith |
| **Mixed** | Eldar variants, Soul-Snatcher Cults | varies by unit | Check each unit |
| **Primitive** | Goblins, Orcs (melee-focused, NO vehicles) | tech: -1 to -2 | `organic` + `primitive` |

**CRITICAL: How to Determine Faction Type**
- Does faction have VEHICLES? → NOT primitive (Mixed, Tech, or Zealot)
- Does faction have robots/drones? → Tech
- Is faction religious (Inquisition, Sisters, Crusaders)? → Zealot
- Is faction 100% biological creatures? → Organic
- Does faction use chaos/corruption? → Corrupted

**COMMON MISTAKE: Human Inquisition as "primitive"**
Human Inquisition has vehicles, hi-tech assassins, cyborgs — it is NOT primitive!
- Correct type: `"factionType": "zealot"` or `"factionType": "mixed"`
- Primitive = low-tech melee-only factions (Goblins, Orcs, tribal armies)

**NEW v1.7.0: Corrupted Faction Types**

Corrupted factions come in three sub-types:

1. **Pure Daemons** (Wormhole Daemons)
   - Tags: `corrupted` + `monster`
   - NEVER add `organic` tag
   - These are supernatural entities, not biological

2. **Corrupted Space Marines** (Prime Brothers)
   - Tags: `corrupted` + `tech` + `human`
   - KEEP the `tech` and `human` tags
   - They're still armored warriors

3. **Mortal Cultists** (Disciples)
   - Tags: `corrupted` + `human`
   - May have `tech` if using advanced equipment
   - Human worshippers of Chaos

**NEW v1.7.1: Zealot Faction Rules (Human Inquisition, Blessed Sisters, etc.):**
- Religious/inquisition factions are MIXED for tech (infantry + vehicles)
- ALL infantry/heroes are HUMAN → `human` tag, `humanity: +2 to +3`
- Religious units get `zealot` or `faithful` tags, `faith: +2 to +4`
- Fearless from religious fervor → `faith: +2`
- Vehicles are mechanical → `vehicle` tag, `tech: +3`
- Assassins get `stealth` tag, `subtlety: +3`

**Organic Faction Rules (Alien Hives, Saurians, etc.):**
- ALL units default to `organic` tag
- ALL units get NEGATIVE tech dimension (-2 to -3)
- "Titan" = giant organic creature, NOT mechanical
- "Aircraft" rule = flying creature, NOT vehicle
- "Grunt" = organic auxiliaries, NOT robots
- Transport units = living carriers, NOT vehicles

**Tech Faction Rules (DAO Union, Robot Legions, etc.):**
- Vehicles get `vehicle` tag + positive tech
- "Grunt" = robots/automatons
- "Drone" = autonomous machines
- "Suit" = piloted mechs

**Why This Matters:**
```
Same unit name, different faction context:

"Titan" in Human Defense Force → VEHICLE (mechanical walker)
"Titan" in Alien Hives → MONSTER (giant organic creature)

"Grunt" in DAO Union → ROBOT (tech: +4)
"Grunt" in Alien Hives → ORGANIC (tech: -2)

"Aircraft" in HDF → VEHICLE (gunship)
"Aircraft" in Alien Hives → FLYING MONSTER (organic flyer)

"Daemon" in Wormhole Daemons → CORRUPTED + MONSTER (NO organic!)
"Daemon" does NOT mean organic/biological
```

### Step 1: Identify Unit Role

Classify each unit into one of these roles:
- **hero**: Has the "Hero" rule
- **troops**: Basic infantry, core choices (size 5-20, moderate cost)
- **elite**: Veteran/specialized infantry (quality 3+, Tough rule, higher cost)
- **fast-attack**: Has Fast, Ambush, Scout, or Flying rules (including Aircraft)
- **heavy-support**: Artillery, heavy weapons, slow but powerful
- **vehicle**: Tanks, APCs, walkers, aircraft, trucks — ANY mechanical combat platform (see Step 1d)
- **monster**: Large ORGANIC creatures (Tough 6+, Fear rule) OR daemons — NOT mechanical walkers
- **swarm**: Large model count (size 10+), cheap per model

**CRITICAL: Monster vs Vehicle Distinction**
- `monster` = Organic/biological creatures (beasts, tyranids, trolls) OR supernatural entities (daemons)
- `vehicle` = Mechanical constructs (tanks, walkers, robots, aircraft, APCs)

**Key Examples:**
- Combat Walker or Tactical Titan = VEHICLE (mechanical construct)
- Tyranid Carnifex = MONSTER (organic creature)
- Bloodthirster Daemon = MONSTER (supernatural entity, NOT organic!)
- Space Marine Bike = VEHICLE (mechanical, even though ridden)

### Step 1b: Calculate Stats-Based Tags (IMPORTANT)

Before applying rule-based tags, calculate these tags from unit statistics:

**Elite vs Cheap Calculation:**
The `elite` tag and dimension score must be calculated from STATS, not just from having Tough:

```
cost_per_model = cost / size
quality_score = 6 - quality  (Q3+ is good, Q5+ is poor)

IF cost_per_model >= 30 AND quality <= 3:
  → Tag as "elite", elite dimension = +3 to +4
ELSE IF cost_per_model >= 20 AND quality <= 4:
  → Tag as "veteran", elite dimension = +1 to +2
ELSE IF cost_per_model <= 12:
  → Tag as "cheap", elite dimension = -2
ELSE IF quality >= 5:
  → Tag as "expendable", elite dimension = -3
ELSE:
  → No elite-related tag, elite dimension = 0
```

**Threshold Reference Table:**

| Cost/Model | Quality | Tags | Elite Score |
|------------|---------|------|-------------|
| ≥30 pts | Q3+ | `elite` | +4 |
| ≥30 pts | Q4 | `veteran` | +3 |
| 20-29 pts | Q4+ | `veteran` | +2 |
| 13-19 pts | Q4+ | (none) | 0 |
| 13-19 pts | Q5+ | `expendable` | -3 |
| ≤12 pts | any | `cheap` | -2 |
| ≤12 pts | Q5+ | `cheap`, `expendable` | -4 |

**Example Calculations:**
- Battle Brothers (165pts / 5 models = 33pts each, Q3) → `elite` (+4)
- Storm Troopers (110pts / 5 = 22pts, Q4) → `veteran` (+2)
- Snipers (125pts / 3 = **41.7pts**, Q5) → NOT cheap! Just `expendable` (-3)
- Weapon Teams (135pts / 3 = **45pts**, Q5) → NOT cheap! Just `expendable` or none
- Goblin Leader (25pts / 1 model = 25pts, Q5) → NOT elite, `expendable` (-3)
- Goblin Warriors (60pts / 10 models = 6pts each, Q5) → `cheap`, `expendable` (-5)
- Recruits (75pts / 10 = 7.5pts, Q6) → `cheap`, `expendable` (-5)

**CRITICAL RULES:**
1. Having Tough(3) does NOT automatically make a unit elite
2. Cost/model > 12pts means NOT cheap, even if Q5+
3. Single expensive models (vehicles, monsters) use their full cost
4. Q5+ units are usually `expendable` regardless of Tough

### Step 1c: Apply Role-Required Tags

Certain roles REQUIRE specific tags:

| Role | Required Tags | Required Dimensions |
|------|---------------|---------------------|
| monster | `monster` | `humanity: -3 to -4`, `tech: -2 to -3` (organic) OR `purity: -4` (daemon) |
| vehicle | `vehicle` | `tech: +3 to +4` |
| swarm | `horde`, `swarm` | `collective: +3 to +4`, `elite: -2 to -4` |
| hero | `hero` | `leadership: +2 to +4` |

### Step 1d: Name-Based Detection (IMPORTANT)

Detect unit types from their NAME, not just their rules. This catches many missed tags:

**Vehicle Detection — If unit name contains ANY of these, add `vehicle` tag + `tech: +3`:**
- "Tank", "APC", "Vehicle", "Truck", "Transport"
- "Walker", "Titan", "Mech", "Dreadnought"
- "Gunship", "Aircraft", "Flyer", "Bomber", "Fighter"
- "Artillery" (when mechanical), "Cannon" (when on vehicle)
- "Bike", "Speeder", "Jetbike", "Hover"

**CRITICAL v1.7.0: ALL Bikes are Vehicles**
```
Space Marine Bike → tech + vehicle + fast-attack ✅
Ork Bike → vehicle + primitive + fast-attack ✅
Chaos Bike → corrupted + tech + vehicle + fast-attack ✅
Eldar Jetbike → tech + vehicle + fast-attack + flying ✅
```

**Battlesuit/Mech Detection — CRITICAL for tech factions:**
If unit name contains ANY of these, it's TECHNOLOGY (vehicle), NOT a monster:
- "Suit", "Battle Suit", "Battlesuit", "Stealth Suit"
- "Armor", "Exo-", "Power Armor", "Powered"
- "Mech", "Mechsuit", "Warsuit"

Even if a Battlesuit has Fear(2) or Tough(12), it is still a **vehicle** because:
- It's piloted mechanical armor, not an organic creature
- Fear represents intimidation, not biological horror
- Apply: `vehicle` tag + `tech: +3` (or higher for advanced suits)

**Aircraft Detection — CRITICAL: Check if organic or mechanical FIRST!**

The `Aircraft` rule does NOT automatically make a unit a vehicle. Check faction/unit context:

```
Unit has Aircraft rule
    │
    ├─► Is it an ORGANIC creature? (Beast, Hive, Tyranid, Dragon, etc.)
    │       │
    │       └─► YES → Add `flying` tag + `speed: +3`
    │                 Keep `monster` role, `beast`/`organic` tags
    │                 DO NOT add `vehicle` or `aircraft` tag
    │                 tech: NEGATIVE (organic flyer)
    │
    └─► Is it a MECHANICAL aircraft? (Gunship, Fighter, Bomber, etc.)
            │
            └─► YES → Add `aircraft`, `flying`, `vehicle` tags
                      Add `tech: +3`, `speed: +3`
```

**Examples:**
- Rapacious Beast (Alien Hives) + Aircraft → `flying`, `monster`, `beast`, `organic`, tech: -3
- Light Gunship (HDF) + Aircraft → `aircraft`, `flying`, `vehicle`, tech: +3
- Sun Bomber (DAO Union) + Aircraft → `aircraft`, `flying`, `vehicle`, tech: +3

**Organic creatures with Aircraft rule are flying monsters, NOT vehicles!**

**Cavalry Detection — If unit name contains:**
- "Rider", "Cavalry", "Mounted", "Chariot", "Biker"
- Add `cavalry` tag + `speed: +3`

**Assassin Detection — If unit name contains "Assassin":**
- Add `stealth` tag + `subtlety: +3`
- Assassins are stealth operatives by definition
- Also check for supporting rules: Ambush, Scout, Surprise Attack, Evasive, Hit & Run
- Keep `human` tag if in human faction (Inquisition, etc.)

**Cyborg Detection — If unit name contains "Cyborg":**
- Add `tech: +1 to +2` (tech-enhanced human, not full robot)
- KEEP `human` tag (still humanoid)
- Cyborgs are augmented humans, not pure machines

**Robot/Automaton Detection — If unit name contains:**
- "Robot", "Automaton", "Construct"
- Add `robot` tag + `tech: +4` + `humanity: -2`

**Drone Detection — If unit name contains "Drone":**
- Add BOTH `drone` AND `robot` tags
- Add `tech: +4` + `humanity: -2`
- Drones are autonomous machines, always technological

**Grunt Detection — FACTION-SPECIFIC (CRITICAL):**

"Grunt" means DIFFERENT things in different factions:

| Faction | Grunt Type | Tags | Tech Dimension |
|---------|------------|------|----------------|
| **DAO Union** | Robots/Automatons | `robot` | tech: +4, humanity: -2 |
| **Alien Hives** | Organic auxiliaries | `organic`, `beast` | tech: -2, humanity: -2 |
| **Other factions** | Check faction lore | varies | varies |

**How to determine:**
1. Check faction name first
2. If "Alien Hives", "Hive", "Tyranid-like" → Grunts are ORGANIC
3. If "DAO Union", "Tau-like", tech faction → Grunts are ROBOTS
4. Apply consistently to ALL Grunt units in that faction

**WRONG:** Assuming all Grunts are robots
**RIGHT:** Checking faction context first

**Infantry Faction Detection — For human/humanoid armies:**
- Basic infantry should get `human` or `humanoid` tag
- Adds `humanity: +2 to +3`

### Step 1e: Monster vs Vehicle Decision Tree

Use this decision tree when a unit has Fear, high Tough, OR Aircraft rule:

```
Step 1: Determine if unit is ORGANIC, CORRUPTED, or MECHANICAL
        ───────────────────────────────────────────────────────

Is the faction Wormhole Daemons or has daemon keyword?
    │
    ├─► YES → Unit is a DAEMON
    │         Apply: monster role, corrupted tag
    │         DO NOT add organic tag
    │         tech: varies (usually none)
    │
    └─► NO → Is the faction primarily organic? (Alien Hives, Saurians, etc.)
             │
             ├─► YES → Default assumption: units are ORGANIC
             │         Even "Titan" or "Aircraft" units are organic creatures
             │         Apply: monster role, beast/organic tags, tech: -2 to -3
             │
             └─► NO → Is the unit name organic/biological?
                      (Beast, Spider, Dragon, Troll, Carnifex, Hive, Spore, etc.)
                          │
                          ├─► YES → role: monster, tags: monster/beast/organic
                          │         tech: -2 to -3, humanity: -3 to -4
                          │
                          └─► NO → Is the name mechanical/technological?
                                   (Walker, Titan, Suit, Mech, Tank, Gunship, etc.)
                                       │
                                       ├─► YES → role: vehicle, tag: vehicle
                                       │         tech: +3 to +4
                                       │
                                       └─► UNCLEAR → Check faction context:
                                                     • Tech faction → vehicle
                                                     • Organic faction → monster
                                                     • Corrupted faction → check if daemon or marine
```

**Special Case: Aircraft Rule on Organic Units**
```
Unit has Aircraft rule + is from organic faction (Alien Hives, etc.)
    │
    └─► This is a FLYING MONSTER, not a vehicle
        • role: monster (or fast-attack)
        • tags: flying, monster, beast, organic
        • tech: -2 to -3 (NEGATIVE, not positive!)
        • speed: +3 (flying is still fast)
        • DO NOT add vehicle or aircraft tag
```

**Key Principles:**
1. **Faction context overrides name-based detection** for organic factions
2. **Daemons are NOT organic** - they're supernatural, not biological
3. Fear rule does NOT determine monster vs vehicle
4. Aircraft rule does NOT automatically = vehicle (check if organic)
5. "Titan" in an organic faction = giant organic creature, not mech

**Examples:**
- Hive Titan (Alien Hives) = MONSTER (organic titan creature)
- Tactical Titan (HDF) = VEHICLE (piloted mech)
- Rapacious Beast + Aircraft (Alien Hives) = FLYING MONSTER (organic)
- Heavy Gunship + Aircraft (HDF) = VEHICLE (mechanical)
- Bloodthirster (Wormhole Daemons) = MONSTER + CORRUPTED (NOT organic!)

### Step 2: Analyze Rules and Assign Tags

Map unit rules to tags using this reference:

**Combat Style Tags:**
- `aggressive` → Frenzy, Furious, Berserk, Impact, Charge-focused abilities
- `defensive` → Shielded, Defense+2 or better, Phalanx, OR Artillery/static ranged units
  - ⚠️ DO NOT tag as `defensive` just because a unit has Regeneration or is cheap
  - ⚠️ Regeneration on cheap/expendable units = survivable fodder, NOT defensive elite
- `ranged` → Primary weapons have range 18"+, Relentless, Artillery
- `melee` → No ranged weapons OR melee-focused rules (Impact, Frenzy, etc.)
- `balanced` → Mix of ranged and melee capability (both weapon types present)

**Unit Type Tags:**
- `hero` → Hero rule
- `leader` → Hero + Tough(3+) or aura abilities
- `elite` → Cost/model >= 30pts AND Quality 3+ (see Step 1b calculation)
- `veteran` → Cost/model >= 20pts AND Quality 4+ OR "Veteran" in name
- `cheap` → Cost/model <= 12pts regardless of other rules
- `expendable` → Quality 5+ AND (no Tough rule OR cost/model <= 10pts)

**Movement Tags:**
- `fast` → Fast rule
- `flying` → Flying rule OR Aircraft rule (aircraft ARE flying units!)
- `aircraft` → Aircraft rule specifically (also add `flying` and `vehicle`)
- `cavalry` → Mounted units, bike units, OR unit name contains "Rider", "Cavalry", "Mounted", "Chariot", "Biker"
- `slow` → Slow rule, OR very heavy ground units without Fast
- `mobile` → Scout, Ambush, or Strider
- `static` → Artillery rule on GROUND units only
  - ⚠️ NEVER tag Aircraft as `static` — they are mobile air platforms
  - ⚠️ `static` and `fast`/`flying` are MUTUALLY EXCLUSIVE

**Mutually Exclusive Movement Tags:**
These tag pairs should NEVER appear together on the same unit:
- `static` ↔ `fast` (can't be immobile AND fast)
- `static` ↔ `flying` (can't be immobile AND flying)
- `static` ↔ `aircraft` (aircraft are mobile)
- `slow` ↔ `fast` (pick one)

**Special Ability Tags:**
- `psychic` → Psychic, Wizard, Caster, Caster Group, Spellcaster (ALWAYS add `mystery` dimension +3)
- `magic` → Any spell-related abilities, Caster rules (ALWAYS add `mystery` dimension +3)
- `stealth` → Stealth, Ambush, or Scout
- `fearless` → Fearless rule
- `regeneration` → Regeneration rule
- `tough` → Tough(3+) on units that are ALSO elite (by cost/quality)
- `unpredictable` → Unpredictable, Random, Unstable rules (add `order` dimension -3)
- `chaotic` → Chaotic, Berserk, Frenzy, Mischievous rules (add `order` dimension -2)

**Technology Tags (CRITICAL — apply `tech` dimension for ALL of these):**
- `vehicle` → Vehicle rule, Transport rule, Aircraft rule, OR name-based detection (see Step 1d)
  - **ALWAYS add `tech: +3` when `vehicle` tag is present**
- `robot` → Robot, Automaton, Drone, Construct, or mechanical units
  - **ALWAYS add `tech: +4` AND `humanity: -2`**
- `drone` → Drone units, autonomous machines
  - **ALWAYS add `tech: +4` AND `humanity: -2`**
- `aircraft` → Aircraft rule or flyer units (mechanical only)
  - **ALWAYS add `flying` tag + `speed: +3` + `tech: +3`**
  - **NEVER add `static` or `slow` to aircraft**
- `organic` → Biological creatures (NOT machines, NOT daemons)
  - Add `tech: -2`
- `beast` → Animal/monster units (organic creatures)
  - Add `tech: -3`, `humanity: -2`

**Corruption Tags (NEW v1.7.0):**
- `corrupted` → Chaos corruption, daemonic influence
  - Add `purity: -4`
- `daemon` → Daemon keyword, supernatural entity
  - Add `corrupted`, `monster`, `purity: -4`, `humanity: -4`
  - **NEVER add `organic` to daemons**
- `corruption` → mutation, warp abilities (mortal chaos)
  - Add `purity: -3 to -4`

**Common Mistakes to Avoid:**
- ❌ Forgetting `vehicle` tag on APCs, Trucks, Tanks, Walkers, **BIKES**
- ❌ Tagging Aircraft as `static` (they fly!)
- ❌ Missing `tech` dimension on any vehicle/robot
- ❌ Putting `monster` on mechanical walkers (use `vehicle`)
- ❌ Tagging Battlesuits as `monster` (they're piloted tech = `vehicle`)
- ❌ Missing `drone` tag on drone units (use BOTH `drone` AND `robot`)
- ❌ Inconsistent robot tagging within same faction (if Grunts are robots, ALL Grunts are robots)
- ❌ **Tagging daemons as `organic` (they're supernatural, not biological)**
- ❌ **Removing `tech` from Chaos Marines (they keep their armor)**
- ❌ **Confusing bio-forms with vehicles (Tyranid monsters are NOT vehicles)**

**Faction Theme Tags:**
- `pure` → anti-corruption, blessed, purifying
- `zealot` → faith-based abilities, Fearless + religious theme
- `ancient` → ancient/immortal themes
- `treacherous` → Mischievous, Backstab, Poison, sneaky faction themes (add `honor` dimension -3)
- `cunning` → Mischievous, tricky rules, goblin/skaven themes (add `order` dimension -2)

### Step 2a: Check for Mutually Exclusive Tags

Some tags are contradictory and should NEVER appear together:

**Movement Contradictions:**
- `static` ↔ `fast` — Cannot be immobile AND fast
- `static` ↔ `flying` — Cannot be immobile AND flying
- `static` ↔ `mobile` — Cannot be immobile AND mobile
- `slow` ↔ `fast` — Pick one speed

**Combat Style Contradictions:**
- `aggressive` ↔ `defensive` — Pick the PRIMARY style
  - Impact, Furious, Charge bonuses → `aggressive`
  - Shielded, Phalanx, defensive positioning → `defensive`
  - Having both rules? Choose based on unit's PRIMARY role

**Type Contradictions:**
- `monster` ↔ `vehicle` — Organic/daemon vs Mechanical (pick based on lore)
- `robot` ↔ `organic` — Machine vs Biological
- `organic` ↔ `corrupted` — **CRITICAL v1.7.0:** Daemons are `corrupted` + `monster`, NOT `organic`!
- `human` ↔ `alien` — Species type

**Elite/Cheap Contradictions:**
- `elite` ↔ `cheap` — High quality vs fodder
- `elite` ↔ `expendable` — Valuable vs disposable

**When in doubt:** Look at the unit's PRIMARY battlefield role and tag for that.

### Step 2b: Analyze Faction-Wide Rules

Some rules appear on EVERY unit in a faction and indicate faction personality:

| Faction Rule | Implied Tags | Dimension Impact |
|--------------|--------------|------------------|
| Mischievous | `treacherous`, `cunning` | honor: -3, order: -2 |
| Hive Bond | `swarm`, `collective` | collective: +2 |
| Battleborn | `disciplined`, `fearless` | order: +2, faith: +1 |
| Bloodborn | `aggressive`, `melee` | patience: -2, faith: +1 |
| Darkborn | `stealth` | subtlety: +2 |
| Fearless (faction-wide) | `zealot` or `fearless` | faith: +2 |
| Hold the Line | `disciplined`, `reliable` | order: +2 |
| For the Greater Good | `collective`, `disciplined` | collective: +2, order: +2 |
| Regeneration (faction-wide) | varies by faction | — |
| WAAAGH! / Ferocious | `aggressive`, `chaotic` | patience: -2, order: -2 |
| Reinforced | `tough`, `resilient` | — |
| Changebound | `corrupted`, `psychic` | purity: -4, mystery: +3 |
| Lustbound | `corrupted`, `fast-attack` | purity: -4, speed: +2 |
| Plaguebound | `corrupted`, `tough` | purity: -4, resilience: +2 |
| Warbound | `corrupted`, `melee` | purity: -4, patience: -2 |

**IMPORTANT:** When a rule like "Mischievous" appears on every unit:
1. Apply the faction personality tags to ALL units
2. This overrides generic assumptions (Goblins are NOT defensive/patient)
3. The faction's overall "feel" should be consistent across units

### NEW: Mono-Type Army Versatility Override (v1.8.0)

**CRITICAL RULE:** If a faction consists entirely or almost entirely of a single unit type (e.g., all vehicles, all monsters, all infantry), the faction is inherently LOW versatility regardless of individual unit weapon mixes.

The `balanced` weapon tag (assigned when a unit has both melee and ranged weapons) should NOT inflate the versatility dimension for mono-type factions. A unit having both weapon types does not make it "versatile" in the personality sense if every unit in the faction is the same type.

**Application:**
- After tagging all units, check if >80% of non-hero units share the same role
- If YES → override `versatility` dimension to negative (-2 to -4) for the faction
- Remove or suppress `balanced` tag's versatility contribution

**Examples:**
- Titan Lords (ALL giant mechs) → faction versatility: -4 (extreme specialist)
- Custodian Brothers (ALL elite infantry) → reduce versatility by -2
- Alien Hives (diverse: swarms, monsters, flyers, transports) → keep high versatility

**Why this matters:** Without this rule, a faction like Titan Lords gets `balanced` + `versatility: +2` on every unit simply because each mech carries both melee and ranged weapons. This inflates the faction's versatility score and causes it to match with moderate user profiles, even though having only giant mechs makes Titan Lords one of the LEAST versatile factions in the game.

### Step 3: Calculate Dimension Scores

For each unit, calculate dimension scores based on tags:

```
TAG_TO_DIMENSION_WEIGHTS = {
  # Patience dimension
  "aggressive": { "patience": -3 },
  "patient": { "patience": 3 },
  "defensive": { "patience": 3 },
  "static": { "patience": 2 },

  # Collective dimension
  "swarm": { "collective": 4 },
  "horde": { "collective": 4 },
  "support": { "collective": 2 },
  "independent": { "collective": -2 },
  "hero": { "collective": -1 },

  # Order dimension
  "disciplined": { "order": 3 },
  "reliable": { "order": 2 },
  "chaotic": { "order": -3 },
  "unpredictable": { "order": -3 },
  "cunning": { "order": -2 },

  # Tech dimension (ALWAYS apply for vehicles/robots!)
  "vehicle": { "tech": 3 },
  "robot": { "tech": 4, "humanity": -2 },
  "drone": { "tech": 4, "humanity": -2 },
  "battlesuit": { "tech": 3 },
  "aircraft": { "tech": 3, "speed": 3 },
  "organic": { "tech": -2 },
  "beast": { "tech": -3 },

  # Collective dimension
  "collective": { "collective": 3 },

  # Elite dimension (REMEMBER: also calculate from stats!)
  "elite": { "elite": 4 },
  "veteran": { "elite": 3 },
  "cheap": { "elite": -2 },
  "expendable": { "elite": -3 },
  "horde": { "elite": -3 },

  # Honor dimension
  "honorable": { "honor": 4 },
  "noble": { "honor": 3 },
  "ruthless": { "honor": -3 },
  "treacherous": { "honor": -4 },
  "cunning": { "honor": -2 },

  # Faith dimension
  "zealot": { "faith": 4 },
  "faithful": { "faith": 3 },
  "fearless": { "faith": 2 },
  "daemon": { "faith": 3, "purity": -4 },

  # Subtlety dimension
  "stealth": { "subtlety": 4 },
  "infiltrate": { "subtlety": 4 },
  "scout": { "subtlety": 3 },
  "ambush": { "subtlety": 3 },
  "cunning": { "subtlety": 2 },

  # Tradition dimension
  "ancient": { "tradition": 4 },
  "traditional": { "tradition": 3 },
  "innovative": { "tradition": -3 },
  "experimental": { "tradition": -2 },

  # Purity dimension
  "pure": { "purity": 4 },
  "corrupted": { "purity": -4 },
  "corruption": { "purity": -4 },
  "mutant": { "purity": -4 },

  # Speed dimension
  "fast": { "speed": 4 },
  "mobile": { "speed": 3 },
  "flying": { "speed": 3 },
  "aircraft": { "speed": 3 },
  "cavalry": { "speed": 3 },
  "slow": { "speed": -2 },
  "static": { "speed": -3 },

  # Mystery dimension
  "mysterious": { "mystery": 4 },
  "psychic": { "mystery": 3 },
  "magic": { "mystery": 3 },
  "ethereal": { "mystery": 4 },

  # Versatility dimension
  "versatile": { "versatility": 4 },
  "adaptive": { "versatility": 3 },
  "specialist": { "versatility": -3 },
  "focused": { "versatility": -2 },
  "balanced": { "versatility": 2 },

  # Humanity dimension
  "human": { "humanity": 3 },
  "humanoid": { "humanity": 2 },
  "alien": { "humanity": -3 },
  "monster": { "humanity": -4 },
  "daemon": { "humanity": -4 },
  "robot": { "humanity": -2 },
  "beast": { "humanity": -2 },

  # Leadership dimension
  "commander": { "leadership": 4 },
  "leader": { "leadership": 3 },
  "inspiring": { "leadership": 3 },
  "autonomous": { "leadership": -2 },
  "hero": { "leadership": 2 }
}
```

Sum the weights for all tags, clamping final scores to [-5, +5].

## Faction-Specific Guidance

### Space Marine Chapter Equivalents (v1.7.0)

**Universal Rule:** ALL "Brothers" factions (non-Prime) follow the same pattern

**Base Tags for ALL Units:** `tech` + `human`

| Faction | Faction Rule | Special Focus | Additional Tags |
|---------|--------------|---------------|-----------------|
| Battle Brothers | Battleborn | Standard/Balanced | Standard SM |
| Blood Brothers | Bloodborn | Melee/Assault | `melee`, `aggressive` |
| Custodian Brothers | Guardian | Elite/Defensive | `elite`, `tough` |
| Dark Brothers | Darkborn | Stealth/Infiltration | `stealth`, `fast-attack` |
| Knight Brothers | Knightborn | Terminators/Heavy | `elite`, `tough`, `slow` |
| Watch Brothers | Watchborn | Versatile/Mixed | `elite`, `versatile` |
| Wolf Brothers | Wolfborn | Melee/Assault | `melee`, `aggressive` |
| Prime Brothers | Reinforced | Codex Standard | Standard SM |

**Unit Type Patterns:**
- **Terminators:** `tech` + `human` + `elite` + `tough` + `slow`
- **Tactical Marines:** `tech` + `human` + `ranged`
- **Assault Marines:** `tech` + `human` + `melee` + `fast-attack`
- **Dreadnoughts:** `tech` + `vehicle` + `walker` + `elite` (NOT `monster`)
- **Bikes:** `tech` + `vehicle` + `fast-attack` (YES, they're vehicles)
- **Tanks:** `tech` + `vehicle` + `heavy-support`

### Chaos Space Marine Variants (v1.7.0)

**Universal Rule:** ALL "Prime Brothers" factions keep tech + human

**Base Tags for ALL Units:** `corrupted` + `tech` + `human`

**Key Factions:**
- Blood Prime Brothers (Chaos Blood Angels)
- Dark Prime Brothers (Chaos Dark Angels/Raven Guard)
- Knight Prime Brothers (Chaos Grey Knights)
- Watch Prime Brothers (Chaos Deathwatch)
- Wolf Prime Brothers (Chaos Space Wolves)

**Faction-Wide Rule:** Reinforced (extra wounds)
→ Add `tough` or `resilient` tags

**Unit Type Patterns:**
- **Chaos Terminators:** `corrupted` + `tech` + `human` + `elite` + `tough` + `slow`
- **Chaos Marines:** `corrupted` + `tech` + `human` + `ranged`
- **Chaos Bikes:** `corrupted` + `tech` + `vehicle` + `fast-attack`
- **Chaos Dreadnoughts:** `corrupted` + `tech` + `vehicle` + `walker` + `elite`

**Critical Distinction:**
- ✅ They're corrupted BUT still armored warriors
- ✅ KEEP the `tech` + `human` tags
- ❌ Do NOT treat them as pure daemons
- ❌ Do NOT remove `tech` tag

### Pure Daemon Factions (v1.7.0)

**CRITICAL: Daemons are NOT organic!**

**Factions:**
- Wormhole Daemons of Change (Tzeentch)
- Wormhole Daemons of Lust (Slaanesh)
- Wormhole Daemons of Plague (Nurgle)
- Wormhole Daemons of War (Khorne)

**Core Tagging:** `corrupted` + `monster` (NO other base tags!)

**NEVER Add These Tags to Daemons:**
- ❌ `organic` (they're supernatural, not biological)
- ❌ `tech` (unless daemon engine)
- ❌ `human` (they're not humanoid)

**Unit Patterns:**
- Greater Daemons: `corrupted` + `monster` + `elite` + `flying` (usually)
- Daemon Troops: `corrupted` + `monster`
- Lesser Daemons: `corrupted` + `monster` + `horde`

**God-Specific Tags:**
- **Change:** `psychic`, `flying`, `ranged`
- **Lust:** `fast-attack`, `melee`, `stealth`
- **Plague:** `tough`, `regeneration`, `resilient`
- **War:** `melee`, `aggressive`, `brutal`

**Example:**
```
Bloodthirster of War:
✅ CORRECT: corrupted, monster, elite, melee, aggressive
❌ WRONG: organic, monster, melee (NO organic!)

Reasoning: Daemons are supernatural warp entities, NOT biological creatures
```

### Alien Hives (Grimdark Future) — 100% ORGANIC FACTION

**CRITICAL: Alien Hives is entirely organic/biological. NO unit should have positive tech!**

**Faction-Wide Rules:**
- "Hive Bond" → ALL units get `collective`, `swarm` tags, collective: +2
- ALL units get `organic` tag (this is a biological faction)
- ALL units get NEGATIVE `tech` dimension (-2 to -3)
- ALL units get negative `humanity` dimension (-2 to -4)

**Grunt Units (ORGANIC, NOT ROBOTS!):**
- Alien Hives Grunts are organic auxiliary creatures, NOT robots
- Grunt Veteran, Assault Grunts, Shooter Grunts, Psycho-Grunts, Winged Grunts, Support Grunts
- Tags: `organic`, `beast`, `collective`, `swarm`
- Dimensions: `tech: -2`, `humanity: -2`
- ❌ NEVER tag Alien Hives Grunts as `robot`

**Beast Units:**
- Ravenous Beasts, Venom Beasts, Heavy Beasts, etc.
- Tags: `beast`, `organic`, `monster` (for large ones)
- Dimensions: `tech: -2 to -3`, `humanity: -2 to -4`

**Flying Units with Aircraft Rule (CRITICAL):**
- Rapacious Beast, Flying Swarms, etc. with Aircraft rule
- These are FLYING ORGANIC CREATURES, not vehicles!
- Tags: `flying`, `beast`, `organic`, `monster` — NOT `vehicle` or `aircraft`!
- Dimensions: `tech: -3` (organic), `speed: +3` (flying)
- ❌ NEVER tag organic flyers as `vehicle`

**Large Creatures (Titans, Heavy Beasts):**
- Hive Titan, Devourer Heavy Beast, Artillery Heavy Beast
- These are massive ORGANIC creatures, not mechanical titans
- Tags: `monster`, `beast`, `organic`, `tough`
- Role: `monster` (not vehicle!)
- Dimensions: `tech: -2`, `humanity: -4 to -5`

**Spore Units:**
- Invasion Carrier Spore, Invasion Artillery Spore
- Living organic drop pods, NOT mechanical transports
- Tags: `organic`, `transport` — NOT `vehicle`
- Dimensions: `tech: -2`

**Psychic Units:**
- Synapse creatures, Psycho-Grunts, Caster heroes
- Tags: `psychic`, `magic`, `collective`
- Dimensions: `mystery: +3`

**Common Alien Hives Mistakes:**
- ❌ Tagging Grunts as `robot` (they're organic auxiliaries)
- ❌ Tagging flying beasts as `vehicle` (they're organic flyers)
- ❌ Giving positive `tech` to any unit (faction is 100% organic)
- ❌ Using `vehicle` role for Hive Titan (it's a monster)
- ❌ Missing `organic` tag on any unit

### Goblins / Night Goblins (Age of Fantasy)
- ALL units have Mischievous → ALL get `treacherous`, `cunning`, negative honor/order
- Most troops: `cheap`, `expendable`, `horde` — NOT elite even with Tough
- Trolls: `monster`, `regeneration`, `beast` — elite only if cost/model is high
- Shaman/Casters: ALWAYS add `magic`, `psychic`, `mystery` dimension
- Squig/Beast units: `beast`, `organic`, `cavalry` if riders
- ⚠️ Goblins are NOT a patient/defensive faction — they're chaotic opportunists

### Havoc Brothers (Chaos Space Marines)
- Chaos marines: `corrupted`, `tech`, `human`, `elite`
- Possessed: `corrupted`, `daemon`, `mutant`, `melee`
- Cultists: `corrupted`, `human`, `cheap`, `expendable`
- ✅ KEEP `tech` tag on armored units
- ❌ Do NOT remove `human` from corrupted marines

### Robot Legions / Eternal Dynasty (Necrons)
- **Type:** Tech (ancient alien machines)
- **All Units:** `tech` + `resilient`
- **Warriors:** `tech` + `ranged` + `resilient`
- **Vehicles:** `tech` + `vehicle` + role
- **Scarabs:** `tech` + `fast-attack` + `horde`
- ✅ They're machines, so `tech` applies
- ❌ NOT `organic` (they're mechanical, not biological)

### Human Defense Force (Grimdark Future)
- **Faction-wide rule:** "Hold the Line" → ALL units get `disciplined` tag, order: +2
- **Infantry:** `cheap`, `expendable`, `human`, `disciplined`
  - Recruits/basic squads: `horde`, `swarm`
  - Veterans/Storm Troopers: `veteran` (if cost/model ≥ 20)
- **Robots (GRUNT):** `robot`, `tech: +4`, `humanity: -2`, `fearless`
- **ALL Vehicles must have `vehicle` tag + `tech: +3`:**
  - APCs, Trucks: `vehicle`, `fast`, `transport`
  - Tanks: `vehicle`, `tough`, `ranged`
  - Walkers: `vehicle` (NOT monster!), `tough`
  - Titans: `vehicle`, `tough`, `fearless`
- **Aircraft (Light/Heavy Gunship):**
  - MUST have: `aircraft`, `vehicle`, `flying`
  - MUST have: `speed: +3` (NOT static!)
  - NEVER tag aircraft as `static` or `slow`
- **Artillery:** `static`, `ranged`, `defensive`, `slow` (ground-based only)
- **Bikers:** `cavalry`, `fast`, `aggressive`, `vehicle`

**Common HDF Mistakes:**
- ❌ Missing `vehicle` tag on APCs/Trucks/Tanks/Bikes
- ❌ Aircraft tagged as `static` (they fly!)
- ❌ Walkers tagged as `monster` (they're mechanical)
- ❌ Missing `human` tag on infantry
- ❌ Missing `disciplined` from "Hold the Line"

### Human Inquisition (Grimdark Future)

**Faction Type:** `zealot` or `mixed` (NOT primitive!) — has assassins, psychics, vehicles, diverse specialists

**CRITICAL: This is a HUMAN faction — ALL infantry/heroes need `human` tag + `humanity: +3`**

**Faction Theme: Religious Zealotry**
- Inquisition is a religious/zealot faction
- Units with Fearless often have religious motivation → `faith: +2`
- Consider `zealot` or `faithful` tags for appropriate units

**Heroes (Inquisitors, Assassins):**
- ALL heroes get `human` tag + `humanity: +3`
- Inquisitors: `hero`, `leader`, `elite`, `human`, `zealot`, `faith: +3`
- Ministry Assassins: `hero`, `elite`, `human`, `stealth`, `subtlety: +3`
- Note: Assassins with Casting/psychic abilities also get `magic`, `mystery: +3`

**Assassin Detection (CRITICAL):**
- ANY unit with "Assassin" in name → add `stealth` tag + `subtlety: +3`
- Check for supporting rules: Evasive, Surprise Attack, Scout, Hit & Run
- Assassins are stealth operatives by definition
- Terrorism Ministry Assassin has Casting Debuff → also add `magic`, `psychic`

**Henchmen Units:**
- ALL Henchmen are HUMAN → `human` tag + `humanity: +3`
- Acolyte Henchmen: `human`, `fearless`, `expendable`, `zealot` — NOT monster!
- Psychic Henchmen: `human`, `psychic`, `magic`, `mystery: +3`
- Missionary Henchmen: `human`, `zealot`, `faithful`, `faith: +2`
- Crusader Henchmen: `human`, `zealot`, `melee`, `faith: +2`
- Assassin Henchmen: `human`, `elite`, `stealth`, `subtlety: +3`
- Cyborg Henchmen: `human`, `tech: +2` (tech-enhanced human)

**Cyborg Detection:**
- "Cyborg" in name → add `tech: +1 to +2` (enhanced, not full robot)
- KEEP `human` tag (still humanoid)

**Vehicles:**
- Transport Vehicle, Combat Vehicle → `vehicle`, `tech: +3`, `fast`

**Minimum Tags Rule (CRITICAL - v1.7.3):**
- Every unit MUST have at least 3 tags
- Riot Judges with only `human`, `melee` is INVALID — add a third tag

**Infinite Loop Prevention:**
When adding fallback tags to reach the minimum of 3 tags, avoid infinite loops by:
1. **Track previous size**: If tag set size hasn't changed between iterations, you're stuck
2. **Include `reliable` in quality checks**: Don't try to add `reliable` if it already exists
3. **Use distinct fallback tags**: balanced → versatile → infantry (in that order)
4. **Set maximum attempts**: Limit iterations to prevent infinite loops (max 10 attempts)
5. **Force exit with warning**: If unable to reach 3 tags after max attempts, log warning and continue

**Bug Fix (v1.7.3):** The quality-based tag check must include `reliable`:
```
❌ WRONG: if (!has('elite') && !has('veteran') && !has('cheap') && !has('expendable'))
✅ CORRECT: if (!has('elite') && !has('veteran') && !has('cheap') && !has('expendable') && !has('reliable'))
```

**Fallback Tag Priority:**
1. Combat style: ranged/melee/balanced (from weapons)
2. Quality: veteran/expendable/reliable/cheap (from stats)
3. Speed: fast/slow (from rules)
4. Generic: balanced → versatile → infantry (last resort)

**Common Human Inquisition Mistakes:**
- ❌ Missing `human` tag on heroes and infantry
- ❌ Acolytes tagged as `monster` (they're zealous humans!)
- ❌ Missing `stealth`/`subtlety` on Assassin units
- ❌ Faction typed as "primitive" (should be "zealot" or "mixed")
- ❌ Missing `humanity: +3` dimension on human units
- ❌ Cyborgs missing `tech` dimension
- ❌ Units with fewer than 3 tags (minimum is 3!)
- ❌ Missing `zealot`/`faithful`/`faith` on religious units
- ❌ Terrorism Ministry Assassin missing `magic` (has Casting Debuff!)
- **Faction theme:** High-tech, collective, ranged-focused
- **Faction-wide:** "Targeting Visor" indicates precision/tech focus
- **Grunts (auxiliary troops):**
  - In DAO Union, Grunts are ROBOTS → `robot`, `tech: +4`, `humanity: -2`
  - Apply consistently: if one Grunt unit is `robot`, ALL Grunt units are `robot`
  - Includes: Grunt Leader, Security Grunts, Tactical Grunts, Spotter Squad
- **Drones:**
  - ALL drone units get BOTH `drone` AND `robot` tags
  - Gun Drones, Sniper Drones, Shield Drones, etc.
  - Add: `tech: +4`, `humanity: -2`
- **Battlesuits (CRITICAL):**
  - ALL Battlesuits are `vehicle` role, NOT monster!
  - Battle Suit, Stealth Suit, Heavy Battle Suit, Heavy Stealth Suit
  - Even with Fear(2), they're piloted tech → `vehicle`, `tech: +3`
  - Flying suits: add `flying`, `speed: +3`
- **Vehicles:** Hover Tank, Hover Transport → `vehicle`, `fast`, `tech: +3`
- **Aircraft:** Razor Fighter, Sun Bomber → `aircraft`, `flying`, `vehicle`, `speed: +3`
- **Titans:** Tide Titan, Surge Titan → `vehicle`, `tough`, `tech: +3`
- **Faction dimensions:** Generally high `tech`, moderate `collective`, low `patience` (shooty)

**Common DAO Union Mistakes:**
- ❌ Tagging Heavy Battlesuits as `monster` (they're piloted mechs = `vehicle`)
- ❌ Missing `robot` tag on Grunt units
- ❌ Missing `drone` tag on Drone units (use BOTH `drone` AND `robot`)
- ❌ Inconsistent robot tagging across Grunt variants
- ❌ Missing `tech` dimension on battlesuits

### Orcs / Orc Marauders
- All units tend toward: `aggressive`, low `patience`
- Boyz: `horde`, `cheap`, `melee`, `organic`, `primitive`
- Nobz: `elite` only if cost/model supports it
- Vehicles: `vehicle` + `primitive`, but also `chaotic`, low `order`
- ✅ Ork bikes ARE vehicles (even crude ones)

### Ratmen / Skaven
- Similar to Goblins: `treacherous`, `cunning`, negative honor
- Swarm units: `horde`, `cheap`, `expendable`, `organic`
- Plague units: `corruption`, negative purity
- Warpstone tech: `tech` positive despite being "fantasy"

### Infected Colonies (Genestealer Cult)
- **Type:** Corrupted (alien genetic corruption, not Chaos)
- **Purestrain Genestealers:** `corrupted` + `monster` (tyranid)
- **Hybrids:** `corrupted` + `human`
- **Vehicles:** `corrupted` + `tech` + `vehicle` (stolen)
- ✅ Not Chaos corruption, but alien genetic corruption
- ✅ Hybrids are still `human` (corrupted humans)

### Titan Lords — v1.8.0

```
Faction Type: "tech" (ALL units are mechanical walkers)
Faction Composition: 100% vehicles (no infantry, no monsters, no swarms)
Key Identity: Ultra-elite mechanical mercenary individuals with code of honor

Tagging Rules:
- ALL units are vehicles (no infantry, no monsters)
- Honor Code rule → honorable tag + honor: +4
- Every unit should have: vehicle, elite, tough, honorable
- Faction-wide: independent (mercenary glory-seekers, NOT team players)
- NO mystery/psychic/magic (purely mechanical)
- NEGATIVE versatility (mono-type army, all giant mechs)
- Negative humanity (giant robotic bodies, not humanoid)
- Negative subtlety (biggest possible targets on the field)

Corrected Dimension Profile:
  patience: 1    (tanky but thrill-seekers)
  collective: -3 (individual mercenary glory-seekers)
  order: 3       (code of honor, heraldry discipline)
  tech: 5        (ALL giant robots, maximum tech)
  elite: 5       (most elite faction in the game)
  honor: 4       (code of honor, heraldry, nobility)
  faith: -1      (secular thrill-seekers, fight for sport/glory)
  subtlety: -5   (giant walking robots, zero stealth, most visible)
  tradition: 3   (heraldry, codes, established traditions)
  purity: 2      (human pilots, uncorrupted mechanical)
  speed: -2      (big slow walkers, not fast)
  mystery: -2    (purely mechanical, no magic/psychic)
  versatility: -4 (ONE unit type, least versatile faction)
  humanity: -3   (giant robotic bodies, not humanoid)
  leadership: 1  (individual glory, not army commanders)

Common Mistakes for Titan Lords:
- ❌ Tagging units as "balanced" → versatility: +2 (mechs with both weapons ≠ versatile)
- ❌ Missing "honorable" tag from Honor Code rule
- ❌ Missing "independent" from mercenary nature
- ❌ Neutral/positive versatility (should be strongly negative)
- ❌ Neutral humanity (giant robots are NOT humanoid)
- ❌ Positive mystery (no psychic/magic elements whatsoever)
```

## Example Tagging

### Example 12: Pure Daemon (Wormhole Daemons) - NEW v1.7.0

**Input Unit:**
```json
{
  "id": "daemon1",
  "name": "Bloodthirster of War",
  "cost": 350,
  "size": 1,
  "quality": 3,
  "defense": 2,
  "rules": [
    { "name": "Fear", "rating": 3, "label": "Fear(3)" },
    { "name": "Tough", "rating": 18, "label": "Tough(18)" },
    { "name": "Flying", "label": "Flying" },
    { "name": "Furious", "label": "Furious" },
    { "name": "Warbound", "label": "Warbound" }
  ]
}
```

**Output Tagged Unit (CORRECT):**
```json
{
  "id": "daemon1",
  "name": "Bloodthirster of War",
  "cost": 350,
  "size": 1,
  "quality": 3,
  "defense": 2,
  "role": "monster",
  "rules": ["Fear(3)", "Tough(18)", "Flying", "Furious", "Warbound"],
  "tags": ["corrupted", "daemon", "monster", "elite", "flying", "melee", "aggressive", "tough"],
  "dimensionScores": {
    "purity": -4,
    "humanity": -4,
    "elite": 4,
    "speed": 3,
    "patience": -3
  }
}
```

**Why this is correct:**
- Faction is Wormhole Daemons → `corrupted` + `monster`
- NO `organic` tag (daemons are supernatural, not biological)
- Flying rule → `flying` tag + `speed: +3`
- Furious + Warbound → `aggressive`, `melee`
- Cost 350pts, Q3, Tough(18) → `elite`, `tough`
- ❌ WRONG would be adding `organic` tag

**WRONG tagging (what NOT to do):**
```json
{
  "tags": ["organic", "monster", "flying", "melee"],  // ❌ NO organic on daemons!
  "dimensionScores": { "tech": -3 }  // ❌ Daemons don't have organic tech penalty
}
```

---

### Example 13: Chaos Space Marine (Prime Brothers) - NEW v1.7.0

**Input Unit:**
```json
{
  "id": "chaos1",
  "name": "Dark Prime Terminators",
  "cost": 220,
  "size": 5,
  "quality": 3,
  "defense": 2,
  "rules": [
    { "name": "Slow", "label": "Slow" },
    { "name": "Tough", "rating": 3, "label": "Tough(3)" },
    { "name": "Fearless", "label": "Fearless" },
    { "name": "Reinforced", "label": "Reinforced" },
    { "name": "Darkborn", "label": "Darkborn" }
  ]
}
```

**Output Tagged Unit (CORRECT):**
```json
{
  "id": "chaos1",
  "name": "Dark Prime Terminators",
  "cost": 220,
  "size": 5,
  "quality": 3,
  "defense": 2,
  "role": "elite",
  "rules": ["Slow", "Tough(3)", "Fearless", "Reinforced", "Darkborn"],
  "tags": ["corrupted", "tech", "human", "elite", "tough", "slow", "fearless", "stealth", "ranged"],
  "dimensionScores": {
    "purity": -4,
    "tech": 3,
    "humanity": 3,
    "elite": 4,
    "speed": -2,
    "faith": 2,
    "subtlety": 2
  }
}
```

**Why this is correct:**
- Faction is Dark Prime Brothers → `corrupted` + `tech` + `human`
- ✅ KEEP `tech` tag (they still wear power armor)
- ✅ KEEP `human` tag (they're corrupted humans, not daemons)
- Cost/model = 44pts, Q3 → `elite`
- Reinforced + Tough(3) → `tough`
- Darkborn → `stealth`

**WRONG tagging (what NOT to do):**
```json
{
  "tags": ["corrupted", "monster", "elite"],  // ❌ Missing tech + human!
  "dimensionScores": { "purity": -4, "humanity": -4 }  // ❌ Should be +3!
}
```

---

[Continue with existing examples 1-11 from previous version...]

## Quality Checklist

Before submitting tagged output, verify:

**Structure:**
- [ ] Every unit has a `role` assigned
- [ ] Every unit has at least 3 relevant `tags` (MINIMUM 3!)
- [ ] `dimensionScores` only includes non-zero dimensions
- [ ] No dimension score exceeds [-5, +5] range
- [ ] Cost and size are preserved from original data
- [ ] Rules array contains string labels, not objects

**Role Consistency:**
- [ ] Hero units have `hero` tag
- [ ] Monster-role units have `monster` tag AND negative `humanity`
- [ ] Vehicle-role units have `vehicle` tag AND positive `tech` (+3 or higher)
- [ ] Swarm-role units have `horde`/`swarm` tags AND negative `elite`

**Corrupted Faction Validation (v1.7.0) — CRITICAL:**
- [ ] Pure Daemons have `corrupted` + `monster` (NO `organic`!)
- [ ] Chaos Marines have `corrupted` + `tech` + `human` (KEEP tech!)
- [ ] Mortal cultists have `corrupted` + `human`
- [ ] Daemon units have `purity: -4` AND `humanity: -4`
- [ ] Chaos Marines have positive `humanity: +2 to +3`
- [ ] NO daemon has `organic` tag

**Human Faction Validation (Inquisition, HDF, Battle Brothers, etc.):**
- [ ] ALL infantry and heroes have `human` tag
- [ ] ALL infantry and heroes have `humanity: +3` dimension
- [ ] NO human unit has `monster` tag (these are mutually exclusive!)
- [ ] Assassin units have `stealth` tag + `subtlety: +3`
- [ ] Cyborg units have `tech: +1 to +2` (enhanced, but still `human`)
- [ ] Scout rule → `scout` AND `mobile` tags

**Zealot Faction Validation (Human Inquisition, Blessed Sisters):**
- [ ] Faction type is "zealot" or "mixed" (NOT "primitive"!)
- [ ] Religious units (Missionaries, Crusaders, Acolytes) have `zealot` or `faithful` tag
- [ ] Religious units have positive `faith` dimension (+2 to +4)
- [ ] Assassins with "Casting" rules also have `magic`/`psychic` tags
- [ ] ALL units meet minimum 3 tags requirement

**Organic Faction Validation (Alien Hives, Saurians, etc.) — CRITICAL:**
- [ ] Step 0 completed: Faction type identified BEFORE tagging units
- [ ] ALL units have `organic` tag (organic factions are 100% biological)
- [ ] ALL units have NEGATIVE `tech` dimension (-2 to -3)
- [ ] NO unit has `robot` tag (organic factions don't have robots)
- [ ] NO unit has `vehicle` tag (organic factions don't have mechanical vehicles)
- [ ] Grunts tagged as `organic`, `beast` — NOT `robot`
- [ ] Flying creatures with Aircraft rule: `flying`, `monster` — NOT `vehicle` or `aircraft`
- [ ] "Titan" units: `monster` role — NOT `vehicle`
- [ ] Transport units (Spores): `organic`, `transport` — NOT `vehicle`

**Vehicle/Aircraft Validation (Tech/Mixed Factions):**
- [ ] ALL tanks, APCs, trucks, walkers, **BIKES** have `vehicle` tag
- [ ] ALL vehicles have `tech: +3` or higher in dimensionScores
- [ ] Aircraft have `flying` tag (NOT `static`!)
- [ ] Aircraft have positive `speed` dimension (NOT negative!)
- [ ] Mechanical walkers are `vehicle` role, NOT `monster`
- [ ] Name-based detection applied (Tank, APC, Walker, Gunship, Bike → vehicle)

**Battlesuit Validation (Tech Factions):**
- [ ] ALL Battlesuits are `vehicle` role (NOT monster!)
- [ ] Battlesuits have `vehicle` tag AND `tech: +3`
- [ ] Fear rule does NOT make a battlesuit a monster
- [ ] Flying battlesuits have `flying` tag + positive `speed`

**Drone Validation:**
- [ ] ALL drone units have BOTH `drone` AND `robot` tags
- [ ] Drones have `tech: +4` AND `humanity: -2`

**Robot/Automaton Validation:**
- [ ] Robot units have `robot` tag AND `tech: +4` AND `humanity: -2`
- [ ] Consistent robot tagging within faction (if Grunts are robots, ALL Grunts are robots)

**Stats-Based Validation:**
- [ ] Cost/model > 12pts → NOT tagged `cheap`
- [ ] Cost/model > 30pts + Q5+ → `expendable` only, not `elite`
- [ ] Q5+ units are tagged `expendable` (not elite, even with Tough)
- [ ] Elite tags match the cost_per_model calculation in Step 1b

**Caster/Magic Validation:**
- [ ] Units with Caster/Wizard/Psychic rules have `magic` or `psychic` tag
- [ ] Magic users have `mystery` dimension score (+2 to +4)

**Faction Theme Consistency:**
- [ ] Faction-wide rules (Hold the Line, Mischievous, Reinforced) reflected in ALL unit tags
- [ ] Faction personality is consistent across all units
- [ ] Name-based inferences applied (Riders → cavalry, Tank → vehicle, Bike → vehicle)

**Mutually Exclusive Tags:**
- [ ] No unit has both `static` and `fast`/`flying`
- [ ] No unit has both `aggressive` and `defensive`
- [ ] No unit has both `monster` and `vehicle`
- [ ] No unit has both `elite` and `cheap`
- [ ] No unit has both `organic` and `corrupted` (unless mortal cultist, not daemon)
- [ ] No unit has both `human` and `monster` (humans are not monsters!)

**Dimension Score Validation:**
- [ ] Every tag's dimension weights are applied (check TAG_TO_DIMENSION_WEIGHTS)
- [ ] `vehicle` tag → `tech: +3` present
- [ ] `robot` tag → `tech: +4` AND `humanity: -2` present
- [ ] `flying`/`aircraft` tag → positive `speed` present
- [ ] `monster` tag → negative `humanity` present
- [ ] `corrupted` tag → `purity: -4` present

**Dimension Inflation Check (v1.8.0):**

After tagging all units in a faction, perform this validation:

- [ ] Calculate faction average for each dimension across all units
- [ ] Compare to expected faction profile (FACTION_DATA)
- [ ] Flag dimensions where unit-tag average deviates >3 from expected
- [ ] Check for common inflation sources:
  - `balanced` tag on weapon mix giving false versatility to mono-type factions
  - Missing faction-wide tags (Honor Code, Mischievous, etc.)
  - Not accounting for mono-type army composition
- [ ] Verify mono-type factions have NEGATIVE versatility

**Mono-Type Army Validation (v1.8.0):**

- [ ] If >80% of units share same role → apply mono-type versatility override
- [ ] Titan Lords: ALL units should have negative versatility
- [ ] `balanced` weapon tag does NOT mean personality versatility for mono-type factions

**Common Mistakes to Avoid:**
- ❌ Tagging cheap Q5+ units as `elite` just because they have Tough
- ❌ Tagging every unit as `defensive` when faction is chaotic/aggressive
- ❌ Missing `monster` tag on monster-role units
- ❌ Missing `magic`/`mystery` on Caster units
- ❌ Ignoring faction-wide rules like "Mischievous" or "Hold the Line"
- ❌ Missing `vehicle` tag on APCs, Trucks, Tanks, Walkers, **BIKES**
- ❌ Tagging Aircraft as `static` or `slow` (they FLY!)
- ❌ Putting `monster` role on mechanical walkers
- ❌ Missing `tech` dimension on vehicles/robots
- ❌ Contradictory tags on same unit (fast + static, aggressive + defensive)
- ❌ Units with only 1-2 tags (minimum is 3!)
- ❌ Tagging Battlesuits as `monster` (they're piloted tech = `vehicle`)
- ❌ Missing `drone` tag on drone units (use BOTH `drone` AND `robot`)
- ❌ Inconsistent robot tagging within faction (ALL Grunts or NO Grunts)
- ❌ Missing `tech` dimension on battlesuits
- ❌ **Skipping Step 0 (faction type check) — ALWAYS identify faction type first!**
- ❌ **Tagging daemons as `organic` (they're supernatural, NOT biological!)**
- ❌ **Removing `tech` from Chaos Marines (they keep their armor!)**
- ❌ **Tagging organic faction units as `robot` (Alien Hives Grunts are organic!)**
- ❌ **Tagging organic flyers as `vehicle` (flying beasts are monsters, not vehicles)**
- ❌ **Giving positive `tech` to organic factions (Alien Hives = always negative tech)**
- ❌ **Using `vehicle` role for organic "Titans" (Hive Titan = monster, not vehicle)**
- ❌ **Confusing corrupted (Chaos) with organic (Tyranids)**
- ❌ **Missing `human` tag on human faction heroes/infantry (Inquisition, HDF, etc.)**
- ❌ **Tagging human zealots as `monster` (Acolytes are humans, not monsters!)**
- ❌ **Missing `stealth`/`subtlety` on Assassin units (name = stealth operative)**
- ❌ **Contradictory `human` + `monster` tags on same unit**
- ❌ **Missing `humanity: +3` dimension on human units**
- ❌ **Cyborgs missing `tech` dimension (they're tech-enhanced)**
- ❌ **Equating weapon versatility with faction versatility** (a mech with sword + gun is NOT "versatile" if every unit is a mech)
- ❌ **Missing Honor Code → honorable tag mapping** (Titan Lords units all have this rule)
- ❌ **Ignoring faction composition for versatility scoring** (mono-type armies are specialists)
- ❌ **Neutral scores on identity dimensions** (Titan Lords at 0 on humanity when they're ALL robots)

## Output File Naming

Save tagged files as: `{faction-slug}-tagged.json`

Examples:
- `battle-brothers-tagged.json`
- `alien-hives-tagged.json`
- `wormhole-daemons-tagged.json`
- `dark-prime-brothers-tagged.json`

## Error Handling

If a unit cannot be confidently tagged:
1. Assign `role: "unknown"`
2. Add minimal tags based on stats alone
3. Include `"needsReview": true` flag
4. Leave `dimensionScores` empty

## Version History

- **1.8.0: Titan Lords & Mono-Type Army Fixes**
  - NEW: Mono-type army versatility override rule
  - NEW: Honor Code → honorable/noble tag mapping
  - NEW: Mercenary → independent tag mapping
  - NEW: Titan Lords faction-specific guidance
  - NEW: Dimension Inflation Check in Quality Checklist
  - NEW: Mono-Type Army Validation in Quality Checklist
  - Fixed: balanced weapon tag inflating versatility for mono-type factions
  - Fixed: Missing rule-to-tag mappings (Honor Code, Mercenary)
  - Added: 4 new common mistakes for versatility/dimension inflation
- **1.7.3: Infinite loop bug fix and fallback tag strategy**
  - **CRITICAL BUG FIX**: Fixed infinite loop in minimum 3 tags enforcement
  - Issue: Units with existing `reliable` tag would get stuck in while loop
  - Root cause: Quality-based tag check didn't include `reliable` in condition
  - Solution: Added `reliable` to quality tag check to prevent duplicate attempts
  - Added loop iteration tracking to detect and break infinite loops (max 10 attempts)
  - Implemented distinct fallback tag hierarchy: balanced → versatile → infantry
  - Added warning logging when unable to reach minimum 3 tags
  - Updated "Minimum Tags Rule" section with infinite loop prevention guidance
  - Example affected unit: "Weapon Masters" from high-elves.json (melee + reliable)
- **1.7.2: Zealot faction and minimum tags validation**
  - Added "Zealot" faction type to classification (Human Inquisition, Blessed Sisters)
  - Added zealot faction guidance: `zealot`, `faithful` tags, positive `faith` dimension
  - Added Zealot Faction Validation to Quality Checklist
  - Expanded Human Inquisition guidance with religious theme tags
  - Added Terrorism Ministry Assassin Casting rule → `magic`, `psychic` tags
  - Reinforced minimum 3 tags per unit rule
  - Added faction type determination guide (has vehicles → NOT primitive)
  - Clarified: Human Inquisition faction type should be "zealot" not "primitive"
- **1.7.1: Human Inquisition validation fixes**
  - Added Human Inquisition faction guidance (mixed faction, NOT primitive)
  - Added Assassin name-based detection → `stealth` + `subtlety: +3`
  - Added Cyborg name-based detection → `tech: +1 to +2` (keep `human`)
  - Added Human Faction Validation checklist section
  - Added `human` + `monster` to mutually exclusive tags
  - Added Scout rule → `scout` AND `mobile` tags guidance
  - Fixed: Human faction heroes/infantry MUST have `human` tag + `humanity: +3`
  - Fixed: Assassin units need `stealth` tag by name detection
  - Added 6 new common mistakes for human faction errors
- **1.7.0: Comprehensive faction analysis (ALL 87 OPR army books)**
  - **CRITICAL:** Added Corrupted vs Organic distinction (the #1 tagging mistake)
  - Added Pure Daemon faction guidance (NO organic tag on daemons!)
  - Added Chaos Space Marine variant guidance (KEEP tech + human tags)
  - Added Space Marine chapter equivalents (8 chapters)
  - Added comprehensive faction quick reference table (44 Grimdark Future factions)
  - Expanded faction-wide rules reference (200+ rules documented)
  - Added Bikes are ALWAYS vehicles clarification
  - Added Corrupted Faction Validation to Quality Checklist
  - Added Examples 12-13: Pure Daemon, Chaos Space Marine
  - Updated Step 0 faction classification to include Corrupted type
  - Expanded common mistakes with daemon/corruption-specific errors
  - Document based on analysis of all 87 OPR army books (44 GF + 43 AoF)
- 1.6.0: Dark Prime Brothers fixes (Corrupted faction handling)
  - Added "Corrupted" faction type to classification
  - Added critical distinction: **Corruption ≠ Non-Humanity**
  - Added Havoc Brothers / Dark Prime Brothers comprehensive section
  - Added Darkborn and Reinforced to faction-wide rules
  - Added Bikers clarification: `fast-attack` role, NOT `vehicle`
  - Added Drop Pod + Immobile handling: `static`, NOT `mobile`
  - Added Corrupted Faction Validation checklist
  - Added 6 new common mistakes
- 1.5.0: Critical fixes for Organic Faction handling based on Alien Hives validation
  - Added Step 0: Determine Faction Type (organic vs tech vs mixed) — DO THIS FIRST!
  - Added comprehensive Alien Hives faction guidance (100% organic faction)
  - Fixed Aircraft rule handling: organic flyers are NOT vehicles
  - Fixed Grunt detection: faction-specific (DAO = robot, Alien Hives = organic)
  - Updated Step 1e decision tree with faction context priority
  - Added Organic Faction Validation to Quality Checklist
  - Added Examples 10-11: Organic Flyer, Organic Grunts
  - Clarified that "Titan" in organic factions = monster, not vehicle
  - Added 5 new common mistakes for organic faction errors
- 1.4.0: Added comprehensive Input Properties Reference
  - Added "Input Properties Reference" section documenting all JSON properties
  - Added "Generic Name Reference" table mapping genericName to roles/tags
  - Added "Unit Rules Reference" table with all OPR rules → tags mappings
  - Added "Weapon Properties Reference" for combat style detection
  - Added "Items/Equipment Reference" for embedded rules
  - Documented faction-level properties (background, gameSystemSlug)
  - This version provides complete coverage of all available input data
- 1.3.0: Major improvements based on DAO Union validation
  - Added Step 1e: Monster vs Vehicle decision tree
  - Added Battlesuit detection (Suit, Battle Suit, Stealth Suit → vehicle, NOT monster)
  - Added Drone detection (must have BOTH `drone` AND `robot` tags)
  - Added `battlesuit` and `collective` tags to dimension weights
  - Added DAO Union / Tau-like faction guidance
  - Clarified Fear rule does NOT determine monster vs vehicle
  - Added Grunt detection for tech factions (consistent robot tagging)
  - Updated `drone` dimension weights to include `humanity: -2`
  - Added battlesuit and drone validation to Quality Checklist
  - Expanded common mistakes with battlesuit/drone errors
- 1.2.0: Major improvements based on Human Defense Force validation
  - Added Step 1d: Name-based vehicle/aircraft/cavalry detection
  - Added Step 2a: Mutually exclusive tag checking
  - Clarified Monster vs Vehicle distinction (organic vs mechanical)
  - Added `aircraft` tag with proper flying/speed handling
  - Expanded Vehicle detection: APCs, Trucks, Walkers, Gunships
  - Aircraft MUST have `flying` tag, NEVER `static`
  - Added extensive HDF faction guidance
  - Updated cheap threshold to ≤12pts (was ≤10pts)
  - Added threshold reference table for elite/cheap calculation
  - Added robot dimension requirements (tech: +4, humanity: -2)
  - Expanded quality checklist with vehicle/aircraft/dimension validation
  - Added "Hold the Line", "For the Greater Good", "WAAAGH!" faction rules
- 1.1.0: Major improvements based on Goblin tagging validation
  - Added Step 1b: Stats-based elite calculation (cost/model + quality)
  - Added Step 1c: Role-required tags (monster→monster tag, etc.)
  - Added Step 2b: Faction-wide rule handling (Mischievous, etc.)
  - Clarified `defensive` tag should NOT auto-apply from Regeneration
  - Added `treacherous`, `cunning`, `unpredictable` tags
  - Added Goblins, Orcs, Ratmen to faction guidance
  - Expanded quality checklist with common mistakes
  - Added name-based inference for cavalry (Riders, Mounted, etc.)
- 1.0.0: Initial skill definition
