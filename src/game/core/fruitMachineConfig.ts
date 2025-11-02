import type { ComponentType } from "react";
import { SYMBOL_DEFINITIONS } from "./breadwinner_symbolDefinitions";

export type SymbolId =
  | "symbol1"
  | "symbol2"
  | "symbol3"
  | "symbol4"
  | "symbol5"
  | "symbol6";

export type SymbolGeometry = "model";

export interface SymbolModelProps {
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

const REEL_SYMBOLS: SymbolId[][] = [
  ["symbol1", "symbol2", "symbol3", "symbol4", "symbol5", "symbol6", "symbol2", "symbol3", "symbol1", "symbol2", "symbol3", "symbol4", "symbol5", "symbol6", "symbol2"],
  ["symbol3", "symbol2", "symbol6", "symbol1", "symbol4", "symbol5", "symbol1", "symbol2", "symbol3", "symbol2", "symbol6", "symbol1", "symbol4", "symbol5", "symbol1"],
  ["symbol2", "symbol4", "symbol3", "symbol6", "symbol5", "symbol1", "symbol4", "symbol3", "symbol2", "symbol4", "symbol3", "symbol6", "symbol5", "symbol1", "symbol4"],
  ["symbol6", "symbol3", "symbol1", "symbol4", "symbol2", "symbol5", "symbol2", "symbol3", "symbol6", "symbol3", "symbol1", "symbol4", "symbol2", "symbol5", "symbol2"],
  ["symbol1", "symbol5", "symbol6", "symbol3", "symbol2", "symbol4", "symbol3", "symbol6", "symbol1", "symbol5", "symbol6", "symbol3", "symbol2", "symbol4", "symbol3"]
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
