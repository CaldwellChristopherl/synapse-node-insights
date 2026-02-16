const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/untagged-army-books');
const GRIMDARK_DIR = path.join(DATA_DIR, 'grimdark-future');
const AGEOFANTASY_DIR = path.join(DATA_DIR, 'age-of-fantasy');

const GRIMDARK_API = 'https://army-forge.onepagerules.com/api/army-books?filters=official&gameSystemSlug=grimdark-future&searchText=&page=1&unitCount=0&balanceValid=false&customRules=true&fans=false&sortBy=null';
const AGEOFANTASY_API = 'https://army-forge.onepagerules.com/api/army-books?filters=official&gameSystemSlug=age-of-fantasy&searchText=&page=1&unitCount=0&balanceValid=false&customRules=true&fans=false&sortBy=null';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndSave(url, filePath, factionName) {
  try {
    console.log(url)
    console.log(`Fetching ${factionName}...`);
    const response = await globalThis.fetch(url, {
      headers: {
        'User-Agent': 'OPR Army Quiz Script'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${factionName}: HTTP ${response.status}`);
      return false;
    }

    const data = await response.json();
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error fetching ${factionName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== OPR Army Books Fetcher ===');
  console.log('');

  if (!fs.existsSync(GRIMDARK_DIR)) {
    fs.mkdirSync(GRIMDARK_DIR, { recursive: true });
    console.log(`Created directory: ${GRIMDARK_DIR}`);
  }

  if (!fs.existsSync(AGEOFANTASY_DIR)) {
    fs.mkdirSync(AGEOFANTASY_DIR, { recursive: true });
    console.log(`Created directory: ${AGEOFANTASY_DIR}`);
  }

  let grimdarkSuccess = 0;
  let grimdarkFailed = 0;
  let ageOfFantasySuccess = 0;
  let ageOfFantasyFailed = 0;

  console.log('Fetching Grimdark Future factions...');
  console.log('========================================');

  try {
    const grimdarkResponse = await globalThis.fetch(GRIMDARK_API);
    if (!grimdarkResponse.ok) {
      console.error(`Failed to fetch Grimdark Future list: HTTP ${grimdarkResponse.status}`);
    } else {
      const grimdarkData = await grimdarkResponse.json();
      console.log(`Fetched ${grimdarkData.length} factions`);

      for (const faction of grimdarkData) {      

  
        const fileName = faction.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const filePath = path.join(GRIMDARK_DIR, fileName + '.json');
        const bookId = faction.uid;
        console.log(bookId)
        const url = `https://army-forge.onepagerules.com/api/army-books/${bookId}?gameSystem=2&simpleMode=false`;
        const success = await fetchAndSave(
          url,
          filePath,
          faction.name
        );
        if (success) {
          grimdarkSuccess++;
        } else {
          grimdarkFailed++;
        }
        await sleep(500);
      }
    }
  } catch (error) {
    console.error('Error fetching Grimdark Future:', error.message);
  }

  await sleep(1000);

  console.log('Fetching Age of Fantasy factions...');
  console.log('========================================');

  try {
    const ageOfFantasyResponse = await globalThis.fetch(AGEOFANTASY_API);
    if (!ageOfFantasyResponse.ok) {
      console.error(`Failed to fetch Age of Fantasy list: HTTP ${ageOfFantasyResponse.status}`);
    } else {
      const ageOfFantasyData = await ageOfFantasyResponse.json();
      console.log(`Fetched ${ageOfFantasyData.length} factions`);

      for (const faction of ageOfFantasyData) {
        const fileName = faction.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const filePath = path.join(AGEOFANTASY_DIR, fileName + '.json');
        const bookId = faction.uid;
        const url = `https://army-forge.onepagerules.com/api/army-books/${bookId}?gameSystem=4&simpleMode=false`;
        const success = await fetchAndSave(
          url,
          filePath,
          faction.name
        );
        if (success) {
          ageOfFantasySuccess++;
        } else {
          ageOfFantasyFailed++;
        }
        await sleep(500);
      }
    }
  } catch (error) {
    console.error('Error fetching Age of Fantasy:', error.message);
  }

  console.log('=== Summary ===');
  console.log(`Grimdark Future: ${grimdarkSuccess} succeeded, ${grimdarkFailed} failed`);
  console.log(`Age of Fantasy: ${ageOfFantasySuccess} succeeded, ${ageOfFantasyFailed} failed`);
  console.log(`Total: ${grimdarkSuccess + ageOfFantasySuccess} of ${grimdarkSuccess + grimdarkFailed + ageOfFantasySuccess + ageOfFantasyFailed} files saved`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
