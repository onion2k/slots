import { useEffect, useMemo } from "react";
import { MeshStandardMaterial, PlaneGeometry, Vector3Tuple } from "three";

type MachineFloorProps = {
  material: MeshStandardMaterial;
  position: Vector3Tuple;
  width?: number;
  depth?: number;
};

export const MachineFloor = ({
  material,
  position,
  width = 40,
  depth = 40
}: MachineFloorProps) => {
  const geometry = useMemo(() => new PlaneGeometry(width, depth, 1, 1), [depth, width]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <group position={position}>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={material} />
    </group>
  );
};
