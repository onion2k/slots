import { DEFAULT_FRUIT_MACHINE_CONFIG } from "@game/core/fruitMachineConfig";
import type {
  FruitMachineConfig,
  ReelConfig,
  SymbolId,
  WinLine
} from "@game/core/fruitMachineConfig";
import { create } from "zustand";

const TAU = Math.PI * 2;

interface ReelSpinPlan {
  key: number;
  startAngle: number;
  targetAngle: number;
  duration: number;
  delay: number;
  startTime: number;
  targetIndex: number;
}

export interface ReelRuntimeState {
  id: string;
  config: ReelConfig;
  held: boolean;
  currentIndex: number;
  currentAngle: number;
  spinPlan: ReelSpinPlan | null;
}

interface WinLineResult {
  line: WinLine;
  symbol: SymbolId;
  payout: number;
  matchLength: number;
}

export interface SpinResult {
  totalPayout: number;
  lines: WinLineResult[];
}

interface SlotsState {
  config: FruitMachineConfig;
  credits: number;
  isSpinning: boolean;
  reels: ReelRuntimeState[];
  pendingStops: number;
  spinCounter: number;
  lastResult: SpinResult | null;
  spin: () => void;
  toggleHold: (reelId: string) => void;
  releaseAllHolds: () => void;
  completeReelSpin: (reelId: string) => void;
}

const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const lerpAngle = (start: number, end: number, extraTurns: number) => {
  return start + ((end - start + TAU) % TAU) + extraTurns * TAU;
};

const normalizeAngle = (angle: number) => {
  const wrapped = angle % TAU;
  return wrapped < 0 ? wrapped + TAU : wrapped;
};

const computeAngleForIndex = (index: number, total: number) => {
  const anglePerSymbol = TAU / total;
  return normalizeAngle(index * anglePerSymbol);
};

const getOffsetSymbol = (
  symbols: SymbolId[],
  baseIndex: number,
  offset: number
) => {
  const count = symbols.length;
  const resolved = (baseIndex + offset + count * 10) % count;
  return symbols[resolved];
};

const PARTIAL_MATCH_MULTIPLIERS: Record<number, number> = {
  3: 0.35,
  4: 0.65
};

const evaluateSpinResult = (
  config: FruitMachineConfig,
  reels: ReelRuntimeState[]
): SpinResult => {
  const { symbolDefinitions, winLines } = config;
  const lines: WinLineResult[] = [];

  for (const line of winLines) {
    const lineSymbols: SymbolId[] = reels.map((reel, reelIndex) => {
      const offset = line.indices[reelIndex] ?? 0;
      return getOffsetSymbol(
        reel.config.symbols,
        reel.currentIndex,
        offset
      );
    });

    const firstSymbol = lineSymbols[0];
    if (!firstSymbol) {
      continue;
    }

    const symbolDefinition = symbolDefinitions[firstSymbol];
    if (!symbolDefinition) {
      continue;
    }

    const allMatch = lineSymbols.every((symbol) => symbol === firstSymbol);

    if (allMatch) {
      const basePayout = symbolDefinition.payout;
      const payout = Math.round(basePayout * line.payoutMultiplier);

      lines.push({
        line,
        symbol: firstSymbol,
        payout,
        matchLength: lineSymbols.length
      });
      continue;
    }

    let consecutiveMatchCount = 1;
    for (let index = 1; index < lineSymbols.length; index += 1) {
      if (lineSymbols[index] === firstSymbol) {
        consecutiveMatchCount += 1;
      } else {
        break;
      }
    }

    if (consecutiveMatchCount >= 3) {
      const multiplier =
        PARTIAL_MATCH_MULTIPLIERS[consecutiveMatchCount] ?? 0;
      if (multiplier <= 0) {
        continue;
      }

      const basePayout = symbolDefinition.payout;
      const payout = Math.max(
        1,
        Math.round(basePayout * line.payoutMultiplier * multiplier)
      );

      lines.push({
        line,
        symbol: firstSymbol,
        payout,
        matchLength: consecutiveMatchCount
      });
    }
  }

  const totalPayout = lines.reduce((acc, line) => acc + line.payout, 0);
  return { totalPayout, lines };
};

const createInitialReelState = (
  config: FruitMachineConfig
): ReelRuntimeState[] => {
  return config.reels.map((reelConfig) => {
    const initialIndex = getRandomInt(0, reelConfig.symbols.length - 1);
    const angle = computeAngleForIndex(initialIndex, reelConfig.symbols.length);

    return {
      id: reelConfig.id,
      config: reelConfig,
      held: false,
      currentIndex: initialIndex,
      currentAngle: angle,
      spinPlan: null
    };
  });
};

export const useSlotsStore = create<SlotsState>((set, get) => ({
  config: DEFAULT_FRUIT_MACHINE_CONFIG,
  credits: DEFAULT_FRUIT_MACHINE_CONFIG.initialCredits,
  isSpinning: false,
  reels: createInitialReelState(DEFAULT_FRUIT_MACHINE_CONFIG),
  pendingStops: 0,
  spinCounter: 0,
  lastResult: null,
  spin: () => {
    const state = get();
    const { config } = state;
    const now = typeof performance !== "undefined" ? performance.now() : 0;

    if (state.isSpinning || state.credits < config.spinCost) {
      return;
    }

    const nextSpinKey = state.spinCounter + 1;
    let pendingStops = 0;

    const updatedReels = state.reels.map((reel, index) => {
      if (reel.held) {
        return {
          ...reel,
          spinPlan: null
        };
      }

      const symbolsCount = reel.config.symbols.length;
      const targetIndex = getRandomInt(0, symbolsCount - 1);
      const anglePerSymbol = TAU / symbolsCount;
      const targetAngleBase = computeAngleForIndex(
        targetIndex,
        symbolsCount
      );

      const extraTurns = getRandomInt(2, 4 + index);
      const targetAngle = lerpAngle(
        reel.currentAngle,
        targetAngleBase,
        extraTurns
      );

      const [minDuration, maxDuration] = config.spinDurationBounds;
      const [minVelocity, maxVelocity] = config.angularVelocityBounds;

      const durationSeconds =
        minDuration +
        (maxDuration - minDuration) * (Math.random() * 0.6 + 0.4) +
        index * 0.15;

      const delaySeconds = index * 0.12;
      const velocity = getRandomInt(minVelocity, maxVelocity);
      const adjustedDuration = Math.max(
        durationSeconds,
        (targetAngle - reel.currentAngle) / velocity
      );

      pendingStops += 1;

      return {
        ...reel,
        held: false,
        spinPlan: {
          key: nextSpinKey * 10 + index,
          startAngle: reel.currentAngle,
          targetAngle,
          duration: adjustedDuration,
          delay: delaySeconds,
          startTime: now,
          targetIndex
        }
      };
    });

    if (pendingStops === 0) {
      const result = evaluateSpinResult(config, updatedReels);
      set({
        credits: state.credits - config.spinCost + result.totalPayout,
        isSpinning: false,
        reels: updatedReels,
        pendingStops,
        lastResult: result,
        spinCounter: nextSpinKey
      });
      return;
    }

    set({
      credits: state.credits - config.spinCost,
      isSpinning: true,
      reels: updatedReels,
      pendingStops,
      lastResult: null,
      spinCounter: nextSpinKey
    });
  },
  toggleHold: (reelId) =>
    set((state) => {
      if (state.isSpinning) {
        return state;
      }

      const reels = state.reels.map((reel) =>
        reel.id === reelId
          ? {
              ...reel,
              held: !reel.held
            }
          : reel
      );

      return { reels };
    }),
  releaseAllHolds: () =>
    set((state) => {
      if (state.isSpinning) {
        return state;
      }

      const reels = state.reels.map((reel) => ({
        ...reel,
        held: false
      }));

      return { reels };
    }),
  completeReelSpin: (reelId) => {
    const state = get();
    const reels = state.reels.map((reel) => {
      if (reel.id !== reelId || !reel.spinPlan) {
        return reel;
      }

      const normalizedAngle = normalizeAngle(reel.spinPlan.targetAngle);

      return {
        ...reel,
        currentIndex: reel.spinPlan.targetIndex,
        currentAngle: normalizedAngle,
        spinPlan: null
      };
    });

    const pendingStops = Math.max(state.pendingStops - 1, 0);

    if (pendingStops > 0) {
      set({
        reels,
        pendingStops
      });
      return;
    }

    const result = evaluateSpinResult(state.config, reels);
    const updatedCredits = state.credits + result.totalPayout;

    set({
      reels,
      pendingStops,
      isSpinning: false,
      credits: updatedCredits,
      lastResult: result
    });
  }
}));
