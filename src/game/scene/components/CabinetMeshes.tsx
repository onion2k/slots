import { useCallback, useEffect, useRef, useState } from "react";
import { type GroupProps } from "@react-three/fiber";
import { type MeshStandardMaterial, type BufferGeometry } from "three";
import { useSlotsStore } from "@game/state/slotsStore";
import { Cabinet } from "./Cabinet";
import { CabinetButtonPanel } from "./CabinetButtonPanel";
import {
  DotMatrixDisplay,
  type DotMatrixAnimationMode,
  type DotMatrixEffect
} from "./DotMatrixDisplay";

export interface CabinetGeometryBundle {
  topPanel: BufferGeometry;
  bottomPanel: BufferGeometry;
  sidePanel: BufferGeometry;
  backPanel: BufferGeometry;
  topFrontFrame: BufferGeometry;
  bottomFrontFrame: BufferGeometry;
  sideFrontFrame: BufferGeometry;
  dotMatrix: BufferGeometry;
  dotMatrixSupport: BufferGeometry;
  lowerCabinet: BufferGeometry;
  buttonPanelSurface: BufferGeometry;
  holdButton: BufferGeometry;
  spinButton: BufferGeometry;
  spinDisplay: BufferGeometry;
}

export interface CabinetMaterials {
  cabinetMaterial: MeshStandardMaterial;
  dotMatrixMaterial: MeshStandardMaterial;
  lowerCabinetMaterial: MeshStandardMaterial;
  holdButtonMaterial: MeshStandardMaterial;
  spinButtonMaterial: MeshStandardMaterial;
  spinDisplayMaterial: MeshStandardMaterial;
}

export interface CabinetLayout {
  cabinetCenterZ: number;
  cabinetBackZ: number;
  cabinetFrontZ: number;
  cabinetHalfHeight: number;
  topPanelThickness: number;
  bottomPanelThickness: number;
  frameThickness: number;
  cabinetInnerWidth: number;
  cabinetHeight: number;
  topBarY: number;
  bottomBarY: number;
  topSectionHeight: number;
  bottomSectionHeight: number;
  dotMatrixSupportOffsetX: number;
  dotMatrixSupportY: number;
  dotMatrixSupportZ: number;
  buttonPanelPivotY: number;
  buttonPanelPivotZ: number;
  buttonPanelThickness: number;
  buttonPanelDepth: number;
  buttonPanelTilt: number;
  topDisplayY: number;
  topDisplayZ: number;
  dotMatrixZ: number;
  lowerCabinetCenterY: number;
  lowerCabinetCenterZ: number;
  holdButtonY: number;
  holdRowZ: number;
  actionButtonY: number;
  actionRowZ: number;
  spinButtonX: number;
  spinButtonWidth: number;
  spinButtonHeight: number;
  spinButtonDepth: number;
  spinDisplayX: number;
  spinDisplayY: number;
  spinDisplayZ: number;
  spinDisplayWidth: number;
  spinDisplayHeight: number;
  spinDisplayDepth: number;
}

type CabinetMeshesProps = {
  geometry: CabinetGeometryBundle;
  materials: CabinetMaterials;
  layout: CabinetLayout;
  reelIds: string[];
  reelGap: number;
  originOffset: number;
} & GroupProps;

const IDLE_RESET_MS = 30_000;
const FRIENDLY_LOSS_MESSAGES = [
  "SO CLOSE!",
  "SPIN AGAIN",
  "NEXT TIME",
  "KEEP GOING",
  "YOU GOT THIS"
] as const;
const BIG_WIN_THRESHOLD = 15;
const HUGE_WIN_THRESHOLD = 40;

interface ReactiveDisplayState {
  message: string;
  animationMode: DotMatrixAnimationMode;
  scrollSpeed: number;
  sineWaveAmplitude: number;
  sineWaveFrequency: number;
  sineWaveSpeed: number;
  verticalScrollSpeed: number;
  effect: DotMatrixEffect;
  effectIntensity: number;
  wipeSpeed: number;
}

const formatCreditsLabel = (amount: number) => {
  if (amount === 1) {
    return "1 COIN";
  }
  return `${amount} COINS`;
};

const createDefaultDisplayState = (): ReactiveDisplayState => ({
  message: "PRESS SPIN TO PLAY",
  animationMode: "sine-wave",
  scrollSpeed: 30,
  sineWaveAmplitude: 5,
  sineWaveFrequency: 0.1,
  sineWaveSpeed: 6,
  verticalScrollSpeed: 5,
  effect: "none",
  effectIntensity: 1,
  wipeSpeed: 22
});

const createBlankDisplayState = (): ReactiveDisplayState => ({
  message: "",
  animationMode: "static",
  scrollSpeed: 0,
  sineWaveAmplitude: 0,
  sineWaveFrequency: 0.1,
  sineWaveSpeed: 0,
  verticalScrollSpeed: 4,
  effect: "none",
  effectIntensity: 1.2,
  wipeSpeed: 36
});

const chooseFriendlyLossMessage = () => {
  const index = Math.floor(Math.random() * FRIENDLY_LOSS_MESSAGES.length);
  return FRIENDLY_LOSS_MESSAGES[index] ?? FRIENDLY_LOSS_MESSAGES[0];
};

const createLossDisplayState = (): ReactiveDisplayState => ({
  message: chooseFriendlyLossMessage(),
  animationMode: "horizontal-scroll",
  scrollSpeed: 30,
  sineWaveAmplitude: 3,
  sineWaveFrequency: 0.08,
  sineWaveSpeed: 4,
  verticalScrollSpeed: 4,
  effect: "none",
  effectIntensity: 1,
  wipeSpeed: 18
});

const createWinDisplayState = (payout: number): ReactiveDisplayState => {
  const creditsLabel = formatCreditsLabel(payout);
  if (payout >= HUGE_WIN_THRESHOLD) {
    return {
      message: `HUGE WIN!\n${creditsLabel}`,
      animationMode: "vertical-scroll",
      scrollSpeed: 0,
      sineWaveAmplitude: 4,
      sineWaveFrequency: 0.12,
      sineWaveSpeed: 5,
      verticalScrollSpeed: 25,
      effect: "fireworks",
      effectIntensity: 2.2,
      wipeSpeed: 26
    };
  }

  if (payout >= BIG_WIN_THRESHOLD) {
    return {
      message: `BIG WIN\n+${creditsLabel}`,
      animationMode: "alternate",
      scrollSpeed: 16,
      sineWaveAmplitude: 4,
      sineWaveFrequency: 0.12,
      sineWaveSpeed: 5,
      verticalScrollSpeed: 4,
      effect: "confetti",
      effectIntensity: 1.5,
      wipeSpeed: 24
    };
  }

  return {
    message: `${creditsLabel}`,
    animationMode: "sine-wave",
    scrollSpeed: 28,
    sineWaveAmplitude: 6,
    sineWaveFrequency: 0.14,
    sineWaveSpeed: 7,
    verticalScrollSpeed: 5,
    effect: "fireworks",
    effectIntensity: 1.2,
    wipeSpeed: 22
  };
};

interface ReactiveDotMatrixDisplayProps {
  geometry: BufferGeometry;
  material: MeshStandardMaterial;
  position: [number, number, number];
}

const ReactiveDotMatrixDisplay = ({
  geometry,
  material,
  position
}: ReactiveDotMatrixDisplayProps) => {
  const { spinCounter, isSpinning, lastResult } = useSlotsStore((state) => ({
    spinCounter: state.spinCounter,
    isSpinning: state.isSpinning,
    lastResult: state.lastResult
  }));

  const [displayState, setDisplayState] = useState<ReactiveDisplayState>(() =>
    createDefaultDisplayState()
  );
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastObservedSpinRef = useRef(spinCounter);
  const lastAnnouncedSpinRef = useRef<number | null>(null);

  const clearIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current !== null) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, []);

  const scheduleIdleReset = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    clearIdleTimeout();
    idleTimeoutRef.current = window.setTimeout(() => {
      setDisplayState(createDefaultDisplayState());
    }, IDLE_RESET_MS);
  }, [clearIdleTimeout]);

  const applyDisplayState = useCallback(
    (next: ReactiveDisplayState, options?: { scheduleIdle?: boolean }) => {
      setDisplayState(next);

      if (options?.scheduleIdle) {
        scheduleIdleReset();
      } else {
        clearIdleTimeout();
      }
    },
    [clearIdleTimeout, scheduleIdleReset]
  );

  useEffect(() => {
    return () => {
      clearIdleTimeout();
    };
  }, [clearIdleTimeout]);

  useEffect(() => {
    if (spinCounter !== lastObservedSpinRef.current) {
      lastObservedSpinRef.current = spinCounter;
      lastAnnouncedSpinRef.current = null;
      applyDisplayState(createBlankDisplayState(), { scheduleIdle: false });
    }
  }, [applyDisplayState, spinCounter]);

  useEffect(() => {
    if (isSpinning || !lastResult) {
      return;
    }

    if (lastAnnouncedSpinRef.current === lastObservedSpinRef.current) {
      return;
    }

    lastAnnouncedSpinRef.current = lastObservedSpinRef.current;

    if (lastResult.totalPayout > 0) {
      applyDisplayState(createWinDisplayState(lastResult.totalPayout), {
        scheduleIdle: true
      });
    } else {
      applyDisplayState(createLossDisplayState(), { scheduleIdle: true });
    }
  }, [applyDisplayState, isSpinning, lastResult]);

  return (
    <DotMatrixDisplay
      geometry={geometry}
      material={material}
      position={position}
      message={displayState.message}
      animationMode={displayState.animationMode}
      scrollSpeed={displayState.scrollSpeed}
      verticalScrollSpeed={displayState.verticalScrollSpeed}
      sineWaveAmplitude={displayState.sineWaveAmplitude}
      sineWaveFrequency={displayState.sineWaveFrequency}
      sineWaveSpeed={displayState.sineWaveSpeed}
      effect={displayState.effect}
      effectIntensity={displayState.effectIntensity}
      wipeSpeed={displayState.wipeSpeed}
      doubleCharacterResolution
    />
  );
};

export const CabinetMeshes = ({
  geometry,
  materials,
  layout,
  reelIds,
  reelGap,
  originOffset,
  ...groupProps
}: CabinetMeshesProps) => {
  return (
    <group name="cabinet" {...groupProps}>
      <Cabinet geometry={geometry} materials={materials} layout={layout} />
      <ReactiveDotMatrixDisplay
        geometry={geometry.dotMatrix}
        material={materials.dotMatrixMaterial}
        position={[0, layout.topDisplayY, layout.dotMatrixZ]}
      />
      <CabinetButtonPanel
        geometry={geometry}
        materials={materials}
        layout={layout}
        reelIds={reelIds}
        reelGap={reelGap}
        originOffset={originOffset}
      />
    </group>
  );
};
