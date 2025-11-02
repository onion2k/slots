import {
  ItemCroissant,
  ItemPieCherry,
  ItemDonut,
  ItemBreadRoll,
  ItemCakeBirthdaySlice,
  ItemCupcake
} from "@game/assets/breadwinner";

import type { SymbolDefinition, SymbolId } from "./fruitMachineConfig";

export const SYMBOL_DEFINITIONS: Record<SymbolId, SymbolDefinition> = {
  symbol1: {
    id: "symbol1",
    label: "Cherry",
    geometry: "model",
    color: "#ff4d6d",
    payout: 10,
    model: {
      Component: ItemPieCherry
    }
  },
  symbol2: {
    id: "symbol2",
    label: "Croissant",
    geometry: "model",
    color: "#f9d923",
    payout: 8,
    model: {
      Component: ItemCroissant
    }
  },
  symbol3: {
    id: "symbol3",
    label: "Donut",
    geometry: "model",
    color: "#924da3",
    payout: 12,
    model: {
      Component: ItemDonut
    }
  },
  symbol4: {
    id: "symbol4",
    label: "Breadroll",
    geometry: "model",
    color: "#ffd166",
    payout: 16,
    model: {
      Component: ItemBreadRoll
    }
  },
  symbol5: {
    id: "symbol5",
    label: "BirthdayCake",
    geometry: "model",
    color: "#ff006e",
    payout: 30,
    model: {
      Component: ItemCakeBirthdaySlice
    }
  },
  symbol6: {
    id: "symbol6",
    label: "Cupcake",
    geometry: "model",
    color: "#4cc9f0",
    payout: 50,
    model: {
      Component: ItemCupcake
    }
  }
};
