import { useEffect, useMemo } from "react";
import { Group, MeshStandardMaterial } from "three";
import { useSlotsStore } from "@game/state/slotsStore";
import { ReelColumn } from "@game/entities/ReelColumn";

const FLOOR_COLOR = "#1a2335";

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

  useEffect(() => {
    return () => {
      floorMaterial.dispose();
    };
  }, [floorMaterial]);

  const { reelGap } = config;
  const totalWidth = (reelIds.length - 1) * reelGap;
  const originOffset = totalWidth / 2;

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
      <group position={[0, -2, -1]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40, 1, 1]} />
          <primitive object={floorMaterial} attach="material" />
        </mesh>
      </group>
      <group>
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
