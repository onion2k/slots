import { useCallback, useEffect, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { type GroupProps, type ThreeEvent } from "@react-three/fiber";
import { useSlotsStore } from "@game/state/slotsStore";
import type { CabinetGeometryBundle, CabinetLayout, CabinetMaterials } from "./CabinetMeshes";
import { StaticMesh } from "./StaticMesh";

type ButtonPanelGeometry = Pick<
  CabinetGeometryBundle,
  "buttonPanelSurface" | "holdButton" | "actionButton" | "spinButton" | "spinDisplay"
>;

type ButtonPanelMaterials = Pick<
  CabinetMaterials,
  | "cabinetMaterial"
  | "holdButtonMaterial"
  | "collectButtonMaterial"
  | "spinButtonMaterial"
  | "spinDisplayMaterial"
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
  | "spinDisplayX"
  | "spinDisplayY"
  | "spinDisplayZ"
  | "spinDisplayWidth"
  | "spinDisplayHeight"
  | "spinDisplayDepth"
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
  const [isSpinPressed, setIsSpinPressed] = useState(false);
  const { spin, canSpin, toggleHold, isSpinning, credits } = useSlotsStore((state) => ({
    spin: state.spin,
    canSpin: state.credits >= state.config.spinCost && !state.isSpinning,
    toggleHold: state.toggleHold,
    isSpinning: state.isSpinning,
    credits: state.credits
  }));

  const spinButtonMaterial = materials.spinButtonMaterial;
  const defaultSpinColorRef = useRef(spinButtonMaterial.color.clone());
  const defaultSpinEmissiveRef = useRef(spinButtonMaterial.emissive.clone());
  const defaultSpinEmissiveIntensityRef = useRef(spinButtonMaterial.emissiveIntensity);

  useEffect(() => {
    defaultSpinColorRef.current.copy(spinButtonMaterial.color);
    defaultSpinEmissiveRef.current.copy(spinButtonMaterial.emissive);
    defaultSpinEmissiveIntensityRef.current = spinButtonMaterial.emissiveIntensity;
  }, [spinButtonMaterial]);

  useEffect(() => {
    if (isSpinPressed) {
      spinButtonMaterial.color.set("#ff7b45");
      spinButtonMaterial.emissive.set("#ff6a2a");
      spinButtonMaterial.emissiveIntensity = Math.max(
        defaultSpinEmissiveIntensityRef.current * 2.8,
        defaultSpinEmissiveIntensityRef.current + 0.6
      );
    } else {
      spinButtonMaterial.color.copy(defaultSpinColorRef.current);
      spinButtonMaterial.emissive.copy(defaultSpinEmissiveRef.current);
      spinButtonMaterial.emissiveIntensity = defaultSpinEmissiveIntensityRef.current;
    }

    spinButtonMaterial.needsUpdate = true;

    return () => {
      spinButtonMaterial.color.copy(defaultSpinColorRef.current);
      spinButtonMaterial.emissive.copy(defaultSpinEmissiveRef.current);
      spinButtonMaterial.emissiveIntensity = defaultSpinEmissiveIntensityRef.current;
      spinButtonMaterial.needsUpdate = true;
    };
  }, [isSpinPressed, spinButtonMaterial]);

  const spinPressDepth = layout.buttonPanelThickness * 0.35;
  const holdPressDepth = layout.buttonPanelThickness * 0.3;
  const holdLatchDepth = layout.buttonPanelThickness * 0.18;

  const handleSpinPointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (event.button !== 0) {
        return;
      }

      event.stopPropagation();

      if (!canSpin) {
        return;
      }

      setIsSpinPressed(true);
    },
    [canSpin]
  );

  const handleSpinPointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (event.button !== 0) {
        return;
      }

      event.stopPropagation();

      if (!isSpinPressed) {
        return;
      }

      setIsSpinPressed(false);

      if (!canSpin) {
        return;
      }

      spin();
    },
    [canSpin, isSpinPressed, spin]
  );

  const handleSpinPointerOut = useCallback(() => {
    if (!isSpinPressed) {
      return;
    }

    setIsSpinPressed(false);
  }, [isSpinPressed]);

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
            <HoldButtonMesh
              key={`hold-button-${reelId}`}
              geometry={geometry.holdButton}
              material={materials.holdButtonMaterial}
              layout={layout}
              reelId={reelId}
              reelIndex={index}
              reelGap={reelGap}
              originOffset={originOffset}
              isSpinning={isSpinning}
              toggleHold={toggleHold}
              pressDepth={holdPressDepth}
              latchDepth={holdLatchDepth}
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
        <group name="spinControlsCluster">
          <StaticMesh
            name="spinButton"
            geometry={geometry.spinButton}
            material={materials.spinButtonMaterial}
            position={[
              layout.spinButtonX,
              layout.actionButtonY - (isSpinPressed ? spinPressDepth : 0),
              layout.actionRowZ
            ]}
            onPointerDown={handleSpinPointerDown}
            onPointerUp={handleSpinPointerUp}
            onPointerOut={handleSpinPointerOut}
            onPointerLeave={handleSpinPointerOut}
            onPointerCancel={handleSpinPointerOut}
            castShadow
            receiveShadow
          />
          <SpinCreditDisplay
            geometry={geometry.spinDisplay}
            material={materials.spinDisplayMaterial}
            layout={layout}
            credits={credits}
          />
        </group>
      </group>
    </group>
  );
};

interface HoldButtonMeshProps {
  geometry: ButtonPanelGeometry["holdButton"];
  material: ButtonPanelMaterials["holdButtonMaterial"];
  layout: ButtonPanelLayout;
  reelId: string;
  reelIndex: number;
  reelGap: number;
  originOffset: number;
  isSpinning: boolean;
  toggleHold: (reelId: string) => void;
  pressDepth: number;
  latchDepth: number;
}

const HoldButtonMesh = ({
  geometry,
  material,
  layout,
  reelId,
  reelIndex,
  reelGap,
  originOffset,
  isSpinning,
  toggleHold,
  pressDepth,
  latchDepth
}: HoldButtonMeshProps) => {
  const held = useSlotsStore(
    useCallback(
      (state) =>
        state.reels.find((candidate) => candidate.id === reelId)?.held ?? false,
      [reelId]
    )
  );
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (isSpinning) {
      setIsPressed(false);
    }
  }, [isSpinning]);

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (event.button !== 0) {
        return;
      }

      event.stopPropagation();

      if (isSpinning) {
        return;
      }

      setIsPressed(true);
    },
    [isSpinning]
  );

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (event.button !== 0) {
        return;
      }

      event.stopPropagation();

      if (!isPressed) {
        return;
      }

      setIsPressed(false);

      if (isSpinning) {
        return;
      }

      toggleHold(reelId);
    },
    [isPressed, isSpinning, reelId, toggleHold]
  );

  const handlePointerOut = useCallback(() => {
    if (!isPressed) {
      return;
    }

    setIsPressed(false);
  }, [isPressed]);

  const position: [number, number, number] = [
    reelIndex * reelGap - originOffset,
    layout.holdButtonY - (held ? latchDepth : 0) - (isPressed ? pressDepth : 0),
    layout.holdRowZ
  ];

  return (
    <StaticMesh
      name={`holdButton-${reelId}`}
      geometry={geometry}
      material={material}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerOut}
      onPointerLeave={handlePointerOut}
      onPointerCancel={handlePointerOut}
      castShadow
      receiveShadow
    />
  );
};

interface SpinCreditDisplayProps {
  geometry: ButtonPanelGeometry["spinDisplay"];
  material: ButtonPanelMaterials["spinDisplayMaterial"];
  layout: ButtonPanelLayout;
  credits: number;
}

const SpinCreditDisplay = ({ geometry, material, layout, credits }: SpinCreditDisplayProps) => {
  const textFontSize = layout.spinDisplayHeight * 0.42;
  const textOutlineWidth = layout.spinDisplayHeight * 0.05;
  const textZOffset = layout.spinDisplayDepth / 2 + 0.002;

  return (
    <group
      name="spinCreditsDisplay"
      // eslint-disable-next-line react/no-unknown-property
      position={[layout.spinDisplayX, layout.spinDisplayY, layout.spinDisplayZ]}
    >
      <StaticMesh
        name="spinCreditsDisplayBody"
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
      />
      <Text
        position={[0, 0, textZOffset]}
        fontSize={textFontSize}
        maxWidth={layout.spinDisplayWidth * 0.85}
        color="#f6fbff"
        anchorX="center"
        anchorY="middle"
        lineHeight={1.1}
        outlineWidth={textOutlineWidth}
        outlineColor="#0b1017"
      >
        {`Credits: ${credits.toLocaleString()}`}
      </Text>
    </group>
  );
};
