import React, { useState, useEffect } from 'react';
import { loadUpgrades, getUnitUpgrades } from '../helper/upgrades/load-upgrades';
import { getRecommendedUpgrades } from '../helper/upgrades/score-upgrade';

/**
 * Expandable loadout suggestions panel for a unit in the army list.
 */
export function LoadoutPanel({ unit, gameSystem, factionName, userScores }) {
  const [expanded, setExpanded] = useState(false);
  const [upgrades, setUpgrades] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const accentClass = gameSystem === 'grimdark-future' ? 'text-red-400' : 'text-emerald-400';
  const accentBg = gameSystem === 'grimdark-future' ? 'bg-red-900/30' : 'bg-emerald-900/30';
  const accentBorder = gameSystem === 'grimdark-future' ? 'border-red-800/30' : 'border-emerald-800/30';

  useEffect(() => {
    if (!expanded || upgrades) return;

    let cancelled = false;
    setLoading(true);

    loadUpgrades(gameSystem, factionName).then(data => {
      if (cancelled) return;
      if (data) {
        const packages = getUnitUpgrades(data, unit.id);
        const recommended = getRecommendedUpgrades(packages, unit.id, userScores);
        setUpgrades(recommended);
      } else {
        setUpgrades([]);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [expanded, unit.id, gameSystem, factionName, userScores, upgrades]);

  if (!unit.upgradeIds?.length) return null;

  const displayUpgrades = showAll ? upgrades : upgrades?.slice(0, 5);

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`text-xs ${accentClass} hover:underline flex items-center gap-1`}
      >
        <span className="text-[10px]">{expanded ? '\u25BC' : '\u25B6'}</span>
        {expanded ? 'Hide loadout suggestions' : 'Show loadout suggestions'}
      </button>

      {expanded && (
        <div className={`mt-2 rounded-lg border ${accentBorder} ${accentBg} p-3`}>
          {loading ? (
            <p className="text-xs text-zinc-400 animate-pulse">Loading upgrades...</p>
          ) : !upgrades?.length ? (
            <p className="text-xs text-zinc-500">No upgrades available for this unit.</p>
          ) : (
            <>
              <p className="text-xs text-zinc-400 mb-2">
                Recommended upgrades based on your personality:
              </p>
              <div className="space-y-1.5">
                {displayUpgrades.map((item, i) => (
                  <div
                    key={item.option.uid || i}
                    className={`flex items-center justify-between gap-2 py-1 px-2 rounded text-xs ${
                      i === 0 ? 'bg-zinc-700/50 border border-zinc-600' : 'bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-white truncate block">
                        {item.option.label}
                      </span>
                      <span className="text-zinc-500 text-[10px]">
                        {item.sectionLabel}
                        {item.packageHint && ` \u2022 ${item.packageHint}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-zinc-400">+{item.cost}pts</span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        item.score >= 70 ? 'bg-green-900/50 text-green-400' :
                        item.score >= 50 ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-zinc-700 text-zinc-400'
                      }`}>{item.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
              {upgrades.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className={`text-xs ${accentClass} hover:underline mt-2`}
                >
                  {showAll ? `Show top 5` : `Show all ${upgrades.length} options`}
                </button>
              )}
              {upgrades.length > 0 && (
                <p className="text-[10px] text-zinc-600 mt-2">
                  Total upgrade cost for top pick: +{upgrades[0].cost}pts
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
