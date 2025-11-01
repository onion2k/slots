import { type GroupProps } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Mesh, type BufferGeometry, type MeshStandardMaterial } from "three";

export interface StaticMeshProps extends GroupProps {
  geometry: BufferGeometry;
  material: MeshStandardMaterial;
}

export const StaticMesh = ({ geometry, material, ...props }: StaticMeshProps) => {
  const mesh = useMemo(() => new Mesh(geometry, material), [geometry, material]);

  useEffect(() => {
    return () => {
      if (mesh.parent) {
        mesh.parent.remove(mesh);
      }
    };
  }, [mesh]);

  // eslint-disable-next-line react/no-unknown-property
  return <primitive object={mesh} dispose={null} {...props} />;
};
