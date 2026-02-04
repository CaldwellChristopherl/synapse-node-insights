#!/usr/bin/env python3
"""
OPR Army Book Unit Tagger v7.0
Enhanced tagging with improved accuracy based on skill v1.7.2

Major updates v7.0 (skill v1.7.2):
- NEW: Zealot faction type (Human Inquisition, Blessed Sisters)
- NEW: Assassin name-based detection → stealth + subtlety: +3
- NEW: Cyborg name-based detection → tech: +1 to +2 (keep human tag)
- NEW: Minimum 3 tags per unit validation
- NEW: Scout rule → both scout AND mobile tags
- NEW: Faction type determination checks for vehicles (has vehicles → NOT primitive)
- ENHANCED: Human faction validation (ALL infantry/heroes need human tag + humanity: +3)
- ENHANCED: Zealot faction rules (zealot/faithful tags, positive faith dimension)

Previous updates v6.0 (skill v1.7.0):
- CRITICAL: Corrupted vs Organic distinction (daemons are NOT organic!)
- Pure Daemon faction handling (corrupted + monster, NO organic tag)
- Chaos Space Marine handling (corrupted + tech + human, KEEP tech!)
- ALL bikes are vehicles (regardless of faction)
- Expanded faction type classification (includes CORRUPTED type)
"""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Set, Any, Optional

# Dimension weights for tags (from skill v1.5.0)
TAG_TO_DIMENSION_WEIGHTS = {
    # Patience dimension
    "aggressive": {"patience": -3},
    "patient": {"patience": 3},
    "defensive": {"patience": 3},
    "static": {"patience": 2},

    # Collective dimension
    "swarm": {"collective": 4},
    "horde": {"collective": 4},
    "support": {"collective": 2},
    "independent": {"collective": -2},
    "hero": {"collective": -1},
    "collective": {"collective": 3},

    # Order dimension
    "disciplined": {"order": 3},
    "reliable": {"order": 2},
    "chaotic": {"order": -3},
    "unpredictable": {"order": -3},
    "cunning": {"order": -2},

    # Tech dimension (CRITICAL: always apply for vehicles/robots!)
    "vehicle": {"tech": 3},
    "robot": {"tech": 4, "humanity": -2},
    "drone": {"tech": 4, "humanity": -2},
    "battlesuit": {"tech": 3},
    "aircraft": {"tech": 3, "speed": 3},
    "cyborg": {"tech": 2},  # v1.7.2 NEW: Tech-enhanced human (keep human tag)
    "organic": {"tech": -2},
    "beast": {"tech": -3},

    # Elite dimension
    "elite": {"elite": 4},
    "veteran": {"elite": 3},
    "cheap": {"elite": -2},
    "expendable": {"elite": -3},
    "horde": {"elite": -3},

    # Honor dimension
    "honorable": {"honor": 4},
    "noble": {"honor": 3},
    "ruthless": {"honor": -3},
    "treacherous": {"honor": -4},
    "cunning": {"honor": -2},

    # Faith dimension
    "zealot": {"faith": 4},
    "faithful": {"faith": 3},
    "fearless": {"faith": 2},
    "daemon": {"faith": 3, "purity": -4},

    # Subtlety dimension
    "stealth": {"subtlety": 4},
    "infiltrate": {"subtlety": 4},
    "scout": {"subtlety": 3},
    "ambush": {"subtlety": 3},
    "cunning": {"subtlety": 2},

    # Tradition dimension
    "ancient": {"tradition": 4},
    "traditional": {"tradition": 3},
    "innovative": {"tradition": -3},
    "experimental": {"tradition": -2},

    # Purity dimension
    "pure": {"purity": 4},
    "corrupted": {"purity": -4},
    "corruption": {"purity": -4},
    "mutant": {"purity": -4},

    # Speed dimension
    "fast": {"speed": 4},
    "mobile": {"speed": 3},
    "flying": {"speed": 3},
    "cavalry": {"speed": 3},
    "slow": {"speed": -2},
    "static": {"speed": -3},

    # Mystery dimension
    "mysterious": {"mystery": 4},
    "psychic": {"mystery": 3},
    "magic": {"mystery": 3},
    "ethereal": {"mystery": 4},

    # Versatility dimension
    "versatile": {"versatility": 4},
    "adaptive": {"versatility": 3},
    "specialist": {"versatility": -3},
    "focused": {"versatility": -2},
    "balanced": {"versatility": 2},

    # Humanity dimension
    "human": {"humanity": 3},
    "humanoid": {"humanity": 2},
    "alien": {"humanity": -3},
    "monster": {"humanity": -4},
    "daemon": {"humanity": -4},
    "beast": {"humanity": -2},

    # Leadership dimension
    "commander": {"leadership": 4},
    "leader": {"leadership": 3},
    "inspiring": {"leadership": 3},
    "autonomous": {"leadership": -2},
    "hero": {"leadership": 2}
}


class FactionType:
    """
    v1.7.2 Step 0: Determine Faction Type
    CRITICAL: This affects ALL subsequent tagging decisions
    """
    CORRUPTED = "corrupted"  # Wormhole Daemons, Prime Brothers (Chaos corruption)
    ORGANIC = "organic"      # Alien Hives, Saurians (100% biological, NOT daemons!)
    TECH = "tech"           # DAO Union, Robot Legions, HDF (mechanical/tech-focused)
    ZEALOT = "zealot"       # Human Inquisition, Blessed Sisters (religious/zealot)
    MIXED = "mixed"         # Battle Brothers, Havoc Brothers (varies by unit)
    PRIMITIVE = "primitive" # Goblins, Orcs (low/negative tech, NO vehicles)


def determine_faction_type(faction_name: str, army_book: Dict) -> str:
    """
    Step 0: Determine Faction Type (CRITICAL - DO THIS FIRST!)

    This determines whether the faction is:
    - CORRUPTED: Chaos corruption, daemons (NOT organic!)
    - ORGANIC: Pure biological creatures (NOT daemons!)
    - TECH: Tech-focused faction (vehicles, robots, tech: positive)
    - ZEALOT: Religious/inquisition factions (mixed tech, religious theme)
    - MIXED: Mix of organic and tech units
    - PRIMITIVE: Low-tech faction (NO vehicles!)

    v1.7.2: NEW - Zealot faction type, improved primitive detection
    - Zealot factions: Human Inquisition, Blessed Sisters (religious theme)
    - Primitive detection: Must have NO vehicles (check units)
    - Has vehicles → NOT primitive (ZEALOT or MIXED)

    v1.7.0: CRITICAL - Corrupted ≠ Organic!
    - Pure Daemons → CORRUPTED (supernatural, NOT biological)
    - Chaos Marines → CORRUPTED (keep tech + human)
    - Tyranids → ORGANIC (biological, NOT Chaos)
    """
    faction_lower = faction_name.lower()
    background = army_book.get('background', '').lower()

    # CORRUPTED factions (Chaos corruption, daemons)
    # v1.7.0 CRITICAL: Daemons are NOT organic!
    corrupted_keywords = [
        'wormhole daemon', 'wormhole demon', 'daemon', 'demon',
        'prime brothers',  # Chaos Space Marines
        'disciples',       # Mortal cultists (Change/Lust/Plague/War Disciples)
        'havoc brothers', 'havoc', 'chaos',
        'infected colonies'  # Genestealer Cult (alien corruption)
    ]
    if any(kw in faction_lower or kw in background for kw in corrupted_keywords):
        return FactionType.CORRUPTED

    # ZEALOT factions (v1.7.2 NEW - religious/inquisition themed)
    # These are human factions with religious motivation and mixed tech
    zealot_keywords = [
        'inquisition', 'blessed sister', 'crusader', 'templar',
        'ecclesiarchy', 'adepta sororitas'
    ]
    if any(kw in faction_lower or kw in background for kw in zealot_keywords):
        return FactionType.ZEALOT

    # ORGANIC factions (100% biological, NO vehicles/robots, NOT daemons!)
    # v1.7.0: Removed 'daemon'/'demon' from organic keywords
    organic_keywords = [
        'alien hive', 'hive', 'tyranid', 'saurian', 'ratmen',
        'undead', 'ghostly', 'mummified'
    ]
    if any(kw in faction_lower or kw in background for kw in organic_keywords):
        return FactionType.ORGANIC

    # TECH factions (mechanical, robots, vehicles)
    tech_keywords = [
        'dao union', 'tau', 'robot legion', 'machine cult',
        'defense force', 'fleet', 'automaton', 'eternal dynasty',
        'brothers'  # Space Marines (non-Prime)
    ]
    if any(kw in faction_lower or kw in background for kw in tech_keywords):
        # Exception: "Prime Brothers" are CORRUPTED, not TECH
        if 'prime' in faction_lower:
            return FactionType.CORRUPTED
        return FactionType.TECH

    # PRIMITIVE factions (low tech, NO vehicles)
    # v1.7.2: Check if faction has vehicles - if yes, NOT primitive
    primitive_keywords = [
        'goblin', 'orc', 'beast', 'tribal', 'barbarian'
    ]
    if any(kw in faction_lower or kw in background for kw in primitive_keywords):
        # Check if any unit has vehicle-like characteristics
        has_vehicles = False
        for unit in army_book.get('units', []):
            unit_name = unit.get('name', '').lower()
            generic_name = unit.get('genericName', '').lower()
            vehicle_keywords = ['tank', 'vehicle', 'apc', 'truck', 'walker', 'gunship']
            if any(vk in unit_name or vk in generic_name for vk in vehicle_keywords):
                has_vehicles = True
                break

        # If has vehicles, it's MIXED, not PRIMITIVE
        if has_vehicles:
            return FactionType.MIXED
        else:
            return FactionType.PRIMITIVE

    # Default to MIXED (check unit-by-unit)
    return FactionType.MIXED


def get_rule_name(rule) -> str:
    """Extract rule name from rule object or string"""
    if isinstance(rule, dict):
        return rule.get('label', rule.get('name', ''))
    return str(rule)


def has_rule(unit: Dict, rule_name: str) -> bool:
    """Check if unit has a specific rule (case-insensitive)"""
    rules = unit.get('rules', [])
    rule_name_lower = rule_name.lower()
    for rule in rules:
        if get_rule_name(rule).lower().find(rule_name_lower) != -1:
            return True
    return False


def get_rule_rating(unit: Dict, rule_name: str) -> Optional[int]:
    """Get the rating value for a specific rule"""
    rules = unit.get('rules', [])
    for rule in rules:
        if isinstance(rule, dict):
            rule_label = get_rule_name(rule).lower()
            if rule_name.lower() in rule_label:
                return rule.get('rating')
    return None


def get_cost_per_model(unit: Dict) -> float:
    """Calculate cost per model"""
    cost = unit.get('cost')
    size = unit.get('size', 1)

    if cost is None:
        return 0

    if isinstance(size, str):
        try:
            size = int(size)
        except ValueError:
            size = 1

    if isinstance(cost, str):
        try:
            cost = int(cost)
        except ValueError:
            return 0

    return cost / max(size, 1)


def get_quality(unit: Dict) -> int:
    """Get unit quality with safe default"""
    quality = unit.get('quality')
    return quality if quality is not None else 4


def get_defense(unit: Dict) -> int:
    """Get unit defense with safe default"""
    defense = unit.get('defense')
    return defense if defense is not None else 4


def is_battlesuit(name: str) -> bool:
    """
    Detect if unit is a Battlesuit (piloted mech armor)
    CRITICAL: Battlesuits are vehicles, NOT monsters
    """
    battlesuit_keywords = ['suit', 'battle suit', 'battlesuit', 'stealth suit',
                          'armor', 'exo-', 'power armor', 'powered',
                          'mech', 'mechsuit', 'warsuit']
    return any(kw in name.lower() for kw in battlesuit_keywords)


def is_organic_creature(name: str) -> bool:
    """
    Detect if unit is an organic creature (not mechanical)
    Used for Monster vs Vehicle decision tree
    """
    organic_keywords = ['beast', 'spider', 'dragon', 'troll', 'daemon', 'demon',
                       'carnifex', 'hive', 'tyranid', 'genestealer', 'ripper',
                       'creature', 'monster', 'worm', 'wyrm', 'hydra',
                       'giant', 'ogre', 'kraken', 'swarm', 'rapacious',
                       'venom', 'ravenous', 'devourer', 'spore']
    return any(kw in name.lower() for kw in organic_keywords)


def is_mechanical_construct(name: str) -> bool:
    """
    Detect if unit is a mechanical construct (not organic)
    Used for Monster vs Vehicle decision tree
    """
    mechanical_keywords = ['walker', 'titan', 'suit', 'mech', 'tank', 'dreadnought',
                          'robot', 'automaton', 'construct', 'vehicle', 'apc',
                          'truck', 'transport', 'gunship', 'aircraft', 'armor']
    return any(kw in name.lower() for kw in mechanical_keywords)


def determine_role(unit: Dict, faction_type: str) -> str:
    """
    Step 1: Determine unit role based on characteristics
    CRITICAL v1.5.0: Faction type affects role determination
    - ORGANIC factions: "Titan" = monster, "Aircraft" = flying monster
    - TECH factions: "Titan" = vehicle, "Aircraft" = vehicle
    """
    size = unit.get('size', 1)
    cost_per_model = get_cost_per_model(unit)
    quality = get_quality(unit)
    name = unit.get('name', '')
    name_lower = name.lower()

    # Hero
    if has_rule(unit, 'Hero'):
        return 'hero'

    # Vehicle detection (name-based + rule-based)
    # CRITICAL v1.5.0: Check faction type first!
    vehicle_keywords = ['tank', 'apc', 'vehicle', 'truck', 'transport', 'walker',
                       'mech', 'dreadnought', 'gunship', 'bomber', 'fighter',
                       'bike', 'speeder', 'jetbike', 'hover']

    # ORGANIC factions: Even "Titan" or "Aircraft" are organic creatures
    if faction_type == FactionType.ORGANIC:
        # In organic factions, large creatures are monsters, NOT vehicles
        # Even if they have Aircraft rule or "Titan" in name
        if has_rule(unit, 'Fear') or is_organic_creature(name):
            tough_rating = get_rule_rating(unit, 'Tough') or 0
            if tough_rating >= 6 or (size <= 3 and cost_per_model > 150):
                return 'monster'

    # TECH/MIXED factions: Normal vehicle detection
    else:
        # Battlesuit detection (always vehicle in non-organic factions)
        if is_battlesuit(name):
            return 'vehicle'

        if has_rule(unit, 'Vehicle') or has_rule(unit, 'Aircraft') or \
           any(kw in name_lower for kw in vehicle_keywords):
            return 'vehicle'

        # Monster vs Vehicle Decision Tree (for TECH/MIXED factions only)
        if has_rule(unit, 'Fear') and has_rule(unit, 'Tough'):
            tough_rating = get_rule_rating(unit, 'Tough') or 0

            if tough_rating >= 6 or (size == 1 and cost_per_model > 200):
                # Check: Is it organic or mechanical?
                if is_organic_creature(name):
                    return 'monster'
                elif is_mechanical_construct(name):
                    return 'vehicle'
                else:
                    # Unclear - default based on Tough rating
                    if tough_rating >= 9:
                        return 'monster'
                    else:
                        return 'vehicle'

    # Swarm (large model count, cheap)
    if size >= 10 and cost_per_model <= 15:
        return 'swarm'

    # Fast Attack (including Aircraft on organic creatures)
    # v1.5.0: In organic factions, Aircraft units are fast-attack flying monsters
    if has_rule(unit, 'Fast') or has_rule(unit, 'Flying') or has_rule(unit, 'Aircraft') or \
       has_rule(unit, 'Ambush') or has_rule(unit, 'Scout'):
        return 'fast-attack'

    # Elite (expensive quality units)
    if cost_per_model >= 30 and quality <= 3:
        return 'elite'

    # Heavy Support (artillery, slow heavy weapons)
    if has_rule(unit, 'Artillery') or (has_rule(unit, 'Slow') and cost_per_model > 40):
        return 'heavy-support'

    # Default to troops
    return 'troops'


def calculate_stats_based_tags(unit: Dict) -> Set[str]:
    """
    Step 1b: Calculate tags from unit statistics
    CRITICAL: Elite calculation from cost/model AND quality
    """
    tags = set()
    cost_per_model = get_cost_per_model(unit)
    quality = get_quality(unit)
    size = unit.get('size', 1)

    if cost_per_model == 0:
        return tags

    # Elite vs Cheap calculation
    if cost_per_model >= 30 and quality <= 3:
        tags.add('elite')
    elif cost_per_model >= 20 and quality <= 4:
        tags.add('veteran')
    elif cost_per_model <= 12:
        tags.add('cheap')

    # Expendable: Q5+ regardless of Tough (unless cost is very high)
    if quality >= 5 and cost_per_model <= 40:
        tags.add('expendable')

    # Horde
    if size >= 10:
        tags.add('horde')

    return tags


def get_faction_wide_tags(faction_name: str, unit: Dict, faction_type: Optional[str] = None) -> Set[str]:
    """
    Step 2b: Get tags that apply to entire faction
    v1.7.2: Enhanced zealot faction handling
    IMPORTANT: Faction personality overrides generic assumptions
    """
    tags = set()
    faction_lower = faction_name.lower()

    # Check for faction-wide rules
    if has_rule(unit, 'Mischievous'):
        tags.update(['treacherous', 'cunning'])

    if has_rule(unit, 'Battleborn'):
        tags.update(['disciplined', 'fearless'])

    if has_rule(unit, 'Hive Bond'):
        tags.update(['swarm', 'collective'])

    if has_rule(unit, 'Hold the Line'):
        tags.update(['disciplined', 'reliable'])

    if has_rule(unit, 'For the Greater Good'):
        tags.update(['collective', 'disciplined'])

    if has_rule(unit, 'WAAAGH!'):
        tags.update(['aggressive', 'chaotic'])

    # v1.7.2: Zealot faction handling
    if faction_type == FactionType.ZEALOT:
        # ALL infantry/heroes in zealot factions are HUMAN
        if not has_rule(unit, 'Vehicle') and unit.get('size', 1) >= 1:
            tags.add('human')

        # Religious units get zealot/faithful tags
        unit_name = unit.get('name', '').lower()
        if any(x in unit_name for x in ['missionary', 'crusader', 'acolyte', 'priest', 'preacher']):
            tags.add('zealot')

        # Fearless in zealot factions = religious fervor
        if has_rule(unit, 'Fearless'):
            tags.add('faithful')

    # Faction-wide Fearless indicates zealotry (for non-zealot factions)
    if has_rule(unit, 'Fearless') and faction_type != FactionType.ZEALOT:
        if any(x in faction_lower for x in ['brother', 'sister', 'zealot', 'crusad']):
            tags.add('zealot')

    # Faction-specific patterns from name
    if 'goblin' in faction_lower or 'grot' in faction_lower:
        tags.add('cunning')

    if 'daemon' in faction_lower or 'chaos' in faction_lower or 'havoc' in faction_lower:
        tags.add('chaotic')

    if 'undead' in faction_lower or 'mummified' in faction_lower or 'ghostly' in faction_lower:
        tags.add('ancient')

    if 'robot' in faction_lower or 'machine' in faction_lower or 'legion' in faction_lower:
        tags.add('ancient')

    if 'ratmen' in faction_lower or 'skaven' in faction_lower:
        tags.update(['treacherous', 'cunning'])

    if 'defense force' in faction_lower or ('human' in faction_lower and faction_type != FactionType.ZEALOT):
        # Human factions get human tag on infantry
        if not has_rule(unit, 'Vehicle') and unit.get('size', 1) >= 3:
            tags.add('human')

    return tags


def apply_name_based_detection(unit: Dict, faction_type: str, faction_name: str = '') -> Set[str]:
    """
    Step 1d: Name-Based Detection (CRITICAL)
    v1.7.2: ENHANCED - Assassin and Cyborg detection

    NEW v1.7.2:
    - Assassin detection: "Assassin" in name → stealth tag + subtlety: +3
    - Cyborg detection: "Cyborg" in name → tech: +1 to +2 (KEEP human tag)

    CRITICAL for CORRUPTED factions (v1.7.0):
    - Pure Daemons: corrupted + monster (NO organic!)
    - Chaos Marines: corrupted + tech + human (KEEP tech!)
    - Mortal Cultists: corrupted + human

    CRITICAL for ORGANIC factions:
    - NO vehicles, NO robots (all units are organic)
    - "Grunt" = organic auxiliaries (NOT robots)
    - "Aircraft" = flying creatures (NOT vehicles)
    - "Titan" = giant organic creature (NOT vehicle)
    """
    tags = set()
    name = unit.get('name', '').lower()
    generic_name = unit.get('genericName', '').lower()
    faction_lower = faction_name.lower()

    # v1.7.2 NEW: Assassin Detection (CRITICAL for Human Inquisition)
    # ANY unit with "Assassin" in name → add stealth tag
    if 'assassin' in name:
        tags.add('stealth')

    # v1.7.2 NEW: Cyborg Detection
    # "Cyborg" in name → tech-enhanced human (NOT full robot)
    # KEEP human tag, add moderate tech
    if 'cyborg' in name:
        tags.add('cyborg')  # Will be handled in dimension calculation

    # CORRUPTED FACTION HANDLING (v1.7.0 CRITICAL)
    if faction_type == FactionType.CORRUPTED:
        # ALL corrupted faction units get corrupted tag
        tags.add('corrupted')

        # Check if Pure Daemon or Chaos Marine
        daemon_keywords = ['daemon', 'demon', 'bloodthirster', 'keeper', 'great unclean',
                          'lord of change', 'herald', 'plaguebearer', 'bloodletter',
                          'daemonette', 'horror', 'flamer', 'screamer', 'fiend']
        is_daemon = any(kw in name for kw in daemon_keywords)

        # Check if Chaos Marine (armored warrior with tech)
        marine_keywords = ['prime brother', 'chaos marine', 'terminator', 'chosen',
                          'havoc', 'raptor', 'obliterator', 'dreadnought']
        is_chaos_marine = any(kw in name or kw in faction_lower for kw in marine_keywords)

        if is_daemon:
            # Pure Daemon: corrupted + monster (NO organic, NO tech, NO human)
            tags.add('monster')
            tags.add('daemon')
            # DO NOT add organic tag!
        elif is_chaos_marine or 'prime' in faction_lower:
            # Chaos Space Marine: corrupted + tech + human (KEEP tech!)
            tags.add('tech')
            tags.add('human')
            # Vehicles still get vehicle tag (Chaos tanks, bikes, etc.)
            vehicle_keywords = ['tank', 'bike', 'dreadnought', 'walker', 'rhino']
            if any(kw in name for kw in vehicle_keywords):
                tags.add('vehicle')
        else:
            # Mortal cultist: corrupted + human
            tags.add('human')

        # Continue with normal detection for vehicles, etc.
        # (but daemons won't get vehicle tags)

    # ORGANIC FACTION HANDLING (v1.5.0 CRITICAL)
    elif faction_type == FactionType.ORGANIC:
        # ALL units in organic factions are organic
        tags.add('organic')

        # Grunt in organic factions = organic auxiliaries (NOT robots!)
        if 'grunt' in name or 'grunt' in generic_name:
            tags.update(['organic', 'beast'])
            # NO robot tag for organic factions!

        # NO vehicle detection in organic factions
        # Even "Titan" or "Aircraft" are organic creatures

        # Beast detection
        if is_organic_creature(name) or 'beast' in name or 'beast' in generic_name:
            tags.add('beast')

        # Swarm detection
        if 'swarm' in name or 'swarm' in generic_name:
            tags.update(['swarm', 'horde'])

        return tags

    # TECH/MIXED/PRIMITIVE FACTION HANDLING
    # Normal detection rules apply

    # Battlesuit Detection
    if is_battlesuit(name) or is_battlesuit(generic_name):
        tags.update(['battlesuit', 'vehicle'])

    # Vehicle Detection
    # v1.7.0 CRITICAL: ALL bikes are vehicles (regardless of faction)
    vehicle_keywords = ['tank', 'apc', 'vehicle', 'truck', 'transport',
                       'walker', 'titan', 'mech', 'dreadnought',
                       'gunship', 'aircraft', 'flyer', 'bomber', 'fighter',
                       'bike', 'speeder', 'jetbike', 'hover', 'cannon']

    if any(kw in name or kw in generic_name for kw in vehicle_keywords):
        tags.add('vehicle')

    # v1.7.0: Extra check for bikes (ALWAYS vehicles)
    bike_keywords = ['bike', 'biker', 'jetbike', 'speeder']
    if any(kw in name or kw in generic_name for kw in bike_keywords):
        tags.add('vehicle')

    # Aircraft Detection (for TECH factions only)
    aircraft_keywords = ['gunship', 'aircraft', 'flyer', 'bomber', 'fighter', 'helicopter']
    if any(kw in name or kw in generic_name for kw in aircraft_keywords):
        tags.update(['aircraft', 'flying', 'vehicle'])

    # Cavalry Detection
    cavalry_keywords = ['rider', 'cavalry', 'mounted', 'chariot', 'biker']
    if any(kw in name or kw in generic_name for kw in cavalry_keywords):
        tags.add('cavalry')

    # Drone Detection
    if 'drone' in name or 'drone' in generic_name:
        tags.update(['drone', 'robot'])

    # Grunt Detection (for TECH factions)
    if 'grunt' in name or 'grunt' in generic_name:
        # Check if faction is tech-focused
        tech_faction_keywords = ['dao', 'union', 'tau', 'greater good']
        if any(kw in faction_lower for kw in tech_faction_keywords):
            tags.add('robot')

    # Robot/Automaton Detection
    robot_keywords = ['robot', 'automaton', 'construct', 'android']
    if any(kw in name or kw in generic_name for kw in robot_keywords):
        tags.add('robot')

    # Infantry Faction Detection (for human armies)
    human_keywords = ['guard', 'soldier', 'trooper', 'marine', 'brother', 'recruit', 'militia']
    if any(kw in name or kw in generic_name for kw in human_keywords):
        tags.add('human')

    return tags


def analyze_weapons(unit: Dict) -> Set[str]:
    """Analyze unit weapons to determine combat style tags"""
    tags = set()
    weapons = unit.get('weapons', [])

    if not weapons:
        return tags

    ranged_count = 0
    melee_count = 0
    max_range = 0

    for weapon in weapons:
        weapon_range = weapon.get('range')
        if weapon_range is None:
            weapon_range = 0

        if weapon_range >= 12:
            ranged_count += 1
            max_range = max(max_range, weapon_range)
        else:
            melee_count += 1

    # Ranged vs Melee
    if ranged_count > 0 and melee_count == 0:
        tags.add('ranged')
    elif melee_count > 0 and ranged_count == 0:
        tags.add('melee')
    elif ranged_count > 0 and melee_count > 0:
        tags.add('balanced')

    # Artillery (long range static weapons)
    if max_range >= 36:
        tags.add('static')

    return tags


def analyze_rules(unit: Dict, faction_type: str) -> Set[str]:
    """
    Step 2: Analyze unit rules to assign tags
    v1.5.0: CRITICAL - Aircraft rule handling depends on faction type
    """
    tags = set()
    rules = unit.get('rules', [])

    for rule in rules:
        rule_name = get_rule_name(rule).lower()

        # Combat style
        if any(x in rule_name for x in ['frenzy', 'furious', 'berserk', 'impact']):
            tags.add('aggressive')

        if 'shield' in rule_name or 'phalanx' in rule_name:
            tags.add('defensive')

        if 'relentless' in rule_name or 'artillery' in rule_name:
            tags.add('ranged')

        # Unit type
        if 'hero' in rule_name:
            tags.add('hero')
            tough_rating = get_rule_rating(unit, 'Tough') or 0
            if tough_rating >= 3:
                tags.add('leader')

        if 'veteran' in rule_name:
            tags.add('veteran')

        # Movement
        if 'fast' in rule_name:
            tags.add('fast')

        if 'flying' in rule_name or 'fly' == rule_name:
            tags.add('flying')

        # Aircraft (CRITICAL v1.5.0: depends on faction type!)
        if 'aircraft' in rule_name:
            if faction_type == FactionType.ORGANIC:
                # Organic factions: Aircraft = flying organic creature
                tags.update(['flying', 'beast', 'organic'])
                # NO vehicle tag!
            else:
                # Tech/Mixed factions: Aircraft = mechanical vehicle
                tags.update(['aircraft', 'flying', 'vehicle'])

        if 'slow' in rule_name:
            tags.add('slow')

        # v1.7.2: Scout rule → BOTH scout AND mobile tags
        if 'scout' in rule_name:
            tags.update(['scout', 'mobile'])

        if 'ambush' in rule_name or 'strider' in rule_name:
            tags.add('mobile')

        if 'stealth' in rule_name:
            tags.add('stealth')

        # Artillery on GROUND units only
        if 'artillery' in rule_name:
            tags.add('static')

        # Special abilities (CRITICAL: Casters MUST add mystery dimension)
        if any(x in rule_name for x in ['psychic', 'wizard', 'caster', 'spellcaster']):
            tags.update(['psychic', 'magic'])

        if 'fearless' in rule_name:
            tags.add('fearless')

        if 'regeneration' in rule_name or 'regenerate' in rule_name:
            tags.add('regeneration')

        # Tough tag only if unit is also elite
        if 'tough' in rule_name:
            cost_per_model = get_cost_per_model(unit)
            if cost_per_model >= 25:
                tags.add('tough')

        if any(x in rule_name for x in ['unpredictable', 'random', 'unstable']):
            tags.add('unpredictable')

        if any(x in rule_name for x in ['chaotic', 'berserk', 'frenzy']):
            tags.add('chaotic')

        if 'mischievous' in rule_name:
            tags.update(['treacherous', 'cunning'])

        # Technology (only for non-organic factions)
        if faction_type != FactionType.ORGANIC:
            if 'vehicle' in rule_name or 'transport' in rule_name:
                tags.add('vehicle')

        # Faction theme
        if any(x in rule_name for x in ['mutation', 'daemon', 'warp', 'corrupt']):
            tags.add('corruption')

        if 'daemon' in rule_name:
            tags.add('daemon')

        if any(x in rule_name for x in ['blessed', 'pure', 'holy']):
            tags.add('pure')

        if any(x in rule_name for x in ['backstab', 'poison', 'assassin']):
            tags.add('treacherous')

        # Fear on organic creatures = monster
        if 'fear' in rule_name:
            if faction_type == FactionType.ORGANIC or (unit.get('size', 1) <= 3 and 'vehicle' not in tags):
                tags.add('monster')

    return tags


def analyze_unit_name(unit: Dict, faction_type: str) -> Set[str]:
    """
    Infer tags from unit name
    v1.5.0: Enhanced with faction type awareness
    """
    tags = set()
    name = unit.get('name', '').lower()
    generic_name = unit.get('genericName', '').lower()

    # Beast/Monster (organic creatures)
    beast_keywords = ['beast', 'monster', 'creature', 'dragon', 'troll', 'giant', 'ogre',
                     'spider', 'worm', 'wyrm', 'hydra']
    if any(kw in name or kw in generic_name for kw in beast_keywords):
        tags.add('beast')
        if faction_type == FactionType.ORGANIC:
            tags.add('organic')

    # Daemon
    if 'daemon' in name or 'demon' in name:
        tags.add('daemon')

    # Caster (CRITICAL: must add magic/psychic AND mystery dimension)
    caster_keywords = ['wizard', 'mage', 'sorcerer', 'shaman', 'priest', 'warlock',
                      'psyker', 'librarian', 'channeler', 'synapse']
    if any(kw in name for kw in caster_keywords):
        tags.update(['magic', 'psychic'])

    return tags


def apply_role_required_tags(unit: Dict, role: str, tags: Set[str]) -> Set[str]:
    """
    Step 1c: Apply tags required by certain roles
    CRITICAL: Role-based tags are mandatory
    """
    if role == 'monster':
        tags.add('monster')

    if role == 'vehicle':
        tags.add('vehicle')

    if role == 'swarm':
        tags.update(['horde', 'swarm'])

    if role == 'hero':
        tags.add('hero')

    return tags


def check_mutually_exclusive_tags(unit: Dict, tags: Set[str], faction_type: str) -> Set[str]:
    """
    Step 2a: Check for Mutually Exclusive Tags
    v1.5.0: Enhanced with faction type awareness
    """
    name = unit.get('name', '').lower()

    # Movement Contradictions
    # CRITICAL: Aircraft are NEVER static or slow!
    if 'aircraft' in tags or 'flying' in tags:
        tags.discard('static')
        tags.discard('slow')

    # static ↔ fast/flying/mobile
    if 'fast' in tags or 'flying' in tags or 'mobile' in tags:
        tags.discard('static')

    # slow ↔ fast
    if 'slow' in tags and 'fast' in tags:
        tags.discard('slow')

    # Combat Style Contradictions
    if 'aggressive' in tags and 'defensive' in tags:
        if has_rule(unit, 'Impact') or has_rule(unit, 'Furious') or has_rule(unit, 'Frenzy'):
            tags.discard('defensive')
        elif has_rule(unit, 'Shield') or has_rule(unit, 'Phalanx'):
            tags.discard('aggressive')
        else:
            tags.discard('defensive')

    # Type Contradictions
    # CRITICAL v1.5.0: In ORGANIC factions, NEVER have vehicle/robot tags
    if faction_type == FactionType.ORGANIC:
        tags.discard('vehicle')
        tags.discard('robot')
        tags.discard('battlesuit')
        tags.discard('aircraft')  # Keep flying, but remove aircraft (which implies vehicle)
    else:
        # monster ↔ vehicle (for non-organic factions)
        if 'monster' in tags and 'vehicle' in tags:
            if 'battlesuit' in tags or is_battlesuit(name):
                tags.discard('monster')
            elif is_mechanical_construct(name):
                tags.discard('monster')
            elif is_organic_creature(name):
                tags.discard('vehicle')
            else:
                tags.discard('monster')

        # monster ↔ battlesuit
        if 'monster' in tags and 'battlesuit' in tags:
            tags.discard('monster')

    # robot ↔ organic
    if 'robot' in tags and 'organic' in tags:
        tags.discard('organic')

    # Elite/Cheap Contradictions
    if 'elite' in tags and 'cheap' in tags:
        tags.discard('cheap')

    if 'elite' in tags and 'expendable' in tags:
        tags.discard('expendable')

    return tags


def apply_special_logic(unit: Dict, tags: Set[str], faction_type: Optional[str] = None) -> Set[str]:
    """
    Apply special tagging logic and refinements
    v1.7.2: Enhanced minimum tag validation
    """

    # Artillery/static ranged = defensive
    if 'static' in tags and 'ranged' in tags:
        tags.add('defensive')

    # Remove contradictions
    cost_per_model = get_cost_per_model(unit)
    quality = get_quality(unit)

    if 'defensive' in tags and 'cheap' in tags and not ('static' in tags and 'ranged' in tags):
        if quality >= 5:
            tags.discard('defensive')

    # v1.7.2: Ensure MINIMUM 3 TAGS per unit (CRITICAL)
    while len(tags) < 3:
        # Try to add combat style tags
        weapons = unit.get('weapons', [])
        if weapons and 'ranged' not in tags and 'melee' not in tags and 'balanced' not in tags:
            has_ranged = any(w.get('range', 0) >= 12 for w in weapons)
            has_melee = any(w.get('range', 0) < 12 for w in weapons)

            if has_ranged and has_melee:
                tags.add('balanced')
            elif has_ranged:
                tags.add('ranged')
            elif has_melee:
                tags.add('melee')
            continue

        # Try to add quality-based tags
        if 'elite' not in tags and 'veteran' not in tags and 'cheap' not in tags and 'expendable' not in tags:
            if quality <= 3 and cost_per_model >= 25:
                tags.add('veteran')
            elif quality >= 5:
                tags.add('expendable')
            elif cost_per_model >= 15:
                tags.add('reliable')
            else:
                tags.add('cheap')
            continue

        # Try to add role-based tags
        if not any(t in tags for t in ['fast', 'slow', 'mobile', 'static']):
            if has_rule(unit, 'Fast') or has_rule(unit, 'Flying'):
                tags.add('fast')
            elif has_rule(unit, 'Slow'):
                tags.add('slow')
            else:
                # Default: add reliable if nothing else fits
                tags.add('reliable')
            continue

        # Last resort: add generic tag based on role
        if 'balanced' not in tags:
            tags.add('balanced')
            continue

        # If we still can't find tags, break to avoid infinite loop
        break

    return tags


def calculate_dimension_scores(tags: Set[str]) -> Dict[str, int]:
    """
    Step 3: Calculate dimension scores from tags
    Sum weights and clamp to [-5, +5]
    """
    scores = {}

    for tag in tags:
        if tag in TAG_TO_DIMENSION_WEIGHTS:
            for dimension, value in TAG_TO_DIMENSION_WEIGHTS[tag].items():
                scores[dimension] = scores.get(dimension, 0) + value

    # Clamp to [-5, +5]
    for dim in scores:
        scores[dim] = max(-5, min(5, scores[dim]))

    # Only return non-zero scores
    return {k: v for k, v in scores.items() if v != 0}


def tag_unit(unit: Dict, faction_type: str, faction_name: str) -> Optional[Dict[str, Any]]:
    """
    Tag a single unit with personality dimensions
    v1.7.2: Enhanced with zealot faction support and minimum tag validation
    """

    # Skip units without cost
    cost = unit.get('cost')
    if cost is None:
        return None

    # Step 1: Determine role (with faction type)
    role = determine_role(unit, faction_type)
    print(f"  Step 1 - Role determined: {role}")

    # Step 1b: Calculate stats-based tags
    tags = calculate_stats_based_tags(unit)

    # Step 1c: Apply role-required tags
    tags = apply_role_required_tags(unit, role, tags)

    # Step 1d: Name-based detection (v1.7.2 - assassin/cyborg detection)
    tags.update(apply_name_based_detection(unit, faction_type, faction_name))
    print(f"  Step 1d - Name tags: {sorted(tags)}")

    # Step 2: Analyze rules (v1.7.2 - scout rule enhancement)
    tags.update(analyze_rules(unit, faction_type))
    print(f"  Step 2 - Rule tags: {sorted(tags)}")

    # Step 2a: Check for mutually exclusive tags
    tags = check_mutually_exclusive_tags(unit, tags, faction_type)

    # Step 2b: Apply faction-wide tags (v1.7.2 - zealot faction support)
    tags.update(get_faction_wide_tags(faction_name, unit, faction_type))
    print(f"  Step 2b - Faction tags: {sorted(tags)}")

    # Analyze weapons
    tags.update(analyze_weapons(unit))
    print(f"  Step 2 - Weapon tags: {sorted(tags)}")

    # Analyze unit name
    tags.update(analyze_unit_name(unit, faction_type))

    # Apply special logic and cleanup (v1.7.2 - minimum 3 tags validation)
    tags = apply_special_logic(unit, tags, faction_type)
    print(f"  Step 3 - Special logic applied")

    # Re-check mutually exclusive tags after all tagging
    tags = check_mutually_exclusive_tags(unit, tags, faction_type)

    # Quality Validation
    # Ensure drone units have BOTH drone AND robot tags (unless organic faction)
    if faction_type != FactionType.ORGANIC:
        if 'drone' in tags and 'robot' not in tags:
            tags.add('robot')

    # v1.7.2: Final minimum tag check (CRITICAL)
    if len(tags) < 3:
        print(f"  WARNING: Unit '{unit.get('name', 'unknown')}' has only {len(tags)} tags: {sorted(tags)}")
        # Force add a generic tag to meet minimum
        if 'balanced' not in tags:
            tags.add('balanced')

    # Calculate dimension scores
    dimension_scores = calculate_dimension_scores(tags)
    print(f"  Step 3 - Dimensions: {dimension_scores}")

    # Extract simplified rules list
    rules_list = [get_rule_name(r) for r in unit.get('rules', [])]

    # Build output
    tagged_unit = {
        'id': unit.get('id', ''),
        'name': unit.get('name', ''),
        'cost': cost,
        'size': unit.get('size', 1),
        'quality': get_quality(unit),
        'defense': get_defense(unit),
        'role': role,
        'rules': rules_list,
        'tags': sorted(list(tags)),
        'dimensionScores': dimension_scores
    }

    return tagged_unit


def process_army_book(input_path: Path, output_dir: Path) -> Dict[str, Any]:
    """
    Process a single army book file
    v1.5.0: CRITICAL - Determine faction type FIRST (Step 0)
    """
    print(f"Processing: {input_path.name}")

    with open(input_path, 'r', encoding='utf-8') as f:
        army_book = json.load(f)

    faction_name = army_book.get('name', '')
    faction_uid = army_book.get('uid', '')

    # v1.5.0 STEP 0: Determine Faction Type (CRITICAL!)
    faction_type = determine_faction_type(faction_name, army_book)
    print(f"  Faction Type: {faction_type}")

    # Determine game system from path
    game_system = 'unknown'
    if 'grimdark-future' in str(input_path):
        game_system = 'grimdark-future'
    elif 'age-of-fantasy' in str(input_path):
        game_system = 'age-of-fantasy'

    # Tag all units (with faction type)
    tagged_units = []
    skipped = 0
    all_units = army_book.get('units', [])
    for idx, unit in enumerate(all_units, 1):
        unit_name = unit.get('name', 'unknown')
        print(f"Processing unit [{idx}/{len(all_units)}]: {unit_name}")
        start_time = time.time()
        try:
            tagged_unit = tag_unit(unit, faction_type, faction_name)
            if tagged_unit is not None:
                tagged_units.append(tagged_unit)
            else:
                skipped += 1
            elapsed = time.time() - start_time
            print(f"  ✓ Unit tagged in {elapsed:.2f}s")
            print(f"[{len(tagged_units) + skipped}/{len(all_units)}] Units processed")
            sys.stdout.flush()
        except Exception as e:
            print(f"  ERROR tagging unit {unit.get('name', 'unknown')}: {e}")
            continue

    # Build output structure
    output = {
        'factionId': faction_uid,
        'factionName': faction_name,
        'gameSystem': game_system,
        'factionType': faction_type,  # v1.7.2: Includes ZEALOT type
        'version': '1.7.2',
        'taggedAt': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'units': tagged_units
    }

    # Generate output filename
    faction_slug = faction_uid or input_path.stem
    output_filename = f"{faction_slug}-tagged.json"
    output_path = output_dir / output_filename

    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    msg = f"  ✓ Tagged {len(tagged_units)} units"
    if skipped > 0:
        msg += f" (skipped {skipped} upgrades)"
    msg += f" → {output_filename}"
    print(msg)

    return output


def main():
    """Main processing function"""
    import sys

    # Set up paths
    data_dir = Path('./opr-army-quiz/data')
    output_base = Path('./opr-army-quiz/tagged-units')

    # Create output directories
    output_base.mkdir(exist_ok=True)
    (output_base / 'age-of-fantasy').mkdir(exist_ok=True)
    (output_base / 'grimdark-future').mkdir(exist_ok=True)

    # Check if specific faction provided as argument
    if len(sys.argv) > 1:
        faction_name = sys.argv[1]
        print(f"OPR Unit Personality Tagger v7.0 (Skill v1.7.2)")
        print(f"Processing single faction: {faction_name}\n")

        # Find the faction file
        faction_files = list(data_dir.glob(f'**/{faction_name}.json'))
        if not faction_files:
            print(f"ERROR: Could not find faction '{faction_name}'")
            sys.exit(1)

        book_path = faction_files[0]

        # Determine output directory
        if 'grimdark-future' in str(book_path):
            output_dir = output_base / 'grimdark-future'
        elif 'age-of-fantasy' in str(book_path):
            output_dir = output_base / 'age-of-fantasy'
        else:
            output_dir = output_base

        output = process_army_book(book_path, output_dir)

        print(f"\n{'='*60}")
        print(f"Processing complete!")
        output_file = output_dir / f"{book_path.stem}-tagged.json"
        print(f"  Output: {output_file}")
        print(f"{'='*60}")

        # Print output for user verification
        print("\nOUTPUT (for verification):")
        print(json.dumps(output, indent=2))

        sys.exit(0)

    # Process all army books
    army_books = list(data_dir.glob('**/*.json'))

    print(f"OPR Unit Personality Tagger v7.0 (Skill v1.7.2)")
    print(f"Found {len(army_books)} army books to process\n")

    processed = 0
    errors = 0

    for book_path in sorted(army_books):
        try:
            # Determine output directory
            if 'grimdark-future' in str(book_path):
                output_dir = output_base / 'grimdark-future'
            elif 'age-of-fantasy' in str(book_path):
                output_dir = output_base / 'age-of-fantasy'
            else:
                output_dir = output_base

            process_army_book(book_path, output_dir)
            processed += 1
        except Exception as e:
            print(f"ERROR processing {book_path.name}: {e}")
            errors += 1
            continue

    print(f"\n{'='*60}")
    print(f"Processing complete!")
    print(f"  Successful: {processed}")
    print(f"  Errors: {errors}")
    print(f"  Output directory: {output_base}")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()
