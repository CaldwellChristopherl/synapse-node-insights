#!/usr/bin/env python3
import json
import sys
from pathlib import Path

def tag_unit_fast(unit, faction_name=''):
    name = unit.get('name', '')
    cost = unit.get('cost')
    size = unit.get('size', 1)
    quality = unit.get('quality')
    
    if cost is None:
        return {
            'id': unit.get('id', ''),
            'name': name,
            'skipped': True,
            'reason': 'No cost'
        }
    
    rules = unit.get('rules', [])
    rule_names = [r.get('label', r.get('name', '')) for r in rules]
    rule_names_lower = [n.lower() for n in rule_names]
    
    role = 'troops'
    tags = []
    
    if 'Hero' in rule_names:
        role = 'hero'
        tags.append('hero')
    
    vehicle_keywords = ['tank', 'vehicle', 'walker', 'mech', 'dreadnought',
                       'gunship', 'aircraft', 'flyer', 'bomber', 'fighter']
    if any(kw in name.lower() for kw in vehicle_keywords):
        role = 'vehicle'
        tags.append('tech')
    
    if cost and size:
        cost_per_model = cost / size
        if cost_per_model >= 30 and quality <= 3:
            tags.append('elite')
    
    return {
        'id': unit.get('id', ''),
        'name': name,
        'cost': cost,
        'size': size,
        'quality': quality,
        'role': role,
        'tags': tags
    }

def process_army_book(input_path):
    print("Processing: " + str(Path(input_path).name))
    
    with open(input_path, 'r', encoding='utf-8') as f:
        army_book = json.load(f)
    
    faction_name = army_book.get('name', '')
    faction_uid = army_book.get('uid', '')
    
    print("  Faction: " + faction_name)
    print("  Total units: " + str(len(army_book.get('units', []))))
    
    tagged_units = []
    units = army_book.get('units', [])
    
    for i, unit in enumerate(units):
        try:
            tagged_unit = tag_unit_fast(unit, faction_name)
            if not tagged_unit.get('skipped'):
                tagged_units.append(tagged_unit)
            
            if (i + 1) % 10 == 0 or i == len(units) - 1:
                unit_name = unit.get('name', 'unknown')
                print("  Processed " + str(i + 1) + "/" + str(len(units)) + " units: " + unit_name)
        except Exception as e:
            print("  ERROR: " + str(e))
            continue
    
    print("  Tagged " + str(len(tagged_units)) + " units")
    
    output = {
        'factionId': faction_uid,
        'factionName': faction_name,
        'version': '1.0',
        'units': tagged_units
    }
    
    parent = Path(input_path).parent
    filename = faction_uid + "-tagged.json"
    output_path = parent / filename
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
    
    print("  Saved: " + str(output_path))
    return output

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 simple_tagger.py <path-to-army-book.json>")
        sys.exit(1)
    
    army_book_path = sys.argv[1]
    process_army_book(army_book_path)
