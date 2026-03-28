import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import "./index.css";
import { badges } from "./data/badges";
import { regions } from "./data/regions";
import { pokemonList as staticPokemonList } from "./data/pokemonList";
import type { PartySlot, RegionKey, RegionProgress, PokemonOption, SaveSlot } from "./types";

/** For IDs 1-649 (Gen I-V), shiny animated sprites are available */
function getShinySprite(pokemon: PokemonOption): string | null {
  if (pokemon.id >= 1 && pokemon.id <= 649) {
    return `sprites/pokemon/animated/shiny/${pokemon.id}.gif`;
  }
  return null;
}

const STORAGE_KEY = "pokemon-badge-tracker";
const SAVES_STORAGE_KEY = "pokemon-badge-tracker-saves";
const SYNC_WS_URL = "ws://localhost:8765";
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
          isShiny: parsed.progressByRegion?.[region]?.isShiny ?? false,
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

  // Save slots
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>(() => {
    try {
      const saved = localStorage.getItem(SAVES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    localStorage.setItem(SAVES_STORAGE_KEY, JSON.stringify(saveSlots));
  }, [saveSlots]);

  const saveCurrentState = () => {
    const trimmed = saveName.trim();
    if (!trimmed) return;
    const newSave: SaveSlot = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      region: selectedRegion,
      progress: { ...progressByRegion[selectedRegion] },
      savedAt: Date.now(),
    };
    setSaveSlots((prev) => [newSave, ...prev]);
    setSaveName("");
  };

  const loadSaveSlot = (slot: SaveSlot) => {
    setSelectedRegion(slot.region);
    setProgressByRegion((prev) => ({
      ...prev,
      [slot.region]: slot.progress,
    }));
  };

  const deleteSaveSlot = (id: string) => {
    setSaveSlots((prev) => prev.filter((s) => s.id !== id));
  };

  // WebSocket sync: broadcast state to other clients (e.g. OBS)
  const wsRef = useRef<WebSocket | null>(null);
  const isRemoteUpdate = useRef(false);

  const connectWs = useCallback(() => {
    const ws = new WebSocket(SYNC_WS_URL);

    ws.onopen = () => {
      console.log("Sync connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        isRemoteUpdate.current = true;
        if (data.selectedRegion) setSelectedRegion(data.selectedRegion);
        if (data.progressByRegion) setProgressByRegion(data.progressByRegion);
        // Delay reset so React effects see the flag before it clears
        setTimeout(() => { isRemoteUpdate.current = false; }, 200);
      } catch { /* ignore invalid messages */ }
    };

    ws.onclose = () => {
      // Reconnect after a short delay
      setTimeout(connectWs, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connectWs();
    return () => { wsRef.current?.close(); };
  }, [connectWs]);

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

    // Broadcast to other clients (skip if this was a remote update)
    if (!isRemoteUpdate.current && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(dataToSave));
    }
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
      updatedParty[slotIndex] = selectedPokemon
        ? { ...selectedPokemon, isShiny: false }
        : null;

      return {
        ...prev,
        [selectedRegion]: {
          ...currentRegionProgress,
          party: updatedParty,
        },
      };
    });
  };

  const toggleSlotShiny = (slotIndex: number) => {
    setProgressByRegion((prev) => {
      const currentRegionProgress = prev[selectedRegion];
      const updatedParty = [...currentRegionProgress.party];
      const slot = updatedParty[slotIndex];
      if (slot) {
        updatedParty[slotIndex] = { ...slot, isShiny: !slot.isShiny };
      }
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
                  className={`clear-button sidebar-btn${slot?.isShiny ? ' shiny-active' : ''}`}
                  onClick={() => toggleSlotShiny(index)}
                  disabled={!slot}
                >
                  {slot?.isShiny ? '★' : '☆'}
                </button>
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
            <div className="sidebar-label">Save / Load</div>
            <div className="save-input-row">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); saveCurrentState(); } e.stopPropagation(); }}
                placeholder="Save name…"
                className="sidebar-select save-name-input"
                maxLength={40}
              />
              <button
                type="button"
                className="clear-button sidebar-btn save-btn"
                onClick={saveCurrentState}
                disabled={!saveName.trim()}
              >
                Save
              </button>
            </div>
            <div className="save-slots-list">
              {saveSlots.length === 0 && (
                <div className="save-slot-empty">No saves yet</div>
              )}
              {saveSlots.map((slot) => (
                <div key={slot.id} className="save-slot-item">
                  <div className="save-slot-info">
                    <span className="save-slot-name">{slot.name}</span>
                    <span className="save-slot-meta">
                      {slot.region.charAt(0).toUpperCase() + slot.region.slice(1)}
                      {' · '}
                      {new Date(slot.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="save-slot-actions">
                    <button
                      type="button"
                      className="clear-button sidebar-btn load-btn"
                      onClick={() => loadSaveSlot(slot)}
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      className="clear-button sidebar-btn delete-btn"
                      onClick={() => deleteSaveSlot(slot.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                  src={
                    slot
                      ? (slot.isShiny ? (getShinySprite(slot) ?? slot.sprite) : slot.sprite) ?? "sprites/items/poke-ball.png"
                      : "sprites/items/poke-ball.png"
                  }
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