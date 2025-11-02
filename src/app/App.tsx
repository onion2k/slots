import { Canvas, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject
} from "react";
import "@styles/app.css";
import { FruitMachineScene } from "@game/scene/FruitMachineScene";
import { Environment, OrbitControls } from "@react-three/drei";
import {
  Bloom,
  EffectComposer,
  Noise,
  SSAO,
  Vignette
} from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { FruitMachineConfig } from "@game/core/fruitMachineConfig";
import { useSlotsStore } from "@game/state/slotsStore";
import { Color, FogExp2 } from "three";

interface TopHalfMetrics {
  topHalfCenterWorldY: number;
  topHalfHeight: number;
  topHalfTopWorldY: number;
  topHalfBottomWorldY: number;
  topHalfHalfWidth: number;
}

const computeTopHalfMetrics = (config: FruitMachineConfig): TopHalfMetrics => {
  const { reelRadius, itemScale, reelGap, reels } = config;

  const reelAssemblyYOffset = -1 + reelRadius + itemScale * 0.25;

  const frameThickness = Math.max(itemScale * 0.5, 0.35);
  const topPanelThickness = frameThickness;
  const cabinetHeight = reelRadius * 2.8;
  const cabinetHalfHeight = cabinetHeight / 2;
  const topDisplayHeight = Math.max(itemScale * 5, 0.6);
  const frontFrameDepth = Math.max(itemScale * 0.7, 0.35);
  const windowPadding = itemScale * 0.5;
  const winLineOffset = reelRadius * 0.65;
  const rawWindowTop = winLineOffset + windowPadding;
  const rawWindowBottom = -winLineOffset - windowPadding;

  let windowTop = Math.min(
    rawWindowTop,
    cabinetHalfHeight - frameThickness
  );
  let windowBottom = Math.max(
    rawWindowBottom,
    -cabinetHalfHeight + frameThickness
  );

  if (windowTop <= windowBottom) {
    const midpoint = (windowTop + windowBottom) / 2;
    windowTop = midpoint + frameThickness * 0.5;
    windowBottom = midpoint - frameThickness * 0.5;
  }

  const bottomSectionHeight = Math.max(
    windowBottom + cabinetHalfHeight,
    frameThickness
  );

  const bottomBarY = -cabinetHalfHeight + bottomSectionHeight / 2;
  const topDisplayY =
    cabinetHalfHeight + topPanelThickness + topDisplayHeight / 2;
  const buttonPanelThickness = Math.max(frameThickness * 0.6, 0.24);
  const buttonPanelDepth = Math.max(frontFrameDepth * 1.6, 0.5);
  const buttonPanelLength = buttonPanelDepth * 3;
  const buttonPanelFrontZ = buttonPanelDepth / 2 + buttonPanelLength / 2;
  const buttonPanelBackZ = buttonPanelDepth / 2 - buttonPanelLength / 2;
  const buttonPanelTilt = Math.PI / 6;
  const buttonPanelPivotY =
    bottomBarY - bottomSectionHeight * 0.5 + buttonPanelThickness * 3;
  const dotMatrixHeight = topDisplayHeight * 0.75;

  const safeReelCount = Math.max(reels.length, 1);
  const totalWidth = (safeReelCount - 1) * reelGap;
  const originOffset = totalWidth / 2;
  const reelCoreLength = totalWidth + reelGap;
  const cabinetSideClearance = Math.max(frameThickness * 0.35, reelGap * 0.1);
  const cabinetInnerWidth = reelCoreLength + cabinetSideClearance * 2;
  const topDisplayWidth = cabinetInnerWidth;
  const buttonPanelWidth = cabinetInnerWidth;

  const holdButtonSize = Math.max(itemScale * 0.8, 0.4);
  const holdButtonHeight = holdButtonSize * 0.32;
  const actionButtonSize = holdButtonSize * 1.3;
  const actionButtonHeight = actionButtonSize * 0.34;
  const spinButtonSize = actionButtonSize * 1.15;
  const spinButtonHeight = spinButtonSize * 0.36;
  const actionRowZ = buttonPanelFrontZ - spinButtonSize * 0.6;
  const holdRowZ = Math.max(
    buttonPanelBackZ + holdButtonSize * 0.55,
    actionRowZ - (spinButtonSize + holdButtonSize) * 0.75
  );

  const topHalfTop = topDisplayY + dotMatrixHeight / 2;
  const cosTilt = Math.cos(buttonPanelTilt);
  const sinTilt = Math.sin(buttonPanelTilt);

  const holdButtonTopLocalY = buttonPanelThickness / 2 + holdButtonHeight;
  const actionButtonsTopLocalY = buttonPanelThickness / 2 + Math.max(
    actionButtonHeight,
    spinButtonHeight
  );

  const holdButtonTopWorldY =
    buttonPanelPivotY + holdButtonTopLocalY * cosTilt - holdRowZ * sinTilt;
  const actionButtonsTopWorldY =
    buttonPanelPivotY + actionButtonsTopLocalY * cosTilt - actionRowZ * sinTilt;

  const topHalfBottom = Math.max(holdButtonTopWorldY, actionButtonsTopWorldY);
  const topHalfTopWorld = reelAssemblyYOffset + topHalfTop;
  const topHalfBottomWorld = reelAssemblyYOffset + topHalfBottom;
  const baseTopHalfHeight = Math.max(topHalfTopWorld - topHalfBottomWorld, 0.1);
  const extraMargin = baseTopHalfHeight * 0.1 + 0.4;
  const adjustedBottom = topHalfBottomWorld - extraMargin * 0.25;
  const adjustedTop = topHalfTopWorld + extraMargin * 0.75;
  const topHalfHeight = Math.max(adjustedTop - adjustedBottom, 0.1);
  const topHalfCenterWorldY = adjustedBottom + topHalfHeight / 2;
  const holdButtonsHalfSpan = originOffset + holdButtonSize / 2;
  const collectButtonX = -buttonPanelWidth / 2 + actionButtonSize * 0.7;
  const spinButtonX = buttonPanelWidth / 2 - spinButtonSize * 0.7;
  const buttonPanelHalfExtent = Math.max(
    buttonPanelWidth / 2,
    Math.abs(collectButtonX) + actionButtonSize / 2,
    Math.abs(spinButtonX) + spinButtonSize / 2
  );
  const topHalfHalfWidth = Math.max(
    topDisplayWidth / 2,
    holdButtonsHalfSpan,
    buttonPanelHalfExtent
  );

  return {
    topHalfCenterWorldY,
    topHalfHeight,
    topHalfTopWorldY: adjustedTop,
    topHalfBottomWorldY: adjustedBottom,
    topHalfHalfWidth
  };
};

const App = () => {
  const config = useSlotsStore((state) => state.config);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const backgroundColor = useMemo(() => new Color("#0b111c"), []);

  return (
    <div className="app-shell">
      <Canvas
        className="app-canvas"
        camera={{ position: [0, 2, 30], fov: 50, near: 0.1, far: 150 }}
        shadows
      >
        <SceneAtmosphere color={backgroundColor} />
        <Suspense fallback={null}>
          <Environment preset="warehouse" />
          <FruitMachineScene />
        </Suspense>
        <ResponsiveCameraRig controlsRef={controlsRef} config={config} />
        <SceneEffects />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
};

type ResponsiveCameraRigProps = {
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
  config: FruitMachineConfig;
};

const SceneAtmosphere = ({ color }: { color: Color }) => {
  const { scene } = useThree();

  useEffect(() => {
    const previous = scene.background;
    const previousFog = scene.fog;
    scene.background = color;
    scene.fog = new FogExp2(color.clone().multiplyScalar(0.9), 0.045);
    return () => {
      scene.background = previous;
      scene.fog = previousFog ?? null;
    };
  }, [color, scene]);

  return null;
};

const SceneEffects = () => {
  return (
    <EffectComposer multisampling={0}>
      <SSAO radius={0.25} intensity={32} luminanceInfluence={0.4} />
      <Bloom
        intensity={0.7}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.45}
        mipmapBlur
      />
      <Noise premultiply opacity={0.08} />
      <Vignette eskil offset={0.2} darkness={0.75} />
    </EffectComposer>
  );
};

const ResponsiveCameraRig = ({ controlsRef, config }: ResponsiveCameraRigProps) => {
  const { camera, size } = useThree();
  const metrics = useMemo(() => computeTopHalfMetrics(config), [config]);

  useEffect(() => {
    const { width, height } = size;
    const isMobileWidth = width <= 768;
    const isShortViewport = height <= 680;
    const isCompact = isMobileWidth || isShortViewport;

    const marginMultiplier = isCompact ? 1.75 : 1.2;
    const fov = isCompact ? 58 : 50;
    const fovRadians = (fov * Math.PI) / 180;
    const halfHeight = (metrics.topHalfHeight * marginMultiplier) / 2;
    const requiredRadiusHeight = halfHeight / Math.tan(fovRadians / 2);
    const aspect = width / height || 1;
    const horizontalTan = Math.tan(fovRadians / 2) * aspect;
    const halfWidth = (metrics.topHalfHalfWidth * marginMultiplier);
    const requiredRadiusWidth =
      horizontalTan > 0 ? halfWidth / horizontalTan : Number.POSITIVE_INFINITY;
    const requiredRadius = Math.max(requiredRadiusHeight, requiredRadiusWidth);
    const minRadius = isCompact ? 20 : 20;
    const maxRadius = 32;
    const orbitRadius = Math.min(Math.max(requiredRadius, minRadius), maxRadius);

    const verticalOffset = Math.min(
      orbitRadius * (isCompact ? 0.18 : 0.14),
      isCompact ? 2.2 : 1.8
    );
    const zDistance = Math.sqrt(
      Math.max(orbitRadius * orbitRadius - verticalOffset * verticalOffset, 1)
    );
    const compactTargetY = Math.max(
      metrics.topHalfBottomWorldY + metrics.topHalfHeight * 0.24,
      1.4
    );
    const desktopTargetY = Math.max(
      metrics.topHalfBottomWorldY + metrics.topHalfHeight * 0.22,
      1.9
    );
    const targetBase = isCompact ? compactTargetY : desktopTargetY;
    const targetAdjustment = isCompact ? -0.35 : -0.55;
    const targetY = Math.max(targetBase + targetAdjustment, 1.1);

    camera.position.set(0, targetY + verticalOffset, zDistance);
    camera.fov = fov;
    camera.updateProjectionMatrix();

    const controls = controlsRef.current;
    if (controls) {
      controls.target.set(0, targetY, 0);
      controls.minDistance = orbitRadius;
      controls.maxDistance = orbitRadius;
      controls.update();
    }
  }, [camera, controlsRef, metrics, size]);

  return null;
};

export default App;
