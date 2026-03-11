import { useMemo, useState, useEffect } from "react";
import "./index.css";
import { badges } from "./data/badges";
import { regions } from "./data/regions";
import { pokemonList as staticPokemonList } from "./data/pokemonList";
import type { PartySlot, RegionKey, RegionProgress, PokemonOption } from "./types";

const STORAGE_KEY = "pokemon-badge-tracker";
const EMPTY_PARTY: PartySlot[] = [null, null, null, null, null, null];


const createEmptyRegionProgress = (): RegionProgress => ({
  earnedBadgeIds: [],
  party: [...EMPTY_PARTY],
});

const ALL_REGIONS: RegionKey[] = [
  'kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'
];

const DEFAULT_PROGRESS_BY_REGION: Record<RegionKey, RegionProgress> = ALL_REGIONS.reduce((acc, region) => {
  acc[region] = createEmptyRegionProgress();
  return acc;
}, {} as Record<RegionKey, RegionProgress>);

function App() {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return "kanto";

      const parsed = JSON.parse(saved);
      return parsed.selectedRegion ?? "kanto";
    } catch {
      return "kanto";
    }
  });

  const [progressByRegion, setProgressByRegion] = useState<
    Record<RegionKey, RegionProgress>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_PROGRESS_BY_REGION;
      const parsed = JSON.parse(saved);
      // Ensure all regions are present
      const result: Record<RegionKey, RegionProgress> = { ...DEFAULT_PROGRESS_BY_REGION };
      for (const region of ALL_REGIONS) {
        result[region] = {
          earnedBadgeIds: Array.isArray(parsed.progressByRegion?.[region]?.earnedBadgeIds)
            ? parsed.progressByRegion[region].earnedBadgeIds
            : [],
          party:
            Array.isArray(parsed.progressByRegion?.[region]?.party) &&
              parsed.progressByRegion[region].party.length === 6
              ? parsed.progressByRegion[region].party
              : [...EMPTY_PARTY],
        };
      }
      return result;
    } catch {
      return DEFAULT_PROGRESS_BY_REGION;
    }
  });

  const [editMode, setEditMode] = useState(false);

  const [pokemonList] = useState<PokemonOption[]>(staticPokemonList);
  const [loadingPokemon] = useState(false);

  const earnedBadgeIds = progressByRegion[selectedRegion].earnedBadgeIds;
  const party = progressByRegion[selectedRegion].party;

  const resetBadges = () => {
    setProgressByRegion((prev) => ({
      ...prev,
      [selectedRegion]: {
        ...prev[selectedRegion],
        earnedBadgeIds: [],
      },
    }));
  };

  const resetParty = () => {
    setProgressByRegion((prev) => ({
      ...prev,
      [selectedRegion]: {
        ...prev[selectedRegion],
        party: [...EMPTY_PARTY],
      },
    }));
  };

  const resetAll = () => {
    setSelectedRegion("kanto");
    const reset: Record<RegionKey, RegionProgress> = { ...DEFAULT_PROGRESS_BY_REGION };
    setProgressByRegion(reset);
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    const dataToSave = {
      selectedRegion,
      progressByRegion,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [selectedRegion, progressByRegion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "e") {
        setEditMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => badge.region === selectedRegion);
  }, [selectedRegion]);

  const toggleBadge = (badgeId: string) => {
    setProgressByRegion((prev) => {
      const currentRegionProgress = prev[selectedRegion];
      const alreadyEarned = currentRegionProgress.earnedBadgeIds.includes(
        badgeId
      );

      return {
        ...prev,
        [selectedRegion]: {
          ...currentRegionProgress,
          earnedBadgeIds: alreadyEarned
            ? currentRegionProgress.earnedBadgeIds.filter((id) => id !== badgeId)
            : [...currentRegionProgress.earnedBadgeIds, badgeId],
        },
      };
    });
  };

  const filteredPokemon = useMemo(() => {
    // For now, just return all fetched Pokémon (Kanto)
    return pokemonList
      .filter((p) => p.region === selectedRegion)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [pokemonList, selectedRegion]);

  const updatePartySlot = (slotIndex: number, pokemonId: string) => {
    const selectedPokemon =
      pokemonList.find((pokemon) => pokemon.id === Number(pokemonId)) || null;

    setProgressByRegion((prev) => {
      const currentRegionProgress = prev[selectedRegion];
      const updatedParty = [...currentRegionProgress.party];
      updatedParty[slotIndex] = selectedPokemon;

      return {
        ...prev,
        [selectedRegion]: {
          ...currentRegionProgress,
          party: updatedParty,
        },
      };
    });
  };

  const clearPartySlot = (slotIndex: number) => {
    setProgressByRegion((prev) => {
      const currentRegionProgress = prev[selectedRegion];
      const updatedParty = [...currentRegionProgress.party];
      updatedParty[slotIndex] = null;

      return {
        ...prev,
        [selectedRegion]: {
          ...currentRegionProgress,
          party: updatedParty,
        },
      };
    });
  };

  const handleRegionChange = (newRegion: RegionKey) => {
    setSelectedRegion(newRegion);
  };

  return (
    <div className={`app${editMode ? ' edit-mode' : ''}`}>
      {loadingPokemon ? <div style={{ color: '#fff' }}>Loading Pokémon...</div> : null}
      {/* Edit sidebar: only visible in edit mode */}
      {editMode && (
        <aside className="edit-sidebar">
          <div className="edit-sidebar-section">
            <label htmlFor="region-select" className="sidebar-label">Region</label>
            <select
              id="region-select"
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value as RegionKey)}
              className="sidebar-select"
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>
          <div className="edit-sidebar-section">
            <button type="button" className="clear-button sidebar-btn" onClick={resetBadges}>
              Reset Badges
            </button>
            <button type="button" className="clear-button sidebar-btn" onClick={resetParty}>
              Reset Party
            </button>
            <button type="button" className="clear-button sidebar-btn" onClick={resetAll}>
              Reset All
            </button>
          </div>
          <div className="edit-sidebar-section">
            <div className="sidebar-label">Party</div>
            {party.map((slot, index) => (
              <div key={index} className="sidebar-party-slot">
                <select
                  value={slot?.id ?? ""}
                  onChange={(e) => updatePartySlot(index, e.target.value)}
                  className="sidebar-select"
                >
                  <option value="">Select Pokémon</option>
                  {filteredPokemon.map((pokemon) => (
                    <option key={pokemon.id} value={pokemon.id}>
                      {pokemon.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="clear-button sidebar-btn"
                  onClick={() => clearPartySlot(index)}
                >
                  Clear
                </button>
              </div>
            ))}
          </div>
          <div className="edit-sidebar-section">
            <div className="sidebar-label">Badges</div>
            <div className="sidebar-badges">
              {filteredBadges.map((badge) => (
                <div key={badge.id} className="sidebar-badge-toggle">
                  <img
                    src={badge.image}
                    alt={badge.name}
                    className={`badge-image ${earnedBadgeIds.includes(badge.id) ? "badge-earned" : "badge-locked"}`}
                    style={{ marginRight: 4, cursor: 'pointer' }}
                    onClick={() => toggleBadge(badge.id)}
                  />
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Overlay content for audience (unchanged) */}
      <div className="overlay-party">
        <div className="panel">
          <h2 style={{ textAlign: 'center' }}>Party</h2>
          <div className="party-grid">
            {party.map((slot, index) => (
              <div key={index} className="party-slot">
                <img
                  src={slot?.sprite ?? "/sprites/items/poke-ball.png"}
                  alt={slot?.name ?? "Empty party slot"}
                  className={`party-slot-image ${slot ? "party-filled" : "party-empty"}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="overlay-badges">
        <div className="panel">
          <h2 style={{ textAlign: 'center' }}>Badges</h2>
          <div className="badge-row">
            {filteredBadges.map((badge) => {
              const isEarned = earnedBadgeIds.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className="badge-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleBadge(badge.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleBadge(badge.id);
                    }
                  }}
                >
                  <img
                    src={badge.image}
                    alt={badge.name}
                    className={`badge-image ${isEarned ? "badge-earned" : "badge-locked"}`}
                  />
                  <span>{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;