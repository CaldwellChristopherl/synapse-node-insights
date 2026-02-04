#!/usr/bin/env tsx
/**
 * Standalone script to generate faction probability reports
 * Run with: npm run report:probabilities
 */

import { calculateFactionMatches } from '../src/lib/factionMatching';
import { FACTIONS, DIMENSIONS } from '../src/data';
import { DimensionScores } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

const NUM_SIMULATIONS = 10000;

function generateRandomScores(): DimensionScores {
  const scores: Partial<DimensionScores> = {};
  DIMENSIONS.forEach(dim => {
    scores[dim] = Math.random() * 10 - 5;
  });
  return scores as DimensionScores;
}

function runSimulations() {
  const topMatchCounts: Record<string, number> = {};
  const top3Counts: Record<string, number> = {};
  const top5Counts: Record<string, number> = {};

  FACTIONS.forEach(faction => {
    topMatchCounts[faction.name] = 0;
    top3Counts[faction.name] = 0;
    top5Counts[faction.name] = 0;
  });

  for (let i = 0; i < NUM_SIMULATIONS; i++) {
    const randomScores = generateRandomScores();
    const matches = calculateFactionMatches(randomScores);

    topMatchCounts[matches[0].name]++;
    matches.slice(0, 3).forEach(match => top3Counts[match.name]++);
    matches.slice(0, 5).forEach(match => top5Counts[match.name]++);
  }

  return { topMatchCounts, top3Counts, top5Counts };
}

function generateMarkdownReport(data: ReturnType<typeof runSimulations>) {
  const results = FACTIONS.map(faction => ({
    name: faction.name,
    topMatchPct: (data.topMatchCounts[faction.name] / NUM_SIMULATIONS * 100).toFixed(2),
    top3Pct: (data.top3Counts[faction.name] / NUM_SIMULATIONS * 100).toFixed(2),
    top5Pct: (data.top5Counts[faction.name] / NUM_SIMULATIONS * 100).toFixed(2)
  })).sort((a, b) => parseFloat(b.topMatchPct) - parseFloat(a.topMatchPct));

  let md = '# Faction Selection Probabilities\n\n';
  md += `*Generated from ${NUM_SIMULATIONS.toLocaleString()} random personality combinations*\n\n`;
  md += '## Probability Table\n\n';
  md += '| Rank | Faction | Top Match % | Top 3 % | Top 5 % |\n';
  md += '|------|---------|-------------|---------|----------|\n';

  results.forEach((r, i) => {
    md += `| ${i + 1} | ${r.name} | ${r.topMatchPct}% | ${r.top3Pct}% | ${r.top5Pct}% |\n`;
  });

  return md;
}

function generateJSONReport(data: ReturnType<typeof runSimulations>) {
  const results = FACTIONS.map(faction => ({
    name: faction.name,
    topMatchCount: data.topMatchCounts[faction.name],
    topMatchPercentage: parseFloat((data.topMatchCounts[faction.name] / NUM_SIMULATIONS * 100).toFixed(2)),
    top3Count: data.top3Counts[faction.name],
    top3Percentage: parseFloat((data.top3Counts[faction.name] / NUM_SIMULATIONS * 100).toFixed(2)),
    top5Count: data.top5Counts[faction.name],
    top5Percentage: parseFloat((data.top5Counts[faction.name] / NUM_SIMULATIONS * 100).toFixed(2))
  })).sort((a, b) => b.topMatchCount - a.topMatchCount);

  return {
    metadata: {
      simulations: NUM_SIMULATIONS,
      totalFactions: 26,
      generatedAt: new Date().toISOString()
    },
    results
  };
}

// Main execution
console.log(`Running ${NUM_SIMULATIONS.toLocaleString()} simulations...`);
const data = runSimulations();

const md = generateMarkdownReport(data);
const json = generateJSONReport(data);

// Save reports
const outputDir = path.join(__dirname, '../reports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'faction-probabilities.md'), md);
fs.writeFileSync(path.join(outputDir, 'faction-probabilities.json'), JSON.stringify(json, null, 2));

console.log('✓ Reports generated:');
console.log('  - reports/faction-probabilities.md');
console.log('  - reports/faction-probabilities.json');
