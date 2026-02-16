#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const unitsBasePath = path.join(__dirname, 'src/data/factions/units');
const booksBasePath = path.join(__dirname, 'src/data/untagged-army-books');

// Game systems to process
const gameSystems = ['age-of-fantasy', 'grimdark-future'];

function addBackgroundProperties() {
  let totalProcessed = 0;
  let totalUpdated = 0;
  let errors = [];

  gameSystems.forEach(gameSystem => {
    console.log(`\nProcessing ${gameSystem}...`);

    const unitsDir = path.join(unitsBasePath, gameSystem);
    const booksDir = path.join(booksBasePath, gameSystem);

    // Check if directories exist
    if (!fs.existsSync(unitsDir)) {
      console.log(`  ⚠️  Units directory not found: ${unitsDir}`);
      return;
    }
    if (!fs.existsSync(booksDir)) {
      console.log(`  ⚠️  Books directory not found: ${booksDir}`);
      return;
    }

    // Get all JSON files in units directory
    const unitFiles = fs.readdirSync(unitsDir)
      .filter(file => file.endsWith('.json'));

    console.log(`  Found ${unitFiles.length} unit files`);

    unitFiles.forEach(fileName => {
      totalProcessed++;

      const unitFilePath = path.join(unitsDir, fileName);
      const bookFilePath = path.join(booksDir, fileName);

      // Check if corresponding book file exists
      if (!fs.existsSync(bookFilePath)) {
        errors.push(`No matching book file for: ${fileName}`);
        console.log(`  ⚠️  Skipping ${fileName} - no matching book file`);
        return;
      }

      try {
        // Read both files
        const unitData = JSON.parse(fs.readFileSync(unitFilePath, 'utf8'));
        const bookData = JSON.parse(fs.readFileSync(bookFilePath, 'utf8'));

        // Check if background properties exist in book
        if (!bookData.background && !bookData.backgroundFull) {
          console.log(`  ⚠️  ${fileName} - no background properties in book file`);
          return;
        }

        // Check if already has background properties
        if (unitData.background || unitData.backgroundFull) {
          console.log(`  ⏭️  ${fileName} - already has background properties`);
          return;
        }

        // Add background properties to unit data
        if (bookData.background) {
          unitData.background = bookData.background;
        }
        if (bookData.backgroundFull) {
          unitData.backgroundFull = bookData.backgroundFull;
        }

        // Write updated unit file
        fs.writeFileSync(
          unitFilePath,
          JSON.stringify(unitData, null, 2) + '\n',
          'utf8'
        );

        totalUpdated++;
        console.log(`  ✅ ${fileName} - added background properties`);

      } catch (error) {
        errors.push(`Error processing ${fileName}: ${error.message}`);
        console.log(`  ❌ ${fileName} - error: ${error.message}`);
      }
    });
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Total files processed: ${totalProcessed}`);
  console.log(`  Files updated: ${totalUpdated}`);
  console.log(`  Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors encountered:');
    errors.forEach(error => console.log(`  - ${error}`));
  }

  console.log('='.repeat(60));
}

// Run the script
console.log('Starting background properties migration...');
console.log(`Units path: ${unitsBasePath}`);
console.log(`Books path: ${booksBasePath}`);

addBackgroundProperties();
