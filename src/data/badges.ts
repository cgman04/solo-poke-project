import { type Badge } from "../types";

export const badgesByRegion: Record<string, Badge[]> = {
  kanto: [
    { id: "kanto-1", name: "Boulder Badge", image: "/sprites/badges/1.png", region: "kanto" },
    { id: "kanto-2", name: "Cascade Badge", image: "/sprites/badges/2.png", region: "kanto" },
    { id: "kanto-3", name: "Thunder Badge", image: "/sprites/badges/3.png", region: "kanto" },
    { id: "kanto-4", name: "Rainbow Badge", image: "/sprites/badges/4.png", region: "kanto" },
    { id: "kanto-5", name: "Soul Badge", image: "/sprites/badges/5.png", region: "kanto" },
    { id: "kanto-6", name: "Marsh Badge", image: "/sprites/badges/6.png", region: "kanto" },
    { id: "kanto-7", name: "Volcano Badge", image: "/sprites/badges/7.png", region: "kanto" },
    { id: "kanto-8", name: "Earth Badge", image: "/sprites/badges/8.png", region: "kanto" },
  ],
  johto: [
    { id: "johto-1", name: "Zephyr Badge", image: "/sprites/badges/9.png", region: "johto" },
    { id: "johto-2", name: "Hive Badge", image: "/sprites/badges/10.png", region: "johto" },
    { id: "johto-3", name: "Plain Badge", image: "/sprites/badges/11.png", region: "johto" },
    { id: "johto-4", name: "Fog Badge", image: "/sprites/badges/12.png", region: "johto" },
    { id: "johto-5", name: "Storm Badge", image: "/sprites/badges/13.png", region: "johto" },
    { id: "johto-6", name: "Mineral Badge", image: "/sprites/badges/14.png", region: "johto" },
    { id: "johto-7", name: "Glacier Badge", image: "/sprites/badges/15.png", region: "johto" },
    { id: "johto-8", name: "Rising Badge", image: "/sprites/badges/16.png", region: "johto" },
  ],
  hoenn: [
    { id: "hoenn-1", name: "Stone Badge", image: "/sprites/badges/17.png", region: "hoenn" },
    { id: "hoenn-2", name: "Knuckle Badge", image: "/sprites/badges/18.png", region: "hoenn" },
    { id: "hoenn-3", name: "Dynamo Badge", image: "/sprites/badges/19.png", region: "hoenn" },
    { id: "hoenn-4", name: "Heat Badge", image: "/sprites/badges/20.png", region: "hoenn" },
    { id: "hoenn-5", name: "Balance Badge", image: "/sprites/badges/21.png", region: "hoenn" },
    { id: "hoenn-6", name: "Feather Badge", image: "/sprites/badges/22.png", region: "hoenn" },
    { id: "hoenn-7", name: "Mind Badge", image: "/sprites/badges/23.png", region: "hoenn" },
    { id: "hoenn-8", name: "Rain Badge", image: "/sprites/badges/24.png", region: "hoenn" },
  ],
  sinnoh: [
    { id: "sinnoh-1", name: "Coal Badge", image: "/sprites/badges/25.png", region: "sinnoh" },
    { id: "sinnoh-2", name: "Forest Badge", image: "/sprites/badges/26.png", region: "sinnoh" },
    { id: "sinnoh-3", name: "Cobble Badge", image: "/sprites/badges/27.png", region: "sinnoh" },
    { id: "sinnoh-4", name: "Fen Badge", image: "/sprites/badges/28.png", region: "sinnoh" },
    { id: "sinnoh-5", name: "Relic Badge", image: "/sprites/badges/29.png", region: "sinnoh" },
    { id: "sinnoh-6", name: "Mine Badge", image: "/sprites/badges/30.png", region: "sinnoh" },
    { id: "sinnoh-7", name: "Icicle Badge", image: "/sprites/badges/31.png", region: "sinnoh" },
    { id: "sinnoh-8", name: "Beacon Badge", image: "/sprites/badges/32.png", region: "sinnoh" },
  ],
  unova: [
    { id: "unova-1", name: "Trio Badge", image: "/sprites/badges/33.png", region: "unova" },
    { id: "unova-2", name: "Basic Badge", image: "/sprites/badges/34.png", region: "unova" },
    { id: "unova-3", name: "Insect Badge", image: "/sprites/badges/36.png", region: "unova" },
    { id: "unova-4", name: "Bolt Badge", image: "/sprites/badges/37.png", region: "unova" },
    { id: "unova-5", name: "Quake Badge", image: "/sprites/badges/38.png", region: "unova" },
    { id: "unova-6", name: "Jet Badge", image: "/sprites/badges/39.png", region: "unova" },
    { id: "unova-7", name: "Freeze Badge", image: "/sprites/badges/40.png", region: "unova" },
    { id: "unova-8", name: "Legend Badge", image: "/sprites/badges/41.png", region: "unova" },
  ],
  kalos: [],
  galar: [],
  paldea: [],
};

export const badges: Badge[] = Object.values(badgesByRegion).flat();