import { type GroupProps } from "@react-three/fiber";
import type { CabinetGeometryBundle, CabinetLayout, CabinetMaterials } from "./CabinetMeshes";
import { StaticMesh } from "./StaticMesh";

type ButtonPanelGeometry = Pick<
  CabinetGeometryBundle,
  "buttonPanelSurface" | "holdButton" | "actionButton" | "spinButton"
>;

type ButtonPanelMaterials = Pick<
  CabinetMaterials,
  "cabinetMaterial" | "holdButtonMaterial" | "collectButtonMaterial" | "spinButtonMaterial"
>;

type ButtonPanelLayout = Pick<
  CabinetLayout,
  | "buttonPanelPivotY"
  | "buttonPanelPivotZ"
  | "buttonPanelTilt"
  | "buttonPanelThickness"
  | "buttonPanelDepth"
  | "holdButtonY"
  | "holdRowZ"
  | "actionButtonY"
  | "actionRowZ"
  | "collectButtonX"
  | "spinButtonX"
>;

export interface CabinetButtonPanelProps extends GroupProps {
  geometry: ButtonPanelGeometry;
  materials: ButtonPanelMaterials;
  layout: ButtonPanelLayout;
  reelIds: string[];
  reelGap: number;
  originOffset: number;
}

export const CabinetButtonPanel = ({
  geometry,
  materials,
  layout,
  reelIds,
  reelGap,
  originOffset,
  ...groupProps
}: CabinetButtonPanelProps) => {
  return (
    <group
      name="cabinetButtonPanel"
      // eslint-disable-next-line react/no-unknown-property
      position={[0, layout.buttonPanelPivotY, layout.buttonPanelPivotZ]}
      // eslint-disable-next-line react/no-unknown-property
      rotation={[layout.buttonPanelTilt, 0, 0]}
      {...groupProps}
    >
      <StaticMesh
        name="cabinetButtonPanelSurface"
        geometry={geometry.buttonPanelSurface}
        material={materials.cabinetMaterial}
        position={[0, -layout.buttonPanelThickness / 2, layout.buttonPanelDepth / 2]}
        castShadow
        receiveShadow
      />
      <group name="cabinetButtonPanelButtons">
        <group name="cabinetHoldButtons">
          {reelIds.map((reelId, index) => (
            <StaticMesh
              key={`hold-button-${reelId}`}
              name={`holdButton-${reelId}`}
              geometry={geometry.holdButton}
              material={materials.holdButtonMaterial}
              position={[index * reelGap - originOffset, layout.holdButtonY, layout.holdRowZ]}
              castShadow
              receiveShadow
            />
          ))}
        </group>
        <StaticMesh
          name="collectButton"
          geometry={geometry.actionButton}
          material={materials.collectButtonMaterial}
          position={[layout.collectButtonX, layout.actionButtonY, layout.actionRowZ]}
          castShadow
          receiveShadow
        />
        <StaticMesh
          name="spinButton"
          geometry={geometry.spinButton}
          material={materials.spinButtonMaterial}
          position={[layout.spinButtonX, layout.actionButtonY, layout.actionRowZ]}
          castShadow
          receiveShadow
        />
      </group>
    </group>
  );
};
