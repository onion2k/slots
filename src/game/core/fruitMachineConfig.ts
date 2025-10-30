export type SymbolId =
  | "cherry"
  | "lemon"
  | "plum"
  | "bell"
  | "seven"
  | "diamond";

export type SymbolGeometry = "box" | "sphere";

export interface SymbolDefinition {
  id: SymbolId;
  label: string;
  geometry: SymbolGeometry;
  color: string;
  payout: number;
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
    geometry: "sphere",
    color: "#ff4d6d",
    payout: 10
  },
  lemon: {
    id: "lemon",
    label: "Lemon",
    geometry: "sphere",
    color: "#f9d923",
    payout: 8
  },
  plum: {
    id: "plum",
    label: "Plum",
    geometry: "sphere",
    color: "#924da3",
    payout: 12
  },
  bell: {
    id: "bell",
    label: "Bell",
    geometry: "box",
    color: "#ffd166",
    payout: 16
  },
  seven: {
    id: "seven",
    label: "Seven",
    geometry: "box",
    color: "#ff006e",
    payout: 30
  },
  diamond: {
    id: "diamond",
    label: "Diamond",
    geometry: "box",
    color: "#4cc9f0",
    payout: 50
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
