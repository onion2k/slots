import { type GroupProps } from "@react-three/fiber";
import { type MeshStandardMaterial, type BufferGeometry } from "three";
import { Cabinet } from "./Cabinet";
import { CabinetButtonPanel } from "./CabinetButtonPanel";
import { DotMatrixDisplay } from "./DotMatrixDisplay";

export interface CabinetGeometryBundle {
  topPanel: BufferGeometry;
  bottomPanel: BufferGeometry;
  sidePanel: BufferGeometry;
  backPanel: BufferGeometry;
  topFrontFrame: BufferGeometry;
  bottomFrontFrame: BufferGeometry;
  sideFrontFrame: BufferGeometry;
  topDisplay: BufferGeometry;
  dotMatrix: BufferGeometry;
  lowerCabinet: BufferGeometry;
  buttonPanelSurface: BufferGeometry;
  holdButton: BufferGeometry;
  actionButton: BufferGeometry;
  spinButton: BufferGeometry;
}

export interface CabinetMaterials {
  cabinetMaterial: MeshStandardMaterial;
  dotMatrixMaterial: MeshStandardMaterial;
  lowerCabinetMaterial: MeshStandardMaterial;
  holdButtonMaterial: MeshStandardMaterial;
  collectButtonMaterial: MeshStandardMaterial;
  spinButtonMaterial: MeshStandardMaterial;
}

export interface CabinetLayout {
  cabinetCenterZ: number;
  cabinetBackZ: number;
  cabinetFrontZ: number;
  cabinetHalfHeight: number;
  topPanelThickness: number;
  bottomPanelThickness: number;
  frameThickness: number;
  cabinetInnerWidth: number;
  cabinetHeight: number;
  topBarY: number;
  bottomBarY: number;
  topSectionHeight: number;
  bottomSectionHeight: number;
  buttonPanelPivotY: number;
  buttonPanelPivotZ: number;
  buttonPanelThickness: number;
  buttonPanelDepth: number;
  buttonPanelTilt: number;
  topDisplayY: number;
  topDisplayZ: number;
  dotMatrixZ: number;
  lowerCabinetCenterY: number;
  lowerCabinetCenterZ: number;
  holdButtonY: number;
  holdRowZ: number;
  actionButtonY: number;
  actionRowZ: number;
  collectButtonX: number;
  spinButtonX: number;
}

type CabinetMeshesProps = {
  geometry: CabinetGeometryBundle;
  materials: CabinetMaterials;
  layout: CabinetLayout;
  reelIds: string[];
  reelGap: number;
  originOffset: number;
} & GroupProps;

export const CabinetMeshes = ({
  geometry,
  materials,
  layout,
  reelIds,
  reelGap,
  originOffset,
  ...groupProps
}: CabinetMeshesProps) => {
  return (
    <group name="cabinet" {...groupProps}>
      <Cabinet geometry={geometry} materials={materials} layout={layout} />
      <DotMatrixDisplay
        geometry={geometry.dotMatrix}
        material={materials.dotMatrixMaterial}
        position={[0, layout.topDisplayY, layout.dotMatrixZ]}
      />
      <CabinetButtonPanel
        geometry={geometry}
        materials={materials}
        layout={layout}
        reelIds={reelIds}
        reelGap={reelGap}
        originOffset={originOffset}
      />
    </group>
  );
};
