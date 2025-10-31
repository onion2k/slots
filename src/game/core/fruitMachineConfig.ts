import type { ComponentType } from "react";
import { ItemCroissant, ItemPieCherry, ItemDonut, ItemBread, ItemBreadRoll, ItemBreadSlice, ItemCakeBirthdaySlice, ItemCakeChocolateSlice, ItemCupcake } from "@game/assets";


export type SymbolId =
  | "cherry"
  | "lemon"
  | "plum"
  | "bell"
  | "seven"
  | "diamond";

export type SymbolGeometry = "box" | "sphere" | "model";

export type SymbolModelProps = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  scale: number;
};

export interface SymbolModelConfig {
  Component: ComponentType<SymbolModelProps>;
}

export interface SymbolDefinition {
  id: SymbolId;
  label: string;
  geometry: SymbolGeometry;
  color: string;
  payout: number;
  model?: SymbolModelConfig;
}

export interface ReelConfig {
  id: string;
  symbols: SymbolId[];
}

export interface WinLine {
  id: string;
  indices: number[];
  payoutMultiplier: number;
}

export interface FruitMachineConfig {
  name: string;
  reelRadius: number;
  reelGap: number;
  itemScale: number;
  spinCost: number;
  initialCredits: number;
  spinDurationBounds: [number, number];
  angularVelocityBounds: [number, number];
  reels: ReelConfig[];
  symbolDefinitions: Record<SymbolId, SymbolDefinition>;
  winLines: WinLine[];
}

const SYMBOL_DEFINITIONS: Record<SymbolId, SymbolDefinition> = {
  cherry: {
    id: "cherry",
    label: "Cherry",
    geometry: "model",
    color: "#ff4d6d",
    payout: 10,
    model: {
      Component: ItemPieCherry
    }
  },
  lemon: {
    id: "lemon",
    label: "Croissant",
    geometry: "model",
    color: "#f9d923",
    payout: 8,
    model: {
      Component: ItemCroissant
    }
  },
  plum: {
    id: "plum",
    label: "Donut",
    geometry: "model",
    color: "#924da3",
    payout: 12,
    model: {
      Component: ItemDonut
    }
  },
  bell: {
    id: "bell",
    label: "Breadroll",
    geometry: "model",
    color: "#ffd166",
    payout: 16,
    model: {
      Component: ItemBreadRoll
    }
  },
  seven: {
    id: "seven",
    label: "BirthdayCake",
    geometry: "model",
    color: "#ff006e",
    payout: 30,
    model: {
      Component: ItemCakeBirthdaySlice
    }
  },
  diamond: {
    id: "diamond",
    label: "Cupcake",
    geometry: "model",
    color: "#4cc9f0",
    payout: 50,
    model: {
      Component: ItemCupcake
    }
  }
};

const REEL_SYMBOLS: SymbolId[][] = [
  ["cherry", "lemon", "plum", "bell", "seven", "diamond", "lemon", "plum", "cherry", "lemon", "plum", "bell", "seven", "diamond", "lemon"],
  ["plum", "lemon", "diamond", "cherry", "bell", "seven", "cherry", "lemon", "plum", "lemon", "diamond", "cherry", "bell", "seven", "cherry"],
  ["lemon", "bell", "plum", "diamond", "seven", "cherry", "bell", "plum", "lemon", "bell", "plum", "diamond", "seven", "cherry", "bell"],
  ["diamond", "plum", "cherry", "bell", "lemon", "seven", "lemon", "plum", "diamond", "plum", "cherry", "bell", "lemon", "seven", "lemon"],
  ["cherry", "seven", "diamond", "plum", "lemon", "bell", "plum", "diamond", "cherry", "seven", "diamond", "plum", "lemon", "bell", "plum"]
];

const WIN_LINES: WinLine[] = [
  { id: "center", indices: [0, 0, 0, 0, 0], payoutMultiplier: 1 },
  { id: "top", indices: [-1, -1, -1, -1, -1], payoutMultiplier: 0.8 },
  { id: "bottom", indices: [1, 1, 1, 1, 1], payoutMultiplier: 0.8 },
  { id: "v-down", indices: [-1, 0, 0, 0, -1], payoutMultiplier: 1.2 },
  { id: "v-up", indices: [1, 0, 0, 0, 1], payoutMultiplier: 1.2 },
  { id: "zig", indices: [0, -1, 0, 1, 0], payoutMultiplier: 1.5 }
];

export const DEFAULT_FRUIT_MACHINE_CONFIG: FruitMachineConfig = {
  name: "Aurora Five",
  reelRadius: 2.4,
  reelGap: 2.2,
  itemScale: 0.6,
  spinCost: 1,
  initialCredits: 50,
  spinDurationBounds: [2.5, 3.4],
  angularVelocityBounds: [7, 11],
  reels: REEL_SYMBOLS.map((symbols, index) => ({
    id: `reel-${index + 1}`,
    symbols
  })),
  symbolDefinitions: SYMBOL_DEFINITIONS,
  winLines: WIN_LINES
};
