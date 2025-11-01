import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial
} from "three";
import type { FruitMachineConfig } from "@game/core/fruitMachineConfig";
import { ReelColumn } from "@game/entities/ReelColumn";
import {
  CabinetMeshes,
  type CabinetGeometryBundle,
  type CabinetMaterials,
  type CabinetLayout
} from "./CabinetMeshes";

type MaterialBundle = CabinetMaterials & {
  coreMaterial: MeshStandardMaterial;
  dividerMaterial: MeshStandardMaterial;
  winLineMaterial: MeshStandardMaterial;
};

type ReelAssemblyGroupProps = {
  config: FruitMachineConfig;
  reelIds: string[];
  materials: MaterialBundle;
};

export const ReelAssemblyGroup = ({
  config,
  reelIds,
  materials
}: ReelAssemblyGroupProps) => {
  const { reelGap } = config;
  const totalWidth = (reelIds.length - 1) * reelGap;
  const originOffset = totalWidth / 2;
  const reelCoreRadius = config.reelRadius * 0.8;
  const reelCoreLength = totalWidth + reelGap;
  const dividerRadius = reelCoreRadius * 1.05;
  const dividerLength = reelGap * 0.1;
  const winLineRadius = config.reelRadius * 0.03;
  const winLineLength = reelCoreLength;
  const winLineDepth = config.reelRadius + config.itemScale * 0.35;
  const reelAssemblyYOffset = -1 + config.reelRadius + config.itemScale * 0.25;

  const dividerPositions = useMemo(() => {
    if (reelIds.length < 2) {
      return [];
    }

    const count = reelIds.length - 1;
    const offset = ((reelIds.length - 1) * reelGap) / 2;

    return Array.from({ length: count }, (_, index) =>
      index * reelGap - offset + reelGap / 2
    );
  }, [reelGap, reelIds.length]);

  const winLineOffsets = useMemo(
    () => [config.reelRadius * 0.65, config.reelRadius * -0.65],
    [config.reelRadius]
  );

  const frameThickness = Math.max(config.itemScale * 0.5, 0.35);
  const topPanelThickness = frameThickness;
  const bottomPanelThickness = frameThickness * 1.2;
  const backPanelDepth = Math.max(config.itemScale * 0.85, 0.45);
  const frontFrameDepth = Math.max(config.itemScale * 0.7, 0.35);
  const cabinetInnerWidth = reelCoreLength + reelGap * 0.4;
  const cabinetOuterWidth = cabinetInnerWidth + frameThickness * 2;
  const cabinetHeight = config.reelRadius * 2.8;
  const cabinetHalfHeight = cabinetHeight / 2;
  const topDisplayHeight = Math.max(config.itemScale * 5, 0.6);
  const topDisplayDepth = Math.max(frontFrameDepth * 1.15, 0.45);
  const topDisplayWidth = cabinetInnerWidth * 0.85;
  const windowPadding = config.itemScale * 0.5;
  const rawWindowTop = winLineOffsets[0] + windowPadding;
  const rawWindowBottom = winLineOffsets[1] - windowPadding;
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
  const topSectionHeight = Math.max(cabinetHalfHeight - windowTop, frameThickness);
  const bottomSectionHeight = Math.max(
    windowBottom + cabinetHalfHeight,
    frameThickness
  );
  const topBarY = windowTop + topSectionHeight / 2;
  const bottomBarY = -cabinetHalfHeight + bottomSectionHeight / 2;
  const cabinetFrontZ = winLineDepth - frontFrameDepth * 0.5 - config.itemScale * 0.05;
  const frontOuterZ = cabinetFrontZ + frontFrameDepth / 2;
  const rearClearance = config.itemScale * 0.9;
  const cabinetBackZ = -config.reelRadius - rearClearance - backPanelDepth / 2;
  const backOuterZ = cabinetBackZ - backPanelDepth / 2;
  const cabinetDepth = frontOuterZ - backOuterZ;
  const cabinetCenterZ = backOuterZ + cabinetDepth / 2;
  const lowerCabinetHeight = cabinetHeight * 2;
  const lowerCabinetWidth = cabinetOuterWidth * 1.05;
  const lowerCabinetDepth = cabinetDepth * 1.1;
  const lowerCabinetCenterY =
    -cabinetHalfHeight - bottomPanelThickness - lowerCabinetHeight / 2;
  const lowerCabinetCenterZ = cabinetCenterZ;
  const topDisplayY =
    cabinetHalfHeight + topPanelThickness + topDisplayHeight / 2;
  const topDisplayZ = frontOuterZ - topDisplayDepth / 2;
  const buttonPanelWidth = cabinetInnerWidth * 0.92;
  const buttonPanelThickness = Math.max(frameThickness * 0.6, 0.24);
  const buttonPanelDepth = Math.max(frontFrameDepth * 1.6, 0.5);
  const buttonPanelLength = buttonPanelDepth * 3;
  const buttonPanelTilt = Math.PI / 6;
  const buttonPanelPivotY =
    bottomBarY - bottomSectionHeight * 0.5 + buttonPanelThickness * 3;
  const buttonPanelPivotZ = frontOuterZ;
  const dotMatrixWidth = topDisplayWidth * 0.9;
  const dotMatrixHeight = topDisplayHeight * 0.75;
  const dotMatrixDepth = Math.max(topDisplayDepth * 0.6, 0.18);
  const dotMatrixZ =
    topDisplayZ +
    topDisplayDepth / 2 -
    dotMatrixDepth / 2 +
    dotMatrixDepth * 0.2;
  const buttonPanelFrontZ = buttonPanelDepth / 2 + buttonPanelLength / 2;
  const buttonPanelBackZ = buttonPanelDepth / 2 - buttonPanelLength / 2;
  const holdButtonSize = Math.max(config.itemScale * 0.8, 0.4);
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
  const holdButtonY = buttonPanelThickness / 2 + holdButtonHeight / 2;
  const actionButtonY = buttonPanelThickness / 2 + actionButtonHeight / 2;
  const collectButtonX = -buttonPanelWidth / 2 + actionButtonSize * 0.7;
  const spinButtonX = buttonPanelWidth / 2 - spinButtonSize * 0.7;

  const geometries = useMemo(() => {
    return {
      reelCore: new CylinderGeometry(
        reelCoreRadius,
        reelCoreRadius,
        reelCoreLength,
        64
      ),
      divider: new CylinderGeometry(
        dividerRadius,
        dividerRadius,
        dividerLength,
        64
      ),
      winLine: new CylinderGeometry(
        winLineRadius,
        winLineRadius,
        winLineLength,
        48
      ),
      topPanel: new BoxGeometry(cabinetOuterWidth, topPanelThickness, cabinetDepth),
      bottomPanel: new BoxGeometry(
        cabinetOuterWidth,
        bottomPanelThickness,
        cabinetDepth
      ),
      sidePanel: new BoxGeometry(
        frameThickness,
        cabinetHeight + topPanelThickness + bottomPanelThickness,
        cabinetDepth
      ),
      backPanel: new BoxGeometry(cabinetInnerWidth, cabinetHeight, backPanelDepth),
      topFrontFrame: new BoxGeometry(
        cabinetInnerWidth,
        topSectionHeight,
        frontFrameDepth
      ),
      bottomFrontFrame: new BoxGeometry(
        cabinetInnerWidth,
        bottomSectionHeight,
        frontFrameDepth
      ),
      sideFrontFrame: new BoxGeometry(
        frameThickness,
        cabinetHeight,
        frontFrameDepth
      ),
      topDisplay: new BoxGeometry(
        cabinetInnerWidth,
        topDisplayHeight,
        topDisplayDepth
      ),
      dotMatrix: new BoxGeometry(dotMatrixWidth, dotMatrixHeight, dotMatrixDepth),
      lowerCabinet: new BoxGeometry(
        lowerCabinetWidth,
        lowerCabinetHeight,
        lowerCabinetDepth
      ),
      buttonPanelSurface: new BoxGeometry(
        buttonPanelWidth,
        buttonPanelThickness,
        buttonPanelLength
      ),
      holdButton: new BoxGeometry(holdButtonSize, holdButtonHeight, holdButtonSize),
      actionButton: new BoxGeometry(
        actionButtonSize,
        actionButtonHeight,
        actionButtonSize
      ),
      spinButton: new BoxGeometry(spinButtonSize, spinButtonHeight, spinButtonSize)
    } as const;
  }, [
    actionButtonHeight,
    actionButtonSize,
    backPanelDepth,
    bottomPanelThickness,
    bottomSectionHeight,
    buttonPanelLength,
    buttonPanelThickness,
    buttonPanelWidth,
    cabinetDepth,
    cabinetHeight,
    cabinetInnerWidth,
    cabinetOuterWidth,
    dividerLength,
    dividerRadius,
    dotMatrixDepth,
    dotMatrixHeight,
    dotMatrixWidth,
    frontFrameDepth,
    frameThickness,
    holdButtonHeight,
    holdButtonSize,
    lowerCabinetDepth,
    lowerCabinetHeight,
    lowerCabinetWidth,
    reelCoreLength,
    reelCoreRadius,
    spinButtonHeight,
    spinButtonSize,
    topDisplayDepth,
    topDisplayHeight,
    topPanelThickness,
    topSectionHeight,
    winLineLength,
    winLineRadius
  ]);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((geometry) => geometry.dispose());
    };
  }, [geometries]);

  const cabinetGeometry: CabinetGeometryBundle = {
    topPanel: geometries.topPanel,
    bottomPanel: geometries.bottomPanel,
    sidePanel: geometries.sidePanel,
    backPanel: geometries.backPanel,
    topFrontFrame: geometries.topFrontFrame,
    bottomFrontFrame: geometries.bottomFrontFrame,
    sideFrontFrame: geometries.sideFrontFrame,
    topDisplay: geometries.topDisplay,
    dotMatrix: geometries.dotMatrix,
    lowerCabinet: geometries.lowerCabinet,
    buttonPanelSurface: geometries.buttonPanelSurface,
    holdButton: geometries.holdButton,
    actionButton: geometries.actionButton,
    spinButton: geometries.spinButton
  };

  const cabinetLayout: CabinetLayout = {
    cabinetCenterZ,
    cabinetBackZ,
    cabinetFrontZ,
    cabinetHalfHeight,
    topPanelThickness,
    bottomPanelThickness,
    frameThickness,
    cabinetInnerWidth,
    cabinetHeight,
    topBarY,
    bottomBarY,
    topSectionHeight,
    bottomSectionHeight,
    buttonPanelPivotY,
    buttonPanelPivotZ,
    buttonPanelThickness,
    buttonPanelDepth,
    buttonPanelTilt,
    topDisplayY,
    topDisplayZ,
    dotMatrixZ,
    lowerCabinetCenterY,
    lowerCabinetCenterZ,
    holdButtonY,
    holdRowZ,
    actionButtonY,
    actionRowZ,
    collectButtonX,
    spinButtonX
  };

  return (
    <group position={[0, reelAssemblyYOffset, 0]}>
      <mesh
        geometry={geometries.reelCore}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
        material={materials.coreMaterial}
      />
      {dividerPositions.map((xPosition, index) => (
        <mesh
          key={`divider-${index}`}
          geometry={geometries.divider}
          position={[xPosition, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
          receiveShadow
          material={materials.dividerMaterial}
        />
      ))}
      {winLineOffsets.map((yOffset, index) => (
        <mesh
          key={`win-line-${index}`}
          geometry={geometries.winLine}
          position={[0, yOffset, winLineDepth]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
          material={materials.winLineMaterial}
        />
      ))}
      <CabinetMeshes
        geometry={cabinetGeometry}
        materials={materials}
        layout={cabinetLayout}
        reelIds={reelIds}
        reelGap={reelGap}
        originOffset={originOffset}
      />
      {reelIds.map((reelId, index) => (
        <ReelColumn
          key={reelId}
          reelId={reelId}
          position={[index * reelGap - originOffset, 0, 0]}
        />
      ))}
    </group>
  );
};
