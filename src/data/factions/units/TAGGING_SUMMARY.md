# OPR Army Book Tagging Report v2.0

**Date:** 2026-02-01
**Skill Version:** 1.1.0
**Script Version:** 2.0
**Total Army Books Tagged:** 83
**Success Rate:** 100% (zero errors)

## Processing Summary

- **Age of Fantasy:** 38 factions
- **Grimdark Future:** 45 factions
- **Total Units Tagged:** ~1,600 units
- **Upgrade Units Skipped:** Units without cost values (faction upgrades/options)

## Key Improvements in v2.0

### 1. Enhanced Elite Calculation (Step 1b)
The script now correctly calculates elite status from **stats** rather than just rules:

```
Elite Calculation:
- cost_per_model >= 30 AND quality <= 3  → `elite` tag (dimension +4)
- cost_per_model >= 20 AND quality <= 4  → `veteran` tag (dimension +3)
- cost_per_model <= 12 OR quality >= 5   → `cheap` tag (dimension -2)
- quality >= 5 AND (no Tough OR cost <= 10) → `expendable` tag (dimension -3)
```

**Example:**
- Goblin Leader (25pts, Q5+, Tough(3)) → Tagged as `cheap`, NOT `elite`
- Prime Brothers (60pts, Q3+) → Tagged as `elite` (+4 dimension)

### 2. Faction-Wide Rule Handling (Step 2b)
Faction personality is now consistently applied to ALL units:

| Faction | Faction Rule | Tags Applied | Dimension Impact |
|---------|-------------|--------------|------------------|
| Goblins | Mischievous | `treacherous`, `cunning` | honor: -4, order: -2 |
| Prime Brothers | Battleborn | `disciplined`, `fearless` | order: +3, faith: +2 |
| Alien Hives | Hive Bond | `collective` | collective: +2 |

**Validation:**
- ✅ Goblins: 20/20 units have `treacherous` tag
- ✅ Prime Brothers: 32/32 units have `disciplined` tag

### 3. Magic/Caster Detection
All caster units now receive proper tagging:

- **Rules Detected:** Caster, Wizard, Psychic, Spellcaster, Caster Group
- **Tags Applied:** `magic`, `psychic`
- **Dimension:** `mystery` +3 to +5

**Example:**
- Shaman Circle → `magic`, `psychic` with mystery dimension +5

### 4. Role-Required Tags (Step 1c)
Certain roles now enforce mandatory tags:

| Role | Required Tags | Required Dimensions |
|------|---------------|---------------------|
| monster | `monster` | humanity: -3 to -4 |
| vehicle | `vehicle` | tech: +2 to +4 |
| swarm | `horde`, `swarm` | collective: +3 to +4 |
| hero | `hero` | leadership: +2 to +5 |

### 5. Name-Based Tag Inference
Units are now tagged based on name patterns:

- "Rider", "Cavalry", "Mounted", "Chariot" → `cavalry`
- "Beast", "Monster", "Dragon", "Troll" → `beast`, `organic`
- "Wizard", "Shaman", "Priest" → `magic`, `psychic`
- "Tank", "Walker", "Mech" → `vehicle`

### 6. Data Type Safety
Script now handles edge cases:
- ✅ Null cost/quality/defense values
- ✅ String-typed numeric fields
- ✅ Missing weapon ranges
- ✅ Upgrade units (no cost)

## Example Tagging Results

### Goblins (Age of Fantasy)

**Goblin Leader**
- Cost: 25pts (1 model) = 25pts/model
- Quality: 5+
- Rules: Hero, Tough(3), Mischievous
- **Tags:** cheap, cunning, hero, leader, melee, tough, treacherous
- **Dimensions:** elite: -2, honor: -4, leadership: +5
- **Why Correct:** Q5+ unit is NOT elite despite Tough(3)—it's cheap expendable leader

**Warriors**
- Cost: 60pts (10 models) = 6pts/model
- Quality: 5+
- Rules: Mischievous
- **Tags:** cheap, cunning, expendable, horde, melee, swarm, treacherous
- **Dimensions:** elite: -5, honor: -4, collective: +4
- **Why Correct:** Horde unit with negative elite, faction treachery applied

**Shaman Circle**
- Cost: 165pts (5 models) = 33pts/model
- Quality: 5+
- Rules: Caster Group, Mischievous
- **Tags:** balanced, cheap, cunning, expendable, human, magic, psychic, treacherous
- **Dimensions:** mystery: +5, elite: -5, honor: -4
- **Why Correct:** Q5+ makes it expendable despite 33pts/model; magic tags + mystery dimension

### Prime Brothers (Grimdark Future)

**Grave Prime Master**
- Cost: 125pts (1 model) = 125pts/model
- Quality: 3+
- Rules: Hero, Tough(6), Battleborn, Fearless
- **Tags:** disciplined, elite, fearless, hero, leader, melee, monster, tough
- **Dimensions:** elite: +4, order: +3, leadership: +5
- **Why Correct:** High cost + Q3+ = elite, faction discipline applied

**Assault Prime Brothers**
- Cost: 165pts (5 models) = 33pts/model
- Quality: 3+
- Rules: Battleborn, Fearless
- **Tags:** disciplined, elite, fearless, melee
- **Dimensions:** elite: +4, order: +3, faith: +2
- **Why Correct:** 33pts/model + Q3+ qualifies for elite tag

## Tagging Validation

### Quality Checks Performed

**Structure Validation:**
- ✅ Every unit has a role assigned
- ✅ Every unit has 3+ relevant tags
- ✅ Dimension scores clamped to [-5, +5]
- ✅ Only non-zero dimensions included

**Stats-Based Validation:**
- ✅ Units < 15pts/model NOT tagged elite
- ✅ Q5+ units tagged cheap/expendable
- ✅ Elite tags match cost_per_model calculation

**Faction Consistency:**
- ✅ Faction-wide rules reflected in ALL units
- ✅ Goblins are NOT defensive (despite Regeneration/Tough)
- ✅ Ratmen have treacherous tags
- ✅ Daemons have corruption/chaotic tags

**Caster Validation:**
- ✅ All Caster/Wizard units have magic/psychic tags
- ✅ Mystery dimension applied (+2 to +5)

### Common Issues Fixed

| Issue | v1.0 Behavior | v2.0 Fix |
|-------|---------------|----------|
| Cheap Tough units | Tagged as `elite` | Correctly tagged as `cheap` + `tough` |
| Faction personality | Ignored Mischievous on some units | Applied to ALL units consistently |
| Casters missing mystery | No dimension added | Always adds mystery +3 |
| Null weapon ranges | Comparison errors | Safe defaults applied |
| String-typed numbers | Type errors | Automatic conversion |

## Output Format

Each tagged file follows this structure:

```json
{
  "factionId": "unique-id",
  "factionName": "Faction Name",
  "gameSystem": "grimdark-future" | "age-of-fantasy",
  "version": "1.1.0",
  "taggedAt": "2026-02-02T03:00:00Z",
  "units": [
    {
      "id": "unit-id",
      "name": "Unit Name",
      "cost": 100,
      "size": 5,
      "quality": 4,
      "defense": 4,
      "role": "troops",
      "rules": ["Rule1", "Rule2"],
      "tags": ["tag1", "tag2", "tag3"],
      "dimensionScores": {
        "elite": 2,
        "tech": -1
      }
    }
  ]
}
```

## File Locations

- **Age of Fantasy:** `opr-army-quiz/tagged-units/age-of-fantasy/*.json`
- **Grimdark Future:** `opr-army-quiz/tagged-units/grimdark-future/*.json`
- **Tagging Script:** `tag_army_books_v2.py`

## 15 Personality Dimensions

All units are scored across these dimensions:

1. **patience** (-5 to +5): Aggressive vs Patient/Defensive
2. **collective** (-5 to +5): Independent vs Swarm/Teamwork
3. **order** (-5 to +5): Chaotic vs Disciplined
4. **tech** (-5 to +5): Organic/Primitive vs Vehicles/Hi-tech
5. **elite** (-5 to +5): Cheap/Expendable vs Elite/Veteran
6. **honor** (-5 to +5): Ruthless/Treacherous vs Honorable
7. **faith** (-5 to +5): Secular vs Zealous/Faithful
8. **subtlety** (-5 to +5): Direct vs Stealth/Infiltrate
9. **tradition** (-5 to +5): Innovative vs Ancient/Traditional
10. **purity** (-5 to +5): Corrupt vs Pure/Uncorrupted
11. **speed** (-5 to +5): Slow/Static vs Fast/Mobile
12. **mystery** (-5 to +5): Mundane vs Psychic/Magical
13. **versatility** (-5 to +5): Specialist vs Versatile
14. **humanity** (-5 to +5): Alien/Monster vs Human/Humanoid
15. **leadership** (-5 to +5): Autonomous vs Commander/Inspiring

## Next Steps

These tagged units can now be integrated with the OPR Army Alignment Quiz to:

1. **Match quiz results to factions** - Compare player dimension scores to faction averages
2. **Build personality-based army lists** - Select units that align with player preferences
3. **Recommend units** - Suggest specific units based on player personality
4. **Generate themed armies** - Create cohesive armies matching player playstyle

## Technical Notes

- **Processing Time:** ~10 seconds for all 83 factions
- **Output Size:** ~2MB total (JSON files)
- **Dependencies:** Python 3.7+ (standard library only)
- **Compatibility:** Works with OPR Army Forge JSON format

## Version History

- **v2.0 (2026-02-01):** Complete rewrite based on skill v1.1.0
  - Enhanced elite calculation from stats
  - Faction-wide rule handling
  - Improved magic/caster detection
  - Role-required tags enforcement
  - Name-based tag inference
  - Data type safety improvements

- **v1.0 (2026-02-01):** Initial implementation
  - Basic rule-to-tag mapping
  - Simple dimension calculation
  - Some edge case errors

---

**Generated by:** OPR Unit Personality Tagger v2.0
**Based on:** Skill Definition v1.1.0
