import {
    Orange,
    Banana,
    Bomb,
    CashStack,
    Cherry,
    Cherry1,
    ChestGold,
    Coin,
    Crown,
    Gold,
    GoldBag,
    GoldBars,
    Grapes,
    Key,
    Lemon,
    Mushroom,
    Star
} from "@game/assets/fruitmachine";

import type { SymbolDefinition, SymbolId } from "./fruitMachineConfig";

export const SYMBOL_DEFINITIONS: Record<SymbolId, SymbolDefinition> = {
  symbol1: {
    id: "symbol1",
    label: "Banana",
    geometry: "model",
    color: "#ff4d6d",
    payout: 10,
    model: {
      Component: Banana
    }
  },
  symbol2: {
    id: "symbol2",
    label: "CashStack",
    geometry: "model",
    color: "#f9d923",
    payout: 8,
    model: {
      Component: CashStack
    }
  },
  symbol3: {
    id: "symbol3",
    label: "Cherry",
    geometry: "model",
    color: "#924da3",
    payout: 12,
    model: {
      Component: Cherry
    }
  },
  symbol4: {
    id: "symbol4",
    label: "ChestGold",
    geometry: "model",
    color: "#ffd166",
    payout: 16,
    model: {
      Component: Grapes
    }
  },
  symbol5: {
    id: "symbol5",
    label: "Coin",
    geometry: "model",
    color: "#ff006e",
    payout: 30,
    model: {
      Component: Lemon
    }
  },
  symbol6: {
    id: "symbol6",
    label: "GoldBars",
    geometry: "model",
    color: "#4cc9f0",
    payout: 50,
    model: {
      Component: GoldBars
    }
  }
};
