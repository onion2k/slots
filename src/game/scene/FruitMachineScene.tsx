import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { useSlotsStore } from "@game/state/slotsStore";
import { MachineLights } from "./components/MachineLights";
import { MachineFloor } from "./components/MachineFloor";
import { ReelAssemblyGroup } from "./components/ReelAssemblyGroup";

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

const createSpinDisplayMaterial = () =>
  new MeshStandardMaterial({
    color: "#101624",
    roughness: 0.55,
    metalness: 0.15,
    emissive: "#17213a",
    emissiveIntensity: 0.35
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
      collectButtonMaterial.dispose();
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
    collectButtonMaterial,
    spinButtonMaterial,
    spinDisplayMaterial,
    winLineMaterial
  ]);

  return (
    <>
      <MachineLights />
      <MachineFloor material={floorMaterial} position={FLOOR_POSITION} />
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
          collectButtonMaterial,
          spinButtonMaterial,
          spinDisplayMaterial
        }}
      />
    </>
  );
};
