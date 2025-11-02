import { useEffect, useMemo } from "react";
import { MeshPhysicalMaterial } from "three";
import { ContactShadows } from "@react-three/drei";
import { useSlotsStore } from "@game/state/slotsStore";
import { MachineLights } from "./components/MachineLights";
import { MachineFloor } from "./components/MachineFloor";
import { ReelAssemblyGroup } from "./components/ReelAssemblyGroup";

const FLOOR_COLOR = "#141b28";
const FLOOR_POSITION: [number, number, number] = [0, -10, 0];
const CABINET_COLOR = "#f2d14a";

const createCoreMaterial = () =>
  new MeshPhysicalMaterial({
    color: "#8c93a7",
    roughness: 0.28,
    metalness: 0.85,
    envMapIntensity: 0.9,
    clearcoat: 0.55,
    clearcoatRoughness: 0.22
  });

const createDividerMaterial = () =>
  new MeshPhysicalMaterial({
    color: "#0b0d13",
    roughness: 0.18,
    metalness: 0.95,
    envMapIntensity: 1.1,
    clearcoat: 0.4,
    clearcoatRoughness: 0.18
  });

const createWinLineMaterial = () =>
  new MeshPhysicalMaterial({
    color: "#f2c94c",
    roughness: 0.15,
    metalness: 0.95,
    emissive: "#f2c94c",
    emissiveIntensity: 0.35,
    envMapIntensity: 1.4
  });

const createFloorMaterial = () =>
  new MeshPhysicalMaterial({
    color: FLOOR_COLOR,
    roughness: 0.35,
    metalness: 0.85,
    envMapIntensity: 1.2,
    clearcoat: 0.65,
    clearcoatRoughness: 0.4
  });

const createCabinetMaterial = () =>
  new MeshPhysicalMaterial({
    color: CABINET_COLOR,
    roughness: 0.28,
    metalness: 0.65,
    envMapIntensity: 1.15,
    sheen: 0.55,
    sheenColor: "#fff4c6",
    sheenRoughness: 0.45,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25
  });

const createLowerCabinetMaterial = () =>
  new MeshPhysicalMaterial({
    color: "#d4d8df",
    roughness: 0.42,
    metalness: 0.55,
    envMapIntensity: 0.9,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3
  });

const createDotMatrixMaterial = () =>
  new MeshPhysicalMaterial({
    color: "#f84242",
    roughness: 0.22,
    metalness: 0.2,
    emissive: "#1e2740",
    emissiveIntensity: 0.45,
    envMapIntensity: 1.05
  });

const createHoldButtonMaterial = () =>
  new MeshPhysicalMaterial({
    color: "#b8c4d4",
    roughness: 0.3,
    metalness: 0.6,
    envMapIntensity: 1,
    sheen: 0.35,
    sheenColor: "#e7f0ff",
    sheenRoughness: 0.5
  });

const createSpinButtonMaterial = () =>
  new MeshPhysicalMaterial({
    color: "#ff2d2d",
    roughness: 0.18,
    metalness: 0.48,
    emissive: "#ff1010",
    emissiveIntensity: 0.6,
    envMapIntensity: 1.25,
    clearcoat: 0.38,
    clearcoatRoughness: 0.22
  });

const createSpinDisplayMaterial = () =>
  new MeshPhysicalMaterial({
    color: "#101624",
    roughness: 0.4,
    metalness: 0.35,
    emissive: "#17213a",
    emissiveIntensity: 0.55,
    envMapIntensity: 1.1
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
  const spinButtonMaterial = useMemo(() => createSpinButtonMaterial(), []);
  const spinDisplayMaterial = useMemo(() => createSpinDisplayMaterial(), []);

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
      spinButtonMaterial.dispose();
      spinDisplayMaterial.dispose();
    };
  }, [
    cabinetMaterial,
    lowerCabinetMaterial,
    coreMaterial,
    dividerMaterial,
    dotMatrixMaterial,
    floorMaterial,
    holdButtonMaterial,
    spinButtonMaterial,
    spinDisplayMaterial,
    winLineMaterial
  ]);

  return (
    <>
      <MachineLights />
      <MachineFloor material={floorMaterial} position={FLOOR_POSITION} />
      <ContactShadows
        scale={25}
        position={[0, -1.15, 0]}
        opacity={0.4}
        blur={3.4}
        far={20}
        resolution={1024}
        frames={1}
      />
      <ReelAssemblyGroup
        config={config}
        reelIds={reelIds}
        materials={{
          coreMaterial,
          dividerMaterial,
          winLineMaterial,
          cabinetMaterial,
          lowerCabinetMaterial,
          dotMatrixMaterial,
          holdButtonMaterial,
          spinButtonMaterial,
          spinDisplayMaterial
        }}
      />
    </>
  );
};
