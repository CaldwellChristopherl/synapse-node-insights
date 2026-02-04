import React, { useState, useEffect, useMemo } from 'react';
import { ARCHETYPES } from './data/personality/archetypes';
import { FACTION_DATA } from './data/factions';
import { QUESTIONS } from './data/questions';
import { TAG_TO_DIMENSION } from './data/personality/tag-to-dimension';
import { POINT_PRESETS } from './data/game/point-presets';
import { DIMENSION_INFO } from './data/personality/dimension-info';
import { getForceOrgLimits } from './helper/game/get-force-org-limits';
import { extractTags } from './helper/unit-score/extract-tags';
import { scoreUnit } from './helper/unit-score/score-unit';

const factionUnitFiles = import.meta.glob('./data/factions/units/*/*.json', { eager: false });

const calculateMatchScore = (userScores, factionScores) => {
  let totalScore = 0;
  let maxPossible = 0;
  Object.keys(userScores).forEach(dim => {
    const userVal = userScores[dim];
    const factionVal = factionScores[dim];
    const diff = Math.abs(userVal - factionVal);
    totalScore += 10 - diff;
    maxPossible += 10;
  });
  return Math.round((totalScore / maxPossible) * 100);
};



// Main Component
export default function SynapseNodeInsights() {
  const [gameSystem, setGameSystem] = useState('grimdark-future');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [factionData, setFactionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFactionPicker, setShowFactionPicker] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [armyPoints, setArmyPoints] = useState(1000);
  const [armyList, setArmyList] = useState([]);
  const [activeTab, setActiveTab] = useState('matches');
  const [savedResults, setSavedResults] = useState(null);
  const [showSavedResults, setShowSavedResults] = useState(false);
  const [savedResultsList, setSavedResultsList] = useState([]);

  // Load saved results on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('opr-quiz-results') || '[]');
    setSavedResultsList(saved);
  }, []);

  // View saved results
  const viewSavedResults = () => {
    const saved = JSON.parse(localStorage.getItem('opr-quiz-results') || '[]');
    setSavedResultsList(saved);
    setShowSavedResults(true);
  };

  // Load saved result
  const loadSavedResult = (result) => {
    setAnswers({});
    Object.entries(result.userScores || {}).forEach(([dim, score]) => {
      const questions = QUESTIONS.filter(q => q.dimension === dim);
      questions.forEach((q, idx) => {
        if (idx === 0) {
          setAnswers(prev => ({ ...prev, [q.id]: score }));
        }
      });
    });
    if (result.selectedFaction) {
      setSelectedFaction(result.selectedFaction);
    }
    if (result.armyList && result.armyList.length > 0) {
      setArmyList(result.armyList);
    }
    if (result.armyPoints) {
      setArmyPoints(result.armyPoints);
    }
    setShowResults(true);
    setShowSavedResults(false);
  };

  // Delete saved result
  const deleteSavedResult = (index) => {
    const saved = JSON.parse(localStorage.getItem('opr-quiz-results') || '[]');
    saved.splice(index, 1);
    localStorage.setItem('opr-quiz-results', JSON.stringify(saved));
    setSavedResultsList(saved);
  };

  // Calculate user dimension scores
  const userScores = useMemo(() => {
    const scores = {};
    QUESTIONS.forEach(q => {
      if (answers[q.id] !== undefined) {
        const weight = q.weight || 1;
        scores[q.dimension] = (scores[q.dimension] || 0) + (answers[q.id] * weight);
      }
    });
    Object.keys(scores).forEach(dim => {
      scores[dim] = Math.max(-5, Math.min(5, scores[dim] / 2));
    });
    return scores;
  }, [answers]);

  // Detect personality archetype
  const detectedArchetype = useMemo(() => {
    if (Object.keys(userScores).length === 0) return null;
    for (const arch of ARCHETYPES) {
      if (arch.conditions(userScores)) return arch;
    }
    return ARCHETYPES.find(a => a.id === 'balanced-commander');
  }, [userScores]);

  // Calculate faction matches
  const factionMatches = useMemo(() => {
    if (Object.keys(userScores).length === 0) return [];
    const factions = FACTION_DATA[gameSystem];
    return Object.entries(factions)
      .map(([name, data]) => ({
        name,
        ...data,
        matchScore: calculateMatchScore(userScores, data.dimensionScores)
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [userScores, gameSystem]);

  

  // Recommended units - computed from faction data
  const recommendedUnits = useMemo(() => {
    if (!factionData?.units) return [];
    return factionData.units
      .map(unit => ({
        ...unit,
        personalityScore: scoreUnit(unit, userScores),
        tags: extractTags(unit)
      }))
      .sort((a, b) => b.personalityScore - a.personalityScore);
  }, [factionData, userScores]);

  // Build army list with force organization rules
  useEffect(() => {
    if (!recommendedUnits.length) {
      setArmyList([]);
      return;
    }
    
    const limits = getForceOrgLimits(armyPoints,gameSystem);
    const list = [];
    let remaining = armyPoints;
    const unitCounts = {}; // Track copies of each unit
    let heroCount = 0;
    
    // Sort units: heroes first (by personality), then non-heroes (by personality)
    console.log(recommendedUnits)
    const heroes = recommendedUnits.filter(u => u.role === 'hero');
    const troops = recommendedUnits.filter(u => u.role !== 'hero');
    
    // Add heroes (up to limit)
    for (const hero of heroes) {
      if (heroCount >= limits.maxHeroes) break;
      if (hero.cost > limits.maxUnitCost) continue;
      if (hero.cost > remaining) continue;
      
      const copies = unitCounts[hero.id] || 0;
      if (copies >= limits.maxCopies) continue;
      
      list.push({ ...hero, quantity: 1 });
      unitCounts[hero.id] = copies + 1;
      remaining -= hero.cost;
      heroCount++;
    }
    
    // Fill with troops - allow multiples!
    let iterations = 0;
    const maxIterations = 50; // Prevent infinite loops
    
    while (remaining >= 50 && list.length < limits.maxUnits && iterations < maxIterations) {
      iterations++;
      let addedUnit = false;
      
      for (const unit of troops) {
        if (unit.cost > limits.maxUnitCost) continue;
        if (unit.cost > remaining) continue;
        if (list.length >= limits.maxUnits) break;
        
        const copies = unitCounts[unit.id] || 0;
        if (copies >= limits.maxCopies) continue;
        
        // Check if we already have this unit in the list
        const existingIdx = list.findIndex(u => u.id === unit.id);
        
        if (existingIdx >= 0) {
          // Increment quantity of existing unit
          list[existingIdx].quantity = (list[existingIdx].quantity || 1) + 1;
        } else {
          // Add new unit entry
          list.push({ ...unit, quantity: 1 });
        }
        
        unitCounts[unit.id] = copies + 1;
        remaining -= unit.cost;
        addedUnit = true;
        break; // Restart loop to re-evaluate best options
      }
      
      if (!addedUnit) break; // No more units can be added
    }
    
    // Consolidate list - group by unit and sum quantities
    const consolidated = [];
    const seen = new Set();
    for (const unit of list) {
      if (seen.has(unit.id)) continue;
      seen.add(unit.id);
      const totalQty = list.filter(u => u.id === unit.id).reduce((sum, u) => sum + (u.quantity || 1), 0);
      consolidated.push({ ...unit, quantity: totalQty });
    }
    
    setArmyList(consolidated);
  }, [recommendedUnits, armyPoints]);

  // Fetch faction data - generates units based on faction personality
  const handleSelectFaction = async (factionName) => {
    setSelectedFaction(factionName);
    setLoading(true);
    
    // Generate units based on faction personality
    const factionInfo = FACTION_DATA[gameSystem][factionName];
    const scores = factionInfo?.dimensionScores || {};
    const isElite = scores.elite > 2;
    const isHorde = scores.elite < -2;
    const isFast = scores.speed > 2;
    const isTech = scores.tech > 2;
    const isMagic = scores.mystery > 2;
    const isPure = scores.purity > 2;
    const isChaos = scores.order < -2;
    const isDefensive = scores.patience > 2;
    const isSubtle = scores.subtlety > 2;
    const factionUnitsKey = `./data/factions/units/${gameSystem}/${factionName.replace(/\s+/g, '-').toLowerCase()}.json`;
    console.log('Looking for key:', factionUnitsKey);
    console.log('Available keys:', Object.keys(factionUnitFiles).slice(0, 10));
    const factionUnitsModule = factionUnitFiles[factionUnitsKey];
    if (!factionUnitsModule) {
      console.error(`Unit file not found for: ${factionUnitsKey}`);
      setLoading(false);
      return;
    }
    const factionUnitsTagging = await factionUnitsModule();
    const units = factionUnitsTagging.units
    /* Example of hardcoded unit generation - replaced with JSON data import
        const units = [
      // HEROES
      { id: 'h1', name: `${factionName} Warlord`, cost: isElite ? 180 : 120, size: 1, quality: 3, defense: 3,
        rules: [{ name: 'Hero' }, { name: 'Tough', rating: 3 }], weapons: [{ range: 0, attacks: 4 }] },
      { id: 'h2', name: `${factionName} Captain`, cost: isElite ? 140 : 95, size: 1, quality: 3, defense: 4,
        rules: [{ name: 'Hero' }, { name: 'Tough', rating: 3 }], weapons: [{ range: 0, attacks: 3 }] },
      isMagic ? { id: 'h3', name: `${factionName} Sorcerer`, cost: 110, size: 1, quality: 4, defense: 5,
        rules: [{ name: 'Hero' }, { name: 'Caster' }], weapons: [{ range: 18, attacks: 2 }] } : null,
      isFast ? { id: 'h4', name: `${factionName} Swift Lord`, cost: 130, size: 1, quality: 3, defense: 4,
        rules: [{ name: 'Hero' }, { name: 'Fast' }, { name: 'Tough', rating: 3 }], weapons: [{ range: 0, attacks: 3 }] } : null,
      
      // CORE TROOPS (can take multiples)
      { id: 't1', name: `${factionName} Warriors`, cost: isHorde ? 65 : (isElite ? 140 : 100), 
        size: isHorde ? 20 : (isElite ? 5 : 10), quality: isElite ? 4 : 5, defense: isElite ? 4 : 5,
        rules: [], weapons: [{ range: 0, attacks: 1 }] },
      isTech ? { id: 't2', name: `${factionName} Gunners`, cost: 110, size: 10, quality: 4, defense: 5,
        rules: [{ name: 'Relentless' }], weapons: [{ range: 24, attacks: 1 }] } :
        { id: 't2', name: `${factionName} Berserkers`, cost: 100, size: 10, quality: 4, defense: 6,
          rules: [{ name: 'Fearless' }], weapons: [{ range: 0, attacks: 2 }] },
      isHorde ? { id: 't3', name: `${factionName} Mob`, cost: 45, size: 20, quality: 6, defense: 6,
        rules: [], weapons: [{ range: 0, attacks: 1 }] } : null,
      isSubtle ? { id: 't4', name: `${factionName} Scouts`, cost: 80, size: 5, quality: 4, defense: 5,
        rules: [{ name: 'Scout' }, { name: 'Stealth' }], weapons: [{ range: 18, attacks: 1 }] } : null,
        
      // ELITE UNITS
      { id: 'e1', name: `${factionName} Veterans`, cost: isElite ? 185 : 145, size: 5, quality: 3, defense: 3,
        rules: [{ name: 'Tough', rating: 3 }], weapons: [{ range: 0, attacks: 2 }] },
      isFast ? { id: 'e2', name: `${factionName} Cavalry`, cost: 160, size: 5, quality: 3, defense: 4,
        rules: [{ name: 'Fast' }, { name: 'Impact', rating: 1 }], weapons: [{ range: 0, attacks: 2 }] } : null,
      isPure ? { id: 'e3', name: `${factionName} Purifiers`, cost: 150, size: 5, quality: 3, defense: 4,
        rules: [{ name: 'Fearless' }], weapons: [{ range: 12, attacks: 2 }] } : null,
      isChaos ? { id: 'e4', name: `${factionName} Mutants`, cost: 125, size: 5, quality: 4, defense: 4,
        rules: [{ name: 'Regeneration' }], weapons: [{ range: 0, attacks: 3 }] } : null,
      isMagic ? { id: 'e5', name: `${factionName} Acolytes`, cost: 130, size: 5, quality: 4, defense: 5,
        rules: [{ name: 'Caster' }], weapons: [{ range: 12, attacks: 1 }] } : null,
        
      // HEAVY SUPPORT
      { id: 'v1', name: `${factionName} Monster`, cost: 180, size: 1, quality: 4, defense: 3,
        rules: [{ name: 'Tough', rating: 6 }, { name: 'Fear' }], weapons: [{ range: 0, attacks: 4 }] },
      isTech ? { id: 'v2', name: `${factionName} Artillery`, cost: 135, size: 1, quality: 4, defense: 4,
        rules: [{ name: 'Relentless' }], weapons: [{ range: 36, attacks: 2 }] } : null,
      isDefensive ? { id: 'v3', name: `${factionName} Ironclad`, cost: 200, size: 3, quality: 4, defense: 2,
        rules: [{ name: 'Tough', rating: 6 }], weapons: [{ range: 0, attacks: 2 }] } : null,
      { id: 'v4', name: `${factionName} Elite Guard`, cost: 220, size: 3, quality: 3, defense: 2,
        rules: [{ name: 'Tough', rating: 3 }], weapons: [{ range: 0, attacks: 3 }] },
      isTech ? { id: 'v5', name: `${factionName} Walker`, cost: 250, size: 1, quality: 4, defense: 2,
        rules: [{ name: 'Tough', rating: 6 }], weapons: [{ range: 24, attacks: 4 }] } : null,
    ].filter(Boolean);*/
    
    // Small delay to show loading state
    setTimeout(() => {
      setFactionData({ name: factionName, units });
      setLoading(false);
    }, 300);
  };

  const handleAnswer = (value) => {
    setFadeIn(false);
    setTimeout(() => {
      setAnswers({ ...answers, [QUESTIONS[currentQuestion].id]: value });
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResults(true);
      }
      setFadeIn(true);
    }, 200);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setSelectedFaction(null);
    setFactionData(null);
    setShowFactionPicker(false);
    setArmyList([]);
    setActiveTab('matches');
  };

  const switchGameSystem = (system) => {
    setGameSystem(system);
    setSelectedFaction(null);
    setFactionData(null);
    setShowFactionPicker(false);
    setArmyList([]);
  };

  // Save results
  const saveResults = () => {
    console.log('Save button clicked');
    console.log('userScores:', userScores);
    console.log('detectedArchetype:', detectedArchetype);
    console.log('factionMatches:', factionMatches);
    
    if (Object.keys(userScores).length === 0) {
      alert('No quiz data to save!');
      return;
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      gameSystem,
      userScores,
      archetype: detectedArchetype,
      topFactions: factionMatches.slice(0, 5),
      selectedFaction,
      armyList: armyList.map(u => ({ name: u.name, cost: u.cost, quantity: u.quantity })),
      armyPoints
    };
    
    try {
      setSavedResults(results);
      const saved = JSON.parse(localStorage.getItem('opr-quiz-results') || '[]');
      saved.unshift(results);
      localStorage.setItem('opr-quiz-results', JSON.stringify(saved.slice(0, 10)));
      setSavedResultsList(saved);
      alert('Results saved!');
    } catch (error) {
      console.error('Error saving results:', error);
      alert('Failed to save results. Please check browser console.');
    }
  };

  // Export for AI analysis
  const exportForAI = () => {
    const totalPoints = armyList.reduce((sum, u) => sum + (u.cost * u.quantity), 0);
    const exportData = {
      title: "Synapse Node Insights Quiz Results",
      exportDate: new Date().toISOString(),
      gameSystem: gameSystem === 'grimdark-future' ? 'Grimdark Future' : 'Age of Fantasy',
      personalityProfile: {
        archetype: detectedArchetype ? {
          name: detectedArchetype.name,
          description: detectedArchetype.description,
          playstyle: detectedArchetype.playstyle
        } : null,
        dimensionScores: Object.entries(userScores).map(([dim, score]) => ({
          dimension: DIMENSION_INFO[dim].name,
          score: Math.round(score * 10) / 10,
          interpretation: score > 2 ? DIMENSION_INFO[dim].high : score < -2 ? DIMENSION_INFO[dim].low : 'Balanced'
        }))
      },
      factionRecommendations: factionMatches.slice(0, 10).map(f => ({
        faction: f.name,
        matchPercentage: f.matchScore,
        description: f.description,
        themes: f.themes
      })),
      selectedArmy: selectedFaction ? {
        faction: selectedFaction,
        pointLimit: armyPoints,
        forceOrgLimits: (() => {
          const {maxHeroes, maxCopies, maxUnits} = getForceOrgLimits(armyPoints,gameSystem);
          return `${armyPoints}pts: ${maxHeroes} heroes, ${maxCopies} copies max, ${maxUnits} units`
        })(),
        units: armyList.map(u => ({
          name: u.name,
          quantity: u.quantity,
          costEach: u.cost,
          totalCost: u.cost * u.quantity,
          modelCount: u.size * u.quantity,
          personalityFit: u.personalityScore,
          rules: u.rules?.map(r => r.name + (r.rating ? `(${r.rating})` : '')),
          tags: u.tags?.slice(0, 5)
        })),
        totalPoints,
        totalUnits: armyList.reduce((sum, u) => sum + u.quantity, 0),
        totalModels: armyList.reduce((sum, u) => sum + (u.size * u.quantity), 0)
      } : null,
      analysisPrompt: `Please analyze this Synapse Node Insights Quiz result. The user's personality archetype is "${detectedArchetype?.name}" with a playstyle of "${detectedArchetype?.playstyle}". Their top faction match is ${factionMatches[0]?.name} at ${factionMatches[0]?.matchScore}% compatibility. Their ${armyPoints}pt army has ${armyList.reduce((s,u) => s + u.quantity, 0)} units totaling ${totalPoints} points. Please provide: 1) An analysis of their tactical personality, 2) Suggestions for how to build armies that match their playstyle, 3) Tips for playing to their strengths, 4) Potential weaknesses to be aware of, and 5) Specific tactics that would work well with this army composition.`
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opr-quiz-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render game system toggle
  const GameSystemToggle = () => (
    <div className="flex justify-center gap-2 mb-8">
      <button
        onClick={() => switchGameSystem('grimdark-future')}
        className={`px-6 py-3 rounded-lg font-bold text-sm tracking-wider transition-all duration-300 ${
          gameSystem === 'grimdark-future'
            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-900/50'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        }`}
      >
        GRIMDARK FUTURE
      </button>
      <button
        onClick={() => switchGameSystem('age-of-fantasy')}
        className={`px-6 py-3 rounded-lg font-bold text-sm tracking-wider transition-all duration-300 ${
          gameSystem === 'age-of-fantasy'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/50'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        }`}
      >
        AGE OF FANTASY
      </button>
    </div>
  );

  // Dimension bar component
  const DimensionBar = ({ dimension, score }) => {
    const info = DIMENSION_INFO[dimension];
    const percentage = ((score + 5) / 10) * 100;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-zinc-500">{info.low}</span>
          <span className="text-zinc-400 font-medium">{info.name}</span>
          <span className="text-zinc-500">{info.high}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: info.color
            }}
          />
        </div>
        <div className="text-right text-xs text-zinc-600 mt-0.5">
          {score > 0 ? '+' : ''}{score.toFixed(1)}
        </div>
      </div>
    );
  };

  // Question card
  const QuestionCard = () => (
    <div className={`transition-opacity duration-200 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-zinc-500 text-sm font-mono">
            QUESTION {currentQuestion + 1} OF {QUESTIONS.length}
          </span>
          <span className="text-zinc-600 text-xs uppercase tracking-widest">
            {DIMENSION_INFO[QUESTIONS[currentQuestion].dimension]?.name}
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1 mb-6">
          <div 
            className={`h-1 rounded-full transition-all duration-500 ${
              gameSystem === 'grimdark-future' 
                ? 'bg-gradient-to-r from-red-600 to-orange-500' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-500'
            }`}
            style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
          {QUESTIONS[currentQuestion].text}
        </h2>
      </div>
      <div className="space-y-3">
        {QUESTIONS[currentQuestion].options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option.value)}
            className="w-full text-left p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700/50 transition-all duration-200 group"
          >
            <span className="text-zinc-300 group-hover:text-white transition-colors">
              {option.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // Results view
  const ResultsView = () => (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {['matches', 'personality', 'army'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab 
                ? gameSystem === 'grimdark-future'
                  ? 'text-red-400 border-b-2 border-red-400'
                  : 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab === 'matches' && 'Faction Matches'}
            {tab === 'personality' && 'Your Profile'}
            {tab === 'army' && 'Army Builder'}
          </button>
        ))}
      </div>

      {/* Archetype Display */}
      {detectedArchetype && activeTab !== 'army' && (
        <div className={`p-4 rounded-xl border ${
          gameSystem === 'grimdark-future' 
            ? 'bg-red-900/20 border-red-800' 
            : 'bg-emerald-900/20 border-emerald-800'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{detectedArchetype.icon}</span>
            <div>
              <h3 className="font-bold text-white">{detectedArchetype.name}</h3>
              <p className="text-xs text-zinc-400">{detectedArchetype.playstyle}</p>
            </div>
          </div>
          <p className="text-sm text-zinc-300 italic">"{detectedArchetype.description}"</p>
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Your Top Faction Matches</h3>
          {factionMatches.slice(0, 5).map((faction, idx) => (
            <button
              key={faction.name}
              onClick={() => handleSelectFaction(faction.name)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                selectedFaction === faction.name
                  ? gameSystem === 'grimdark-future'
                    ? 'bg-red-900/30 border-red-500'
                    : 'bg-emerald-900/30 border-emerald-500'
                  : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${
                    idx === 0 
                      ? gameSystem === 'grimdark-future' ? 'text-red-400' : 'text-emerald-400'
                      : 'text-zinc-500'
                  }`}>#{idx + 1}</span>
                  <h4 className="font-bold text-white">{faction.name}</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  faction.matchScore >= 80 ? 'bg-green-900/50 text-green-400' :
                  faction.matchScore >= 60 ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-zinc-700 text-zinc-400'
                }`}>{faction.matchScore}%</span>
              </div>
              <p className="text-zinc-400 text-sm italic mb-2">"{faction.description}"</p>
              <div className="flex flex-wrap gap-1">
                {faction.themes.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-zinc-700/50 rounded text-xs text-zinc-500">{t}</span>
                ))}
              </div>
            </button>
          ))}
          <button
            onClick={() => setShowFactionPicker(true)}
            className="w-full text-center text-zinc-500 hover:text-zinc-300 py-2 underline"
          >
            Browse all {Object.keys(FACTION_DATA[gameSystem]).length} factions →
          </button>
        </div>
      )}

      {/* Personality Tab */}
      {activeTab === 'personality' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Your Personality Profile</h3>
          <div className="grid gap-1">
            {Object.entries(userScores).map(([dim, score]) => (
              <DimensionBar key={dim} dimension={dim} score={score} />
            ))}
          </div>
        </div>
      )}

      {/* Army Tab */}
      {activeTab === 'army' && (
        <div className="space-y-6">
          {/* Points Selector */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Army Points</label>
            <div className="flex gap-2 flex-wrap">
              {POINT_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setArmyPoints(p.value)}
                  className={`px-3 py-1.5 rounded text-sm transition-all ${
                    armyPoints === p.value
                      ? gameSystem === 'grimdark-future'
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {p.label} ({p.value})
                </button>
              ))}
            </div>
          </div>

          {/* Faction Selection */}
          {!selectedFaction ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 mb-4">Select a faction to build an army</p>
              <button
                onClick={() => setActiveTab('matches')}
                className={`px-4 py-2 rounded-lg ${
                  gameSystem === 'grimdark-future'
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                } text-white transition-colors`}
              >
                View Faction Matches →
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className={`w-12 h-12 border-4 rounded-full animate-spin mb-4 ${
                gameSystem === 'grimdark-future' ? 'border-red-600 border-t-transparent' : 'border-emerald-600 border-t-transparent'
              }`} />
              <p className="text-zinc-500">Generating army list...</p>
            </div>
          ) : (
            <>
              {/* Force Org Info */}
              {(() => {
                const limits = getForceOrgLimits(armyPoints,  gameSystem) 
                const heroCount = armyList.filter(u => u.role === 'hero').reduce((s, u) => s + u.quantity, 0);
                const unitCount = armyList.reduce((s, u) => s + u.quantity, 0);
                return (
                  <div className="flex gap-4 text-xs text-zinc-500 bg-zinc-800/30 rounded-lg p-2">
                    <span>Heroes: <span className={heroCount > limits.maxHeroes ? 'text-red-400' : 'text-zinc-300'}>{heroCount}/{limits.maxHeroes}</span></span>
                    <span>Units: <span className={unitCount > limits.maxUnits ? 'text-red-400' : 'text-zinc-300'}>{unitCount}/{limits.maxUnits}</span></span>
                    <span>Max copies: {limits.maxCopies}</span>
                  </div>
                );
              })()}
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedFaction}</h3>
                  <p className="text-xs text-zinc-500">Units matched to your personality</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    gameSystem === 'grimdark-future' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {armyList.reduce((s, u) => s + (u.cost * u.quantity), 0)}
                  </span>
                  <span className="text-zinc-500"> / {armyPoints} pts</span>
                </div>
              </div>
              
              {armyList.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <p>No units available. Try selecting a different faction.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {armyList.map((unit, idx) => (
                    <div key={unit.id || idx} className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {unit.quantity > 1 && (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              gameSystem === 'grimdark-future' ? 'bg-red-900/50 text-red-300' : 'bg-emerald-900/50 text-emerald-300'
                            }`}>×{unit.quantity}</span>
                          )}
                          <div>
                            <span className="font-medium text-white">{unit.name}</span>
                            <span className="text-xs text-zinc-500 ml-2">
                              ({unit.size} model{unit.size > 1 ? 's' : ''} each)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500">
                            {unit.quantity > 1 ? `${unit.cost}×${unit.quantity} = ${unit.cost * unit.quantity}` : unit.cost} pts
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            unit.personalityScore >= 70 ? 'bg-green-900/50 text-green-400' :
                            unit.personalityScore >= 50 ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-zinc-700 text-zinc-400'
                          }`}>{unit.personalityScore}%</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {unit.rules?.filter(r => r.name !== 'hero').slice(0, 3).map((r, i) => (
                          <span key={i} className={`px-1.5 py-0.5 rounded text-xs ${
                            gameSystem === 'grimdark-future' ? 'bg-red-900/30 text-red-400' : 'bg-emerald-900/30 text-emerald-400'
                          }`}>{r.name}{r.rating ? `(${r.rating})` : ''}</span>
                        ))}
                        {unit.tags?.slice(0, 3).map((t, i) => (
                          <span key={`t${i}`} className="px-1.5 py-0.5 bg-zinc-700/50 rounded text-xs text-zinc-500">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-zinc-600 text-center pt-2 space-y-1">
                <p>Army auto-built using Force Organization rules</p>
                <p className="text-zinc-700">Max {getForceOrgLimits(armyPoints, gameSystem).maxCopies} copies per unit • Units sorted by personality fit</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800">
        <button
          onClick={saveResults}
          className="px-4 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-colors text-sm"
        >
          💾 Save Results
        </button>
        <button
          onClick={viewSavedResults}
          className="px-4 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-colors text-sm"
        >
          📋 View Saved
        </button>
        <button
          onClick={exportForAI}
          className="px-4 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-colors text-sm"
        >
          📤 Export for AI
        </button>
        <button
          onClick={resetQuiz}
          className={`px-4 py-2 rounded-lg text-white transition-colors text-sm ${
            gameSystem === 'grimdark-future'
              ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
          }`}
        >
          🔄 Retake Quiz
        </button>
      </div>
    </div>
  );

  // Faction Picker Modal
  const FactionPicker = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowFactionPicker(false)}>
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-zinc-700" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-white">All Factions</h3>
          <button onClick={() => setShowFactionPicker(false)} className="text-zinc-500 hover:text-white text-xl">×</button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(FACTION_DATA[gameSystem]).map((faction) => {
              console.log(faction)
              const [name] = faction
              const match = factionMatches.find(f => f.name === name);
              return (
                <button
                  key={name}
                  onClick={() => { handleSelectFaction(name); setShowFactionPicker(false); setActiveTab('army'); }}
                  className="text-left p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-500 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-white text-sm">{name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      match?.matchScore >= 70 ? 'bg-green-900/50 text-green-400' : 'text-zinc-500'
                    }`}>{match?.matchScore || 0}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-1 tracking-tight">
            <span className="text-white">Synapse Node</span>{' '}
            <span className={gameSystem === 'grimdark-future' ? 'text-red-500' : 'text-emerald-500'}>Insights</span>
          </h1>
          <p className="text-zinc-500 text-sm">Find your perfect army • v3.0</p>
        </div>

        <GameSystemToggle />

        {savedResultsList.length > 0 && !showResults && (
          <button
            onClick={viewSavedResults}
            className="mb-4 w-full text-center text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            📋 View Saved Results ({savedResultsList.length})
          </button>
        )}

        <div className="bg-zinc-900/50 backdrop-blur rounded-2xl p-6 border border-zinc-800">
          {!showResults ? <QuestionCard /> : <ResultsView />}
        </div>

        <div className="text-center mt-6 text-zinc-600 text-xs">
          <p>Data from Army Forge API</p>
        </div>
      </div>

      {showFactionPicker && <FactionPicker />}
      
      {showSavedResults && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowSavedResults(false)}>
          <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-zinc-700" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Saved Results ({savedResultsList.length})</h3>
              <button onClick={() => setShowSavedResults(false)} className="text-zinc-500 hover:text-white text-xl">×</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {savedResultsList.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <p>No saved results yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedResultsList.map((result, index) => (
                    <div key={index} className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="text-sm text-zinc-500">
                            {new Date(result.timestamp).toLocaleDateString()}
                          </div>
                          <div className="font-bold text-white">
                            {result.gameSystem === 'grimdark-future' ? 'Grimdark Future' : 'Age of Fantasy'}
                          </div>
                          {result.archetype && (
                            <div className="text-sm text-zinc-400">{result.archetype.name}</div>
                          )}
                          {result.selectedFaction && (
                            <div className="text-sm text-zinc-400">Faction: {result.selectedFaction}</div>
                          )}
                          {result.armyList && result.armyList.length > 0 && (
                            <div className="text-sm text-zinc-400">{result.armyList.length} units ({result.armyPoints} pts)</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadSavedResult(result)}
                            className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-sm"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteSavedResult(index)}
                            className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-white text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}