# Fruit Machine Theming

This project drives most of the slot cabinet look & feel from a handful of reusable configuration objects. Use the references below when you need to swap in a new theme or tweak an existing one.

## Changing Reel Items
- `src/game/core/fruitMachineConfig.ts#L25` – `SymbolDefinition` controls the label, geometry, model and base color for each reel item. Update `SYMBOL_DEFINITIONS` to recolor an item, point it at a different model, or add a new symbol id.
- `src/game/core/fruitMachineConfig.ts#L59` – `SYMBOL_DEFINITIONS` maps each symbol id to its appearance and payout. This is the main spot for swapping models or colors.
- `src/game/core/fruitMachineConfig.ts#L122` – `REEL_SYMBOLS` defines the sequence of symbol ids for each reel. Adjust these arrays to swap which items appear, their ordering, or relative frequency.
- `src/game/core/fruitMachineConfig.ts#L139` – `DEFAULT_FRUIT_MACHINE_CONFIG` composes the pieces above (plus spin cost, win lines, etc.). Create alternate configs or replace this default when you want to load a completely different machine theme.
- `src/game/state/slotsStore.ts#L150` – The store imports `DEFAULT_FRUIT_MACHINE_CONFIG`. Swap in a different config object here (or expose a setter) when you need to switch themes at runtime.

## Updating Machine Colors
- `src/game/scene/FruitMachineScene.tsx#L8` – Cabinet, button, win-line, floor and display materials are all created in `create*Material` helpers. Update their color/emissive values to recolor the cabinet shell, control panel, floor, etc.
- `src/game/scene/components/CabinetButtonPanel.tsx#L82` – The spin button “pressed” glow overrides the base material color/emissive values; adjust these if the highlight should change with the theme.
- `src/game/scene/components/DotMatrixDisplay.tsx#L21` – `BACKGROUND_COLOR`, `ACTIVE_PIXEL_COLOR`, and the effect color arrays drive the dot-matrix palette and celebration effects.
- `src/game/entities/ReelColumn.tsx#L129` – Non-model symbols inherit their tint and emissive glow from the `SymbolDefinition.color`. Updating the symbol colors in the config automatically feeds through here.

With these reference points you can define new symbol sets and recolor the cabinet to match, making it easy to drop in themed machines for events or gameplay modes. If you introduce a new configuration file for a theme, remember to initialize `slotsStore` with that config before rendering the scene.
