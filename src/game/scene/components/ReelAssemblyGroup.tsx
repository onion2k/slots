import { useEffect, useMemo } from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  type MeshStandardMaterial
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
  const { reelGap, reelRadius, itemScale } = config;
  const reelCount = reelIds.length;

  const assemblyLayout = useMemo(() => {
    const totalWidth = (reelCount - 1) * reelGap;
    const originOffset = totalWidth / 2;
    const reelAssemblyYOffset = -1 + reelRadius + itemScale * 0.25;

    const coreRadius = reelRadius * 0.8;
    const coreLength = totalWidth + reelGap;
    const dividerRadius = coreRadius * 1.05;
    const dividerLength = reelGap * 0.1;
    const dividerPositions =
      reelCount < 2
        ? []
        : Array.from({ length: reelCount - 1 }, (_, index) =>
            index * reelGap - originOffset + reelGap / 2
          );

    const winLineOffsets = [reelRadius * 0.65, reelRadius * -0.65];
    const winLineRadius = reelRadius * 0.03;
    const winLineDepth = reelRadius + itemScale * 0.35;

    const frameThickness = Math.max(itemScale * 0.5, 0.35);
    const topPanelThickness = frameThickness;
    const bottomPanelThickness = frameThickness * 1.2;
    const backPanelDepth = Math.max(itemScale * 0.85, 0.45);
    const frontFrameDepth = Math.max(itemScale * 0.7, 0.35);
    const cabinetSideClearance = Math.max(frameThickness * 0.35, reelGap * 0.1);
    const cabinetInnerWidth = coreLength + cabinetSideClearance * 2;
    const cabinetOuterWidth = cabinetInnerWidth + frameThickness * 2;
    const cabinetHeight = reelRadius * 2.8;
    const cabinetHalfHeight = cabinetHeight / 2;

    const windowPadding = itemScale * 0.5;
    const rawWindowTop = winLineOffsets[0] + windowPadding;
    const rawWindowBottom = winLineOffsets[1] - windowPadding;
    let windowTop = Math.min(rawWindowTop, cabinetHalfHeight - frameThickness);
    let windowBottom = Math.max(rawWindowBottom, -cabinetHalfHeight + frameThickness);

    if (windowTop <= windowBottom) {
      const midpoint = (windowTop + windowBottom) / 2;
      windowTop = midpoint + frameThickness * 0.5;
      windowBottom = midpoint - frameThickness * 0.5;
    }

    const topSectionHeight = Math.max(cabinetHalfHeight - windowTop, frameThickness);
    const bottomSectionHeight = Math.max(windowBottom + cabinetHalfHeight, frameThickness);
    const topBarY = windowTop + topSectionHeight / 2;
    const bottomBarY = -cabinetHalfHeight + bottomSectionHeight / 2;

    const cabinetFrontZ = winLineDepth - frontFrameDepth * 0.5 - itemScale * 0.05;
    const frontOuterZ = cabinetFrontZ + frontFrameDepth / 2;
    const rearClearance = itemScale * 0.9;
    const cabinetBackZ = -reelRadius - rearClearance - backPanelDepth / 2;
    const backOuterZ = cabinetBackZ - backPanelDepth / 2;
    const cabinetDepth = frontOuterZ - backOuterZ;
    const cabinetCenterZ = backOuterZ + cabinetDepth / 2;

    const lowerCabinetHeight = cabinetHeight * 2;
    const lowerCabinetWidth = cabinetOuterWidth * 1.05;
    const lowerCabinetDepth = cabinetDepth * 1.1;
    const lowerCabinetCenterY =
      -cabinetHalfHeight - bottomPanelThickness - lowerCabinetHeight / 2;
    const lowerCabinetCenterZ = cabinetCenterZ;

    const topDisplayHeight = Math.max(itemScale * 5, 0.6);
    const topDisplayDepth = Math.max(frontFrameDepth * 1.15, 0.45);
    const topDisplayY = cabinetHalfHeight + topPanelThickness + topDisplayHeight / 2;
    const topDisplayZ = frontOuterZ - topDisplayDepth / 2;

    const dotMatrixWidth = cabinetInnerWidth;
    const dotMatrixHeight = topDisplayHeight * 0.75;
    const dotMatrixDepth = Math.max(topDisplayDepth * 0.6, 0.18);
    const dotMatrixZ =
      topDisplayZ +
      topDisplayDepth / 2 -
      dotMatrixDepth / 2;
    const topFrontFrameTopY = topBarY + topSectionHeight / 2;
    const dotMatrixBottomY = topDisplayY - dotMatrixHeight / 2;
    const dotMatrixSupportGap = Math.min(frameThickness * 0.25, 0.1);
    const rawDotMatrixSupportHeight =
      dotMatrixBottomY - dotMatrixSupportGap - topFrontFrameTopY;
    const dotMatrixSupportHeight = Math.max(
      rawDotMatrixSupportHeight,
      frameThickness * 0.4
    );
    const dotMatrixSupportY = topFrontFrameTopY + dotMatrixSupportHeight;
    const dotMatrixSupportRadius = Math.max(frameThickness * 0.25, itemScale * 0.12);
    const dotMatrixSupportClearanceX = frameThickness;
    const dotMatrixSupportOffsetX = Math.max(
      dotMatrixWidth / 2 - dotMatrixSupportRadius - dotMatrixSupportClearanceX,
      frameThickness * 0.5
    );
    const dotMatrixSupportZ =
      dotMatrixZ - dotMatrixDepth / 2 + dotMatrixSupportRadius * 2;

    const winLineLength = cabinetInnerWidth;
    const winLineBackOffset = Math.min(frontFrameDepth * 0.25, itemScale * 0.12);

    const buttonPanelWidth = cabinetInnerWidth;
    const buttonPanelThickness = Math.max(frameThickness * 0.6, 0.24);
    const buttonPanelDepth = Math.max(frontFrameDepth * 1.6, 0.5);
    const buttonPanelLength = buttonPanelDepth * 3;
    const buttonPanelTilt = Math.PI / 6;
    const buttonPanelPivotY =
      bottomBarY - bottomSectionHeight * 0.5 + buttonPanelThickness * 3;
    const buttonPanelPivotZ = frontOuterZ;

    const holdButtonSize = Math.max(itemScale * 0.8, 0.4);
    const holdButtonHeight = holdButtonSize * 0.32;
    const holdButtonY = buttonPanelThickness / 2 + holdButtonHeight / 2;

    const actionButtonSize = holdButtonSize * 1.3;
    const actionButtonHeight = actionButtonSize * 0.34;
    const actionButtonWidth = actionButtonSize * 2;
    const actionButtonY = buttonPanelThickness / 2 + actionButtonHeight / 2;

    const spinButtonSize = actionButtonSize * 1.15;
    const spinButtonHeight = spinButtonSize * 0.36;
    const spinButtonWidth = spinButtonSize * 2;

    const buttonPanelFrontZ = buttonPanelDepth / 2 + buttonPanelLength / 2;
    const buttonPanelBackZ = buttonPanelDepth / 2 - buttonPanelLength / 2;
    const actionRowZ = buttonPanelFrontZ - spinButtonSize * 0.6;
    const holdRowZ = Math.max(
      buttonPanelBackZ + holdButtonSize * 0.55,
      actionRowZ - (spinButtonSize + holdButtonSize) * 0.75
    );

    const spinButtonMargin = spinButtonSize * 0.2;
    const spinButtonX = buttonPanelWidth / 2 - (spinButtonMargin + spinButtonWidth / 2);

    const spinDisplayWidth = spinButtonWidth * 1.1;
    const spinDisplayHeight = spinButtonHeight * 1.6;
    const spinDisplayDepth = spinButtonSize * 0.36;
    const spinDisplayMargin = spinButtonSize * 0.18;
    const spinDisplayX =
      spinButtonX - (spinButtonWidth / 2 + spinDisplayMargin + spinDisplayWidth / 2);
    const spinDisplayY = actionButtonY + spinDisplayHeight * 0.1;
    const spinDisplayZ = actionRowZ;

    return {
      reel: {
        originOffset,
        assemblyYOffset: reelAssemblyYOffset,
        core: {
          radius: coreRadius,
          length: coreLength
        },
        dividers: {
          radius: dividerRadius,
          length: dividerLength,
          positions: dividerPositions
        }
      },
      winLines: {
        offsets: winLineOffsets,
        radius: winLineRadius,
        depth: winLineDepth,
        length: winLineLength,
        backOffset: winLineBackOffset
      },
      cabinet: {
        frameThickness,
        topPanelThickness,
        bottomPanelThickness,
        backPanelDepth,
        frontFrameDepth,
        innerWidth: cabinetInnerWidth,
        outerWidth: cabinetOuterWidth,
        height: cabinetHeight,
        halfHeight: cabinetHalfHeight,
        depth: cabinetDepth,
        topSectionHeight,
        bottomSectionHeight,
        topBarY,
        bottomBarY,
        centerZ: cabinetCenterZ,
        backZ: cabinetBackZ,
        frontZ: cabinetFrontZ
      },
      display: {
        top: {
          height: topDisplayHeight,
          depth: topDisplayDepth,
          y: topDisplayY,
          z: topDisplayZ
        },
        dotMatrix: {
          width: dotMatrixWidth,
          height: dotMatrixHeight,
          depth: dotMatrixDepth,
          z: dotMatrixZ
        },
        support: {
          radius: dotMatrixSupportRadius,
          height: dotMatrixSupportHeight,
          offsetX: dotMatrixSupportOffsetX,
          y: dotMatrixSupportY,
          z: dotMatrixSupportZ
        }
      },
      lowerCabinet: {
        width: lowerCabinetWidth,
        height: lowerCabinetHeight,
        depth: lowerCabinetDepth,
        centerY: lowerCabinetCenterY,
        centerZ: lowerCabinetCenterZ
      },
      buttons: {
        panel: {
          width: buttonPanelWidth,
          thickness: buttonPanelThickness,
          depth: buttonPanelDepth,
          length: buttonPanelLength,
          tilt: buttonPanelTilt,
          pivotY: buttonPanelPivotY,
          pivotZ: buttonPanelPivotZ
        },
        hold: {
          size: holdButtonSize,
          height: holdButtonHeight,
          y: holdButtonY,
          rowZ: holdRowZ
        },
        action: {
          size: actionButtonSize,
          height: actionButtonHeight,
          width: actionButtonWidth,
          y: actionButtonY,
          rowZ: actionRowZ
        },
        spin: {
          size: spinButtonSize,
          height: spinButtonHeight,
          width: spinButtonWidth,
          x: spinButtonX
        },
        spinDisplay: {
          width: spinDisplayWidth,
          height: spinDisplayHeight,
          depth: spinDisplayDepth,
          x: spinDisplayX,
          y: spinDisplayY,
          z: spinDisplayZ
        }
      }
    } as const;
  }, [itemScale, reelCount, reelGap, reelRadius]);

  const geometries = useMemo(() => {
    const { reel, winLines, cabinet, display, lowerCabinet, buttons } = assemblyLayout;

    return {
      reelCore: new CylinderGeometry(
        reel.core.radius,
        reel.core.radius,
        reel.core.length,
        64
      ),
      divider: new CylinderGeometry(
        reel.dividers.radius,
        reel.dividers.radius,
        reel.dividers.length,
        64
      ),
      winLine: new CylinderGeometry(
        winLines.radius,
        winLines.radius,
        winLines.length,
        48
      ),
      topPanel: new BoxGeometry(
        cabinet.outerWidth,
        cabinet.topPanelThickness,
        cabinet.depth
      ),
      bottomPanel: new BoxGeometry(
        cabinet.outerWidth,
        cabinet.bottomPanelThickness,
        cabinet.depth
      ),
      sidePanel: new BoxGeometry(
        cabinet.frameThickness,
        cabinet.height + cabinet.topPanelThickness + cabinet.bottomPanelThickness,
        cabinet.depth
      ),
      backPanel: new BoxGeometry(
        cabinet.innerWidth,
        cabinet.height,
        cabinet.backPanelDepth
      ),
      topFrontFrame: new BoxGeometry(
        cabinet.innerWidth,
        cabinet.topSectionHeight,
        cabinet.frontFrameDepth
      ),
      bottomFrontFrame: new BoxGeometry(
        cabinet.innerWidth,
        cabinet.bottomSectionHeight,
        cabinet.frontFrameDepth
      ),
      sideFrontFrame: new BoxGeometry(
        cabinet.frameThickness,
        cabinet.height,
        cabinet.frontFrameDepth
      ),
      dotMatrix: new BoxGeometry(
        display.dotMatrix.width,
        display.dotMatrix.height,
        display.dotMatrix.depth
      ),
      dotMatrixSupport: new CylinderGeometry(
        display.support.radius,
        display.support.radius,
        display.support.height,
        48
      ),
      lowerCabinet: new BoxGeometry(
        lowerCabinet.width,
        lowerCabinet.height,
        lowerCabinet.depth
      ),
      buttonPanelSurface: new BoxGeometry(
        buttons.panel.width,
        buttons.panel.thickness,
        buttons.panel.length
      ),
      holdButton: new BoxGeometry(
        buttons.hold.size,
        buttons.hold.height,
        buttons.hold.size
      ),
      spinButton: new BoxGeometry(
        buttons.spin.width,
        buttons.spin.height,
        buttons.spin.size
      ),
      spinDisplay: new BoxGeometry(
        buttons.spinDisplay.width,
        buttons.spinDisplay.height,
        buttons.spinDisplay.depth
      )
    } as const;
  }, [assemblyLayout]);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((geometry) => geometry.dispose());
    };
  }, [geometries]);

  const { reel, winLines, cabinet, display, lowerCabinet, buttons } = assemblyLayout;
  const { positions: dividerPositions } = reel.dividers;
  const originOffset = reel.originOffset;
  const reelAssemblyYOffset = reel.assemblyYOffset;
  const winLineOffsets = winLines.offsets;
  const winLineDepth = winLines.depth;
  const winLineBackOffset = winLines.backOffset;

  const cabinetGeometry: CabinetGeometryBundle = {
    topPanel: geometries.topPanel,
    bottomPanel: geometries.bottomPanel,
    sidePanel: geometries.sidePanel,
    backPanel: geometries.backPanel,
    topFrontFrame: geometries.topFrontFrame,
    bottomFrontFrame: geometries.bottomFrontFrame,
    sideFrontFrame: geometries.sideFrontFrame,
    dotMatrix: geometries.dotMatrix,
    dotMatrixSupport: geometries.dotMatrixSupport,
    lowerCabinet: geometries.lowerCabinet,
    buttonPanelSurface: geometries.buttonPanelSurface,
    holdButton: geometries.holdButton,
    spinButton: geometries.spinButton,
    spinDisplay: geometries.spinDisplay
  };

  const cabinetLayout: CabinetLayout = {
    cabinetCenterZ: cabinet.centerZ,
    cabinetBackZ: cabinet.backZ,
    cabinetFrontZ: cabinet.frontZ,
    cabinetHalfHeight: cabinet.halfHeight,
    topPanelThickness: cabinet.topPanelThickness,
    bottomPanelThickness: cabinet.bottomPanelThickness,
    frameThickness: cabinet.frameThickness,
    cabinetInnerWidth: cabinet.innerWidth,
    cabinetHeight: cabinet.height,
    topBarY: cabinet.topBarY,
    bottomBarY: cabinet.bottomBarY,
    topSectionHeight: cabinet.topSectionHeight,
    bottomSectionHeight: cabinet.bottomSectionHeight,
    dotMatrixSupportOffsetX: display.support.offsetX,
    dotMatrixSupportY: display.support.y,
    dotMatrixSupportZ: display.support.z,
    buttonPanelPivotY: buttons.panel.pivotY,
    buttonPanelPivotZ: buttons.panel.pivotZ,
    buttonPanelThickness: buttons.panel.thickness,
    buttonPanelDepth: buttons.panel.depth,
    buttonPanelTilt: buttons.panel.tilt,
    topDisplayY: display.top.y,
    topDisplayZ: display.top.z,
    dotMatrixZ: display.dotMatrix.z,
    lowerCabinetCenterY: lowerCabinet.centerY,
    lowerCabinetCenterZ: lowerCabinet.centerZ,
    holdButtonY: buttons.hold.y,
    holdRowZ: buttons.hold.rowZ,
    actionButtonY: buttons.action.y,
    actionRowZ: buttons.action.rowZ,
    spinButtonX: buttons.spin.x,
    spinButtonWidth: buttons.spin.width,
    spinButtonHeight: buttons.spin.height,
    spinButtonDepth: buttons.spin.size,
    spinDisplayX: buttons.spinDisplay.x,
    spinDisplayY: buttons.spinDisplay.y,
    spinDisplayZ: buttons.spinDisplay.z,
    spinDisplayWidth: buttons.spinDisplay.width,
    spinDisplayHeight: buttons.spinDisplay.height,
    spinDisplayDepth: buttons.spinDisplay.depth
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
          position={[0, yOffset, winLineDepth - winLineBackOffset]}
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
