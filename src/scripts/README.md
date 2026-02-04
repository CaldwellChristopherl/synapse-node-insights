# OPR Army Book Tagging Scripts

## tag_army_books.py

Python script that tags all OPR army book units with personality-based tags for the Army Alignment Quiz.

### Usage

```bash
# From project root directory
python3 opr-army-quiz/scripts/tag_army_books.py
```

### What It Does

1. Scans `opr-army-quiz/data/` for all army book JSON files
2. Analyzes each unit's stats, rules, and weapons
3. Assigns personality tags based on 15 dimensions
4. Outputs tagged files to `opr-army-quiz/tagged-units/`

### Output

- **Age of Fantasy:** `opr-army-quiz/tagged-units/age-of-fantasy/*.json`
- **Grimdark Future:** `opr-army-quiz/tagged-units/grimdark-future/*.json`
- **Summary:** `opr-army-quiz/tagged-units/TAGGING_SUMMARY.md`

### Requirements

- Python 3.7 or higher
- No external dependencies (uses standard library only)

### Example Output

```
OPR Unit Personality Tagger v2.0 (Skill v1.1.0)
Found 83 army books to process

Processing: goblins.json
  ✓ Tagged 20 units → q9BQlBp583ZuuOnQ-tagged.json
Processing: prime-brothers.json
  ✓ Tagged 32 units → oqnnu0gk8q6hyyny-tagged.json
...

============================================================
Processing complete!
  Successful: 83
  Errors: 0
  Output directory: opr-army-quiz/tagged-units
============================================================
```

### Tagging Rules

The script follows the OPR Unit Personality Tagger Skill v1.1.0:

1. **Stats-Based Tagging:** Elite status calculated from cost/model + quality
2. **Faction-Wide Rules:** Personality rules (like Mischievous) applied to ALL units
3. **Role Classification:** Units assigned to hero/troops/elite/swarm/etc.
4. **Dimension Scores:** 15 personality dimensions scored from -5 to +5

### Key Features

- ✅ Correct elite calculation (not just Tough rule)
- ✅ Faction personality consistency (e.g., all Goblins are treacherous)
- ✅ Magic/caster detection with mystery dimension
- ✅ Role-based mandatory tags
- ✅ Name-based tag inference
- ✅ Safe handling of null/string values

### Troubleshooting

**Script fails to find data files:**
```bash
# Ensure you run from project root
cd /path/to/opr-army-questionaire
python3 opr-army-quiz/scripts/tag_army_books.py
```

**Want to re-tag specific faction:**
```bash
# Just delete the old tagged file and re-run
rm opr-army-quiz/tagged-units/age-of-fantasy/q9BQlBp583ZuuOnQ-tagged.json
python3 opr-army-quiz/scripts/tag_army_books.py
```

### Version

- **Script Version:** 2.0
- **Skill Version:** 1.1.0
- **Last Updated:** 2026-02-01
