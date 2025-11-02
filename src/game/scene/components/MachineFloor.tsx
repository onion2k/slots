import { useEffect, useMemo } from "react";
import { MeshStandardMaterial, PlaneGeometry, Vector3Tuple } from "three";
import { Reflector } from "@react-three/drei";

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
      <Reflector
        args={[width * 0.6, depth * 0.35]}
        resolution={1024}
        mirror={0.42}
        mixBlur={2}
        mixStrength={1}
        depthScale={0.4}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, depth * -0.08]}
      >
        {(Material, props) => (
          <Material
            {...props}
            color="#1c2234"
            metalness={0.35}
            roughness={0.8}
          />
        )}
      </Reflector>
    </group>
  );
};
