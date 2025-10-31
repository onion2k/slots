import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { useSlotsStore } from "@game/state/slotsStore";
import { ReelColumn } from "@game/entities/ReelColumn";

const FLOOR_COLOR = "#1a2335";
const FLOOR_POSITION: [number, number, number] = [0, -10, -1];
const CABINET_COLOR = "#252f43";

const createCoreMaterial = () =>
  new MeshStandardMaterial({
    color: "#8a8f9b",
    roughness: 0.55,
    metalness: 0.25
  });

const createDividerMaterial = () =>
  new MeshStandardMaterial({
    color: "#060809",
    roughness: 0.35,
    metalness: 0.6
  });

const createWinLineMaterial = () =>
  new MeshStandardMaterial({
    color: "#f2b632",
    roughness: 0.3,
    metalness: 0.7,
    emissive: "#f2b632",
    emissiveIntensity: 0.15
  });

const createFloorMaterial = () =>
  new MeshStandardMaterial({
    color: FLOOR_COLOR,
    roughness: 0.8,
    metalness: 0.1
  });

const createCabinetMaterial = () =>
  new MeshStandardMaterial({
    color: CABINET_COLOR,
    roughness: 0.65,
    metalness: 0.25
  });

const createLowerCabinetMaterial = () =>
  new MeshStandardMaterial({
    color: "#1e2536",
    roughness: 0.72,
    metalness: 0.2
  });

const createDotMatrixMaterial = () =>
  new MeshStandardMaterial({
    color: "#141925",
    roughness: 0.35,
    metalness: 0.15,
    emissive: "#1e2740",
    emissiveIntensity: 0.25
  });

const createHoldButtonMaterial = () =>
  new MeshStandardMaterial({
    color: "#b5bcc8",
    roughness: 0.4,
    metalness: 0.35
  });

const createCollectButtonMaterial = () =>
  new MeshStandardMaterial({
    color: "#2f9e44",
    roughness: 0.35,
    metalness: 0.25,
    emissive: "#1e7a34",
    emissiveIntensity: 0.2
  });

const createSpinButtonMaterial = () =>
  new MeshStandardMaterial({
    color: "#d9480f",
    roughness: 0.35,
    metalness: 0.2,
    emissive: "#a8320c",
    emissiveIntensity: 0.25
  });

export const FruitMachineScene = () => {
  const { config, reelIds } = useSlotsStore((state) => ({
    config: state.config,
    reelIds: state.reels.map((reel) => reel.id)
  }));

  const floorMaterial = useMemo(() => createFloorMaterial(), []);
  const coreMaterial = useMemo(() => createCoreMaterial(), []);
  const dividerMaterial = useMemo(() => createDividerMaterial(), []);
  const winLineMaterial = useMemo(() => createWinLineMaterial(), []);
  const cabinetMaterial = useMemo(() => createCabinetMaterial(), []);
  const lowerCabinetMaterial = useMemo(() => createLowerCabinetMaterial(), []);
  const dotMatrixMaterial = useMemo(() => createDotMatrixMaterial(), []);
  const holdButtonMaterial = useMemo(() => createHoldButtonMaterial(), []);
  const collectButtonMaterial = useMemo(() => createCollectButtonMaterial(), []);
  const spinButtonMaterial = useMemo(() => createSpinButtonMaterial(), []);

  useEffect(() => {
    return () => {
      floorMaterial.dispose();
      coreMaterial.dispose();
      dividerMaterial.dispose();
      winLineMaterial.dispose();
      cabinetMaterial.dispose();
      lowerCabinetMaterial.dispose();
      dotMatrixMaterial.dispose();
      holdButtonMaterial.dispose();
      collectButtonMaterial.dispose();
      spinButtonMaterial.dispose();
    };
  }, [
    cabinetMaterial,
    lowerCabinetMaterial,
    coreMaterial,
    dividerMaterial,
    dotMatrixMaterial,
    floorMaterial,
    holdButtonMaterial,
    collectButtonMaterial,
    spinButtonMaterial,
    winLineMaterial
  ]);

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
  const backPanelDepth = Math.max(config.itemScale * 0.6, 0.3);
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
  const cabinetBackZ = -config.reelRadius * 0.9 - backPanelDepth / 2;
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

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        intensity={1.2}
        position={[6, 10, 5]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight
        position={[0, 6, 4]}
        intensity={1.3}
        angle={Math.PI / 5}
        penumbra={0.4}
        castShadow
      />
      <group position={FLOOR_POSITION}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40, 1, 1]} />
          <primitive object={floorMaterial} attach="material" />
        </mesh>
      </group>
      <group position={[0, reelAssemblyYOffset, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[reelCoreRadius, reelCoreRadius, reelCoreLength, 64]} />
          <primitive object={coreMaterial} attach="material" />
        </mesh>
        {dividerPositions.map((xPosition, index) => (
          <mesh
            key={`divider-${index}`}
            position={[xPosition, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[dividerRadius, dividerRadius, dividerLength, 64]} />
            <primitive object={dividerMaterial} attach="material" />
          </mesh>
        ))}
        {winLineOffsets.map((yOffset, index) => (
          <mesh
            key={`win-line-${index}`}
            position={[0, yOffset, winLineDepth]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[winLineRadius, winLineRadius, winLineLength, 48]} />
            <primitive object={winLineMaterial} attach="material" />
          </mesh>
        ))}
        <group name="cabinet">
          <mesh
            name="cabinetTopPanel"
            position={[0, cabinetHalfHeight + topPanelThickness / 2, cabinetCenterZ]}
            castShadow
            receiveShadow
            material={cabinetMaterial}
          >
            <boxGeometry args={[cabinetOuterWidth, topPanelThickness, cabinetDepth]} />
          </mesh>
          <mesh
            name="cabinetBottomPanel"
            position={[0, -cabinetHalfHeight - bottomPanelThickness / 2, cabinetCenterZ]}
            castShadow
            receiveShadow
            material={cabinetMaterial}
          >
            <boxGeometry args={[cabinetOuterWidth, bottomPanelThickness, cabinetDepth]} />
          </mesh>
          <mesh
            name="cabinetLeftSide"
            position={[
              -cabinetInnerWidth / 2 - frameThickness / 2,
              (topPanelThickness - bottomPanelThickness) / 2,
              cabinetCenterZ
            ]}
            castShadow
            receiveShadow
            material={cabinetMaterial}
          >
            <boxGeometry
              args={[
                frameThickness,
                cabinetHeight + topPanelThickness + bottomPanelThickness,
                cabinetDepth
              ]}
            />
          </mesh>
          <mesh
            name="cabinetRightSide"
            position={[
              cabinetInnerWidth / 2 + frameThickness / 2,
              (topPanelThickness - bottomPanelThickness) / 2,
              cabinetCenterZ
            ]}
            castShadow
            receiveShadow
            material={cabinetMaterial}
          >
            <boxGeometry
              args={[
                frameThickness,
                cabinetHeight + topPanelThickness + bottomPanelThickness,
                cabinetDepth
              ]}
            />
          </mesh>
          <mesh
            name="cabinetBackPanel"
            position={[0, 0, cabinetBackZ]}
            castShadow
            receiveShadow
            material={cabinetMaterial}
          >
            <boxGeometry args={[cabinetInnerWidth, cabinetHeight, backPanelDepth]} />
          </mesh>
          <mesh
            name="cabinetTopFrontFrame"
            position={[0, topBarY, cabinetFrontZ]}
            castShadow
            receiveShadow
            material={cabinetMaterial}
          >
            <boxGeometry args={[cabinetInnerWidth, topSectionHeight, frontFrameDepth]} />
          </mesh>
          <mesh
            name="cabinetBottomFrontFrame"
            position={[0, bottomBarY, cabinetFrontZ]}
            castShadow
            receiveShadow
            material={cabinetMaterial}
          >
            <boxGeometry args={[cabinetInnerWidth, bottomSectionHeight, frontFrameDepth]} />
          </mesh>
          <mesh
            name="cabinetLeftFrontFrame"
            position={[-cabinetInnerWidth / 2 - frameThickness / 2, 0, cabinetFrontZ]}
            castShadow
            receiveShadow
            material={cabinetMaterial}
          >
            <boxGeometry args={[frameThickness, cabinetHeight, frontFrameDepth]} />
          </mesh>
          <mesh
            name="cabinetRightFrontFrame"
            position={[cabinetInnerWidth / 2 + frameThickness / 2, 0, cabinetFrontZ]}
            castShadow
            receiveShadow
            material={cabinetMaterial}
          >
            <boxGeometry args={[frameThickness, cabinetHeight, frontFrameDepth]} />
          </mesh>
          <mesh
            name="cabinetTopDisplay"
            position={[0, topDisplayY, topDisplayZ]}
            castShadow
            receiveShadow
            material={cabinetMaterial}
          >
            <boxGeometry args={[cabinetInnerWidth, topDisplayHeight, topDisplayDepth]} />
          </mesh>
          <mesh
            name="dotMatrixDisplay"
            position={[0, topDisplayY, dotMatrixZ]}
            castShadow
            receiveShadow
            material={dotMatrixMaterial}
          >
            <boxGeometry
              args={[dotMatrixWidth, dotMatrixHeight, dotMatrixDepth]}
            />
          </mesh>
          <mesh
            name="cabinetLowerSection"
            position={[0, lowerCabinetCenterY, lowerCabinetCenterZ]}
            castShadow
            receiveShadow
            material={lowerCabinetMaterial}
          >
            <boxGeometry
              args={[lowerCabinetWidth, lowerCabinetHeight, lowerCabinetDepth]}
            />
          </mesh>
          <group
            name="cabinetButtonPanel"
            position={[0, buttonPanelPivotY, buttonPanelPivotZ]}
            rotation={[buttonPanelTilt, 0, 0]}
          >
            <mesh
              name="cabinetButtonPanelSurface"
              position={[0, -buttonPanelThickness / 2, buttonPanelDepth / 2]}
              castShadow
              receiveShadow
              material={cabinetMaterial}
            >
              <boxGeometry
                args={[buttonPanelWidth, buttonPanelThickness, buttonPanelLength]}
              />
            </mesh>
            <group name="cabinetButtonPanelButtons">
              <group name="cabinetHoldButtons">
                {reelIds.map((reelId, index) => (
                  <mesh
                    key={`hold-button-${reelId}`}
                    name={`holdButton-${reelId}`}
                    position={[index * reelGap - originOffset, holdButtonY, holdRowZ]}
                    castShadow
                    receiveShadow
                    material={holdButtonMaterial}
                  >
                    <boxGeometry
                      args={[holdButtonSize, holdButtonHeight, holdButtonSize]}
                    />
                  </mesh>
                ))}
              </group>
              <mesh
                name="collectButton"
                position={[collectButtonX, actionButtonY, actionRowZ]}
                castShadow
                receiveShadow
                material={collectButtonMaterial}
              >
                <boxGeometry
                  args={[actionButtonSize, actionButtonHeight, actionButtonSize]}
                />
              </mesh>
              <mesh
                name="spinButton"
                position={[spinButtonX, actionButtonY, actionRowZ]}
                castShadow
                receiveShadow
                material={spinButtonMaterial}
              >
                <boxGeometry
                  args={[spinButtonSize, spinButtonHeight, spinButtonSize]}
                />
              </mesh>
            </group>
          </group>
        </group>
        {reelIds.map((reelId, index) => (
          <ReelColumn
            key={reelId}
            reelId={reelId}
            position={[index * reelGap - originOffset, 0, 0]}
          />
        ))}
      </group>
    </>
  );
};
