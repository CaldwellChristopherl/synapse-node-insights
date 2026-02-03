const fs = require('fs');
const path = require('path');

// Base directory setup
const SCRIPT_DIR = path.dirname(__filename);
const BASE_DIR = path.join(SCRIPT_DIR, '..');

const DATA_DIR = path.join( 'src', 'data', 'factions', 'units');
const GRIMDARK_DIR = path.join(DATA_DIR, 'grimdark-future');
const AGEOFANTASY_DIR = path.join(DATA_DIR, 'age-of-fantasy');

function toKebabCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/_+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function main() {
  console.log('=== Faction File Renamer ===');
  console.log('Processing directory: ' + DATA_DIR);
  console.log('');

  let grimdarkRenamed = 0;
  let grimdarkErrors = 0;
  let ageOfFantasyRenamed = 0;
  let ageOfFantasyErrors = 0;

  // Process Grimdark Future files
  if (fs.existsSync(GRIMDARK_DIR)) {
    const grimdarkFiles = fs.readdirSync(GRIMDARK_DIR);
    console.log('Found Grimdark Future directory with ' + grimdarkFiles.length + ' files');
    console.log('');

    for (const file of grimdarkFiles) {
      if (!file.endsWith('-tagged.json')) {
        console.log('Skipping non-tagged file: ' + file);
        continue;
      }

      const filePath = path.join(GRIMDARK_DIR, file);

      try {
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawContent);

        // Check for factionName or factionId at root level
        const factionName = data.factionName || data.factionId || data.name;

        if (factionName) {
          const newFileName = toKebabCase(factionName) + '.json';
          const newFilePath = path.join(GRIMDARK_DIR, newFileName);

          fs.renameSync(filePath, newFilePath);
          console.log('Grimdark: ' + file + ' -> ' + newFileName);
          grimdarkRenamed++;
        } else {
          console.log('Grimdark ERROR: ' + file + ' - missing faction name/id');
          grimdarkErrors++;
        }
      } catch (err) {
        console.log('Grimdark ERROR: ' + file + ' - ' + err.message);
        grimdarkErrors++;
      }
    }
  } else {
    console.log('ERROR: Grimdark Future directory not found: ' + GRIMDARK_DIR);
  }

  // Process Age of Fantasy files
  if (fs.existsSync(AGEOFANTASY_DIR)) {
    const ageOfFantasyFiles = fs.readdirSync(AGEOFANTASY_DIR);
    console.log('Found Age of Fantasy directory with ' + ageOfFantasyFiles.length + ' files');
    console.log('');

    for (const file of ageOfFantasyFiles) {
      if (!file.endsWith('-tagged.json')) {
        console.log('Skipping non-tagged file: ' + file);
        continue;
      }

      const filePath = path.join(AGEOFANTASY_DIR, file);

      try {
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawContent);

        // Check for factionName or factionId at root level
        const factionName = data.factionName || data.factionId || data.name;

        if (factionName) {
          const newFileName = toKebabCase(factionName) + '.json';
          const newFilePath = path.join(AGEOFANTASY_DIR, newFileName);

          fs.renameSync(filePath, newFilePath);
          console.log('Age of Fantasy: ' + file + ' -> ' + newFileName);
          ageOfFantasyRenamed++;
        } else {
          console.log('Age of Fantasy ERROR: ' + file + ' - missing faction name/id');
          ageOfFantasyErrors++;
        }
      } catch (err) {
        console.log('Age of Fantasy ERROR: ' + file + ' - ' + err.message);
        ageOfFantasyErrors++;
      }
    }
  } else {
    console.log('ERROR: Age of Fantasy directory not found: ' + AGEOFANTASY_DIR);
  }

  console.log('');
  console.log('=== Summary ===');
  console.log('Grimdark Future: ' + grimdarkRenamed + ' renamed, ' + grimdarkErrors + ' errors');
  console.log('Age of Fantasy: ' + ageOfFantasyRenamed + ' renamed, ' + ageOfFantasyErrors + ' errors');
  console.log('Total: ' + (grimdarkRenamed + ageOfFantasyRenamed) + ' files renamed');
}

main();
