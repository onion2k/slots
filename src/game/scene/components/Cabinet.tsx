import { type GroupProps } from "@react-three/fiber";
import type { CabinetGeometryBundle, CabinetLayout, CabinetMaterials } from "./CabinetMeshes";
import { StaticMesh } from "./StaticMesh";

type CabinetGeometry = Pick<
  CabinetGeometryBundle,
  | "topPanel"
  | "bottomPanel"
  | "sidePanel"
  | "backPanel"
  | "topFrontFrame"
  | "bottomFrontFrame"
  | "sideFrontFrame"
  | "dotMatrixSupport"
  | "lowerCabinet"
>;

type CabinetShellMaterials = Pick<CabinetMaterials, "cabinetMaterial" | "lowerCabinetMaterial">;

type CabinetShellLayout = Pick<
  CabinetLayout,
  | "cabinetHalfHeight"
  | "topPanelThickness"
  | "cabinetCenterZ"
  | "bottomPanelThickness"
  | "cabinetInnerWidth"
  | "frameThickness"
  | "cabinetBackZ"
  | "topBarY"
  | "cabinetFrontZ"
  | "bottomBarY"
  | "dotMatrixSupportOffsetX"
  | "dotMatrixSupportY"
  | "dotMatrixSupportZ"
  | "lowerCabinetCenterY"
  | "lowerCabinetCenterZ"
>;

export interface CabinetProps extends GroupProps {
  geometry: CabinetGeometry;
  materials: CabinetShellMaterials;
  layout: CabinetShellLayout;
}

export const Cabinet = ({ geometry, materials, layout, ...groupProps }: CabinetProps) => {
  return (
    <group name="cabinetStructure" {...groupProps}>
      <StaticMesh
        name="cabinetTopPanel"
        geometry={geometry.topPanel}
        material={materials.cabinetMaterial}
        position={[0, layout.cabinetHalfHeight + layout.topPanelThickness / 2, layout.cabinetCenterZ]}
        castShadow
        receiveShadow
      />
      <StaticMesh
        name="cabinetBottomPanel"
        geometry={geometry.bottomPanel}
        material={materials.cabinetMaterial}
        position={[0, -layout.cabinetHalfHeight - layout.bottomPanelThickness / 2, layout.cabinetCenterZ]}
        castShadow
        receiveShadow
      />
      <StaticMesh
        name="cabinetLeftSide"
        geometry={geometry.sidePanel}
        material={materials.cabinetMaterial}
        position={[
          -layout.cabinetInnerWidth / 2 - layout.frameThickness / 2,
          (layout.topPanelThickness - layout.bottomPanelThickness) / 2,
          layout.cabinetCenterZ
        ]}
        castShadow
        receiveShadow
      />
      <StaticMesh
        name="cabinetRightSide"
        geometry={geometry.sidePanel}
        material={materials.cabinetMaterial}
        position={[
          layout.cabinetInnerWidth / 2 + layout.frameThickness / 2,
          (layout.topPanelThickness - layout.bottomPanelThickness) / 2,
          layout.cabinetCenterZ
        ]}
        castShadow
        receiveShadow
      />
      <StaticMesh
        name="cabinetBackPanel"
        geometry={geometry.backPanel}
        material={materials.cabinetMaterial}
        position={[0, 0, layout.cabinetBackZ]}
        castShadow
        receiveShadow
      />
      <StaticMesh
        name="cabinetTopFrontFrame"
        geometry={geometry.topFrontFrame}
        material={materials.cabinetMaterial}
        position={[0, layout.topBarY, layout.cabinetFrontZ]}
        castShadow
        receiveShadow
      />
      <StaticMesh
        name="cabinetBottomFrontFrame"
        geometry={geometry.bottomFrontFrame}
        material={materials.cabinetMaterial}
        position={[0, layout.bottomBarY, layout.cabinetFrontZ]}
        castShadow
        receiveShadow
      />
      <StaticMesh
        name="cabinetLeftFrontFrame"
        geometry={geometry.sideFrontFrame}
        material={materials.cabinetMaterial}
        position={[-layout.cabinetInnerWidth / 2 - layout.frameThickness / 2, 0, layout.cabinetFrontZ]}
        castShadow
        receiveShadow
      />
      <StaticMesh
        name="cabinetRightFrontFrame"
        geometry={geometry.sideFrontFrame}
        material={materials.cabinetMaterial}
        position={[layout.cabinetInnerWidth / 2 + layout.frameThickness / 2, 0, layout.cabinetFrontZ]}
        castShadow
        receiveShadow
      />
      <StaticMesh
        name="cabinetDotMatrixSupportLeft"
        geometry={geometry.dotMatrixSupport}
        material={materials.cabinetMaterial}
        position={[
          -layout.dotMatrixSupportOffsetX,
          layout.dotMatrixSupportY,
          layout.dotMatrixSupportZ
        ]}
        castShadow
        receiveShadow
      />
      <StaticMesh
        name="cabinetDotMatrixSupportRight"
        geometry={geometry.dotMatrixSupport}
        material={materials.cabinetMaterial}
        position={[
          layout.dotMatrixSupportOffsetX,
          layout.dotMatrixSupportY,
          layout.dotMatrixSupportZ
        ]}
        castShadow
        receiveShadow
      />
      <StaticMesh
        name="cabinetLowerSection"
        geometry={geometry.lowerCabinet}
        material={materials.lowerCabinetMaterial}
        position={[0, layout.lowerCabinetCenterY, layout.lowerCabinetCenterZ]}
        castShadow
        receiveShadow
      />
    </group>
  );
};
