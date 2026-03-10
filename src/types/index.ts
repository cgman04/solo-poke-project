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
  region: RegionKey;
};

export type PartySlot = PokemonOption | null;

export type TrackerState = {
  selectedRegion: RegionKey;
  earnedBadgeIds: string[];
  party: PartySlot[];
};

export type RegionProgress = {
  earnedBadgeIds: string[];
  party: PartySlot[];
};

export type SaveDate = {
  selectedRegion: RegionKey;
  progressByRegion: Record<RegionKey, RegionProgress>;
};

