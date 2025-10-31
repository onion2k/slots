import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { useSlotsStore } from "@game/state/slotsStore";
import { ReelColumn } from "@game/entities/ReelColumn";

const FLOOR_COLOR = "#1a2335";
const FLOOR_POSITION: [number, number, number] = [0, -2, -1];

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

export const FruitMachineScene = () => {
  const { config, reelIds } = useSlotsStore((state) => ({
    config: state.config,
    reelIds: state.reels.map((reel) => reel.id)
  }));

  const floorMaterial = useMemo(() => createFloorMaterial(), []);
  const coreMaterial = useMemo(() => createCoreMaterial(), []);
  const dividerMaterial = useMemo(() => createDividerMaterial(), []);
  const winLineMaterial = useMemo(() => createWinLineMaterial(), []);

  useEffect(() => {
    return () => {
      floorMaterial.dispose();
      coreMaterial.dispose();
      dividerMaterial.dispose();
      winLineMaterial.dispose();
    };
  }, [coreMaterial, dividerMaterial, floorMaterial, winLineMaterial]);

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
