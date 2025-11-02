# Aurora Five Slots

Aurora Five is an interactive, browser-based slot cabinet rendered in real time with React Three Fiber, Rapier physics, and a deterministic payout engine. Spin the reels, latch individual columns with hold buttons, and watch the cabinet spring to life with physically based lighting and post-processing effects.

## Highlights
- **Immersive 3D cabinet** composed of reusable meshes, custom materials, and cinematic lighting/shadows.
- **Deterministic spin logic** powered by a Zustand store that coordinates spin plans, reel holds, and payout evaluation.
- **Config-driven symbols** – reel strips, win lines, and payouts are defined in `src/game/core/fruitMachineConfig.ts`.
- **Strict TypeScript** across gameplay, rendering, and UI layers with zero `any` usage.
- **Testable architecture** with unit and integration coverage via Vitest, Testing Library, and Playwright.

## Quick Start
1. Install Node.js 18+.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the dev server:
   ```bash
   npm run dev
   ```
4. Open the printed URL (defaults to http://localhost:5173) to explore the slot cabinet.

Use `npm run preview` after building to inspect the production bundle locally.

## Gameplay Overview
- **Credits & spins**: Each spin costs 1 credit (configurable). Credits replenish via line wins determined by `winLines`.
- **Reel holds**: Toggle individual reels via the hold buttons; held reels keep their current symbol when you spin again.
- **Spin timing**: Reels stagger their spin duration and angular velocity for a physical feel, governed by per-reel spin plans.
- **Win evaluation**: After all reels stop, the store evaluates complete and partial matches (3+ symbols from the left) and aggregates payouts.
- **Visual feedback**: Button emissive pulses, dot-matrix displays, win-line highlights, and post-processing effects reinforce results.

## Available Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite in development mode with HMR. |
| `npm run build` | Produce a production bundle in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run typecheck` | Run the TypeScript compiler in `--noEmit` mode. |
| `npm run lint` | Lint all sources with ESLint (strict config). |
| `npm run test` | Execute the Vitest suite once in Node + jsdom. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:cov` | Collect coverage via V8 instrumentation. |
| `npm run e2e` / `npm run e2e:headed` | Execute Playwright end-to-end specs against `vite preview`. |
| `npm run check` | Run typecheck, lint, unit tests, and build in sequence (CI default). |

## Project Layout
```
src/
├─ app/            # Shell app, providers, React canvas bootstrap
├─ game/
│  ├─ assets/      # GLTF/GLB and supporting resources
│  ├─ core/        # Slot machine configuration & math helpers
│  ├─ controls/    # Player input helpers and camera rig logic
│  ├─ entities/    # Renderable reel columns, symbols, and effects
│  ├─ physics/     # Rapier hooks and simulation utilities
│  ├─ scene/       # Scene graph composition, cabinet meshes, lighting
│  ├─ state/       # Zustand store for spins, credits, and reel runtime
│  ├─ utils/       # Shared calculations and constants
├─ lib/            # Cross-cutting utilities
├─ styles/         # Global styles imported by the app shell
├─ test/           # Vitest setup, fixtures, and MSW handlers
e2e/               # Playwright scenarios
docs/              # Additional guides (e.g., theming)
```

## Theming & Customization
Most visuals are configuration-driven:
- Update symbol definitions, reel strips, and win lines in `src/game/core/fruitMachineConfig.ts`.
- Swap cabinet materials, lighting, and button colors in `src/game/scene/FruitMachineScene.tsx`.
- Tailor the button panel glow and dot-matrix palette in the components under `src/game/scene/components/`.

See `docs/theming.md` for a step-by-step walkthrough of swapping in a new machine theme.

## Quality & Testing
- Keep gameplay deterministic: prefer seeded randomness and centralized evaluation in the store.
- Maintain strict types; introduce new modules with explicit interfaces and TSDoc on public exports.
- Before opening a PR, run the full project check:
  ```bash
  npm run check
  ```
  Add `npm run e2e` when modifying player flows or physics timing.
- Unit tests live alongside logic-heavy modules; component and store integrations belong in `src/test`.

## Troubleshooting
- **Missing 3D assets**: Ensure GLTF/GLB files referenced in `src/game/assets` are available; Vite will report missing imports on build.
- **Jittery physics**: Confirm only one `<Physics>` root is mounted and that Rapier components are memoized in `scene/`.
- **Performance dips**: Inspect `useFrame` hooks for per-frame allocations and reuse cached materials/geometries when adding new meshes.

## Contributing
Follow the golden rules in `AGENTS.md`: prioritize correctness, type safety, and test coverage, and keep changes small and reviewable. Update relevant docs when introducing new features or themes so future contributors can extend the cabinet confidently.

