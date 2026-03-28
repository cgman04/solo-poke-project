export type RegionKey = "kanto" | "johto" | "hoenn" | "sinnoh" | "unova" | "kalos" | "alola" | "galar" | "paldea";

export type Badge = {
  id: string;
  name: string;
  image: string;
  region: RegionKey;
};

export type PokemonOption = {
  id: number;
  name: string;
  sprite: string | null;
  shinySprite?: string | null;
  region: RegionKey;
};

export type PartySlot = (PokemonOption & { isShiny?: boolean }) | null;

export type TrackerState = {
  selectedRegion: RegionKey;
  earnedBadgeIds: string[];
  party: PartySlot[];
};

export type RegionProgress = {
  earnedBadgeIds: string[];
  party: PartySlot[];
  isShiny?: boolean;
};


export type SaveDate = {
  selectedRegion: RegionKey;
  progressByRegion: Record<RegionKey, RegionProgress>;
};

export type SaveSlot = {
  id: string;
  name: string;
  region: RegionKey;
  progress: RegionProgress;
  savedAt: number;
};

