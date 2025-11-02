import { useCallback, useEffect, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useFrame, type GroupProps, type ThreeEvent } from "@react-three/fiber";
import { useSlotsStore } from "@game/state/slotsStore";
import type { CabinetGeometryBundle, CabinetLayout, CabinetMaterials } from "./CabinetMeshes";
import { StaticMesh } from "./StaticMesh";

type ButtonPanelGeometry = Pick<
  CabinetGeometryBundle,
  "buttonPanelSurface" | "holdButton" | "spinButton" | "spinDisplay"
>;

type ButtonPanelMaterials = Pick<
  CabinetMaterials,
  | "cabinetMaterial"
  | "holdButtonMaterial"
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
  | "spinButtonX"
  | "spinButtonWidth"
  | "spinButtonHeight"
  | "spinButtonDepth"
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
  const flashHighlightColorRef = useRef(spinButtonMaterial.color.clone());
  const flashPhaseRef = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    defaultSpinColorRef.current.copy(spinButtonMaterial.color);
    defaultSpinEmissiveRef.current.copy(spinButtonMaterial.emissive);
    defaultSpinEmissiveIntensityRef.current = spinButtonMaterial.emissiveIntensity;
    flashHighlightColorRef.current
      .copy(defaultSpinColorRef.current)
      .offsetHSL(0, 0, 0.18);
  }, [spinButtonMaterial]);

  useEffect(() => {
    if (isSpinPressed) {
      spinButtonMaterial.color.set("#ffd6d6");
      spinButtonMaterial.emissive.set("#ff5a47");
      spinButtonMaterial.emissiveIntensity = Math.max(
        defaultSpinEmissiveIntensityRef.current * 3.2,
        defaultSpinEmissiveIntensityRef.current + 1.2
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

  useFrame((_, delta) => {
    if (isSpinPressed) {
      return;
    }

    if (!canSpin) {
      spinButtonMaterial.emissiveIntensity = defaultSpinEmissiveIntensityRef.current;
      spinButtonMaterial.color.copy(defaultSpinColorRef.current);
      return;
    }

    flashPhaseRef.current += delta * 4.2;
    const pulse = (Math.sin(flashPhaseRef.current) + 1) / 2;
    spinButtonMaterial.color.lerpColors(
      defaultSpinColorRef.current,
      flashHighlightColorRef.current,
      pulse
    );
    spinButtonMaterial.emissiveIntensity =
      defaultSpinEmissiveIntensityRef.current + pulse * 2.4;
  });

  const spinPressDepth = layout.buttonPanelThickness * 0.35;
  const holdPressDepth = layout.buttonPanelThickness * 0.3;
  const holdLatchDepth = layout.buttonPanelThickness * 0.18;
  const spinButtonPressOffset = isSpinPressed ? spinPressDepth : 0;
  const spinLabelBaseOffset = layout.spinButtonHeight / 2 + layout.spinButtonHeight * 0.12;
  const spinLabelFontSize = Math.min(layout.spinButtonWidth, layout.spinButtonDepth) * 0.55;
  const spinLabelOutlineWidth = Math.min(layout.spinButtonWidth, layout.spinButtonDepth) * 0.08;

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
        <group name="spinControlsCluster">
          <group
            name="spinButton"
            // eslint-disable-next-line react/no-unknown-property
            position={[layout.spinButtonX, layout.actionButtonY, layout.actionRowZ]}
          >
            <StaticMesh
              name="spinButtonBody"
              geometry={geometry.spinButton}
              material={materials.spinButtonMaterial}
              position={[0, -spinButtonPressOffset, 0]}
              onPointerDown={handleSpinPointerDown}
              onPointerUp={handleSpinPointerUp}
              onPointerOut={handleSpinPointerOut}
              onPointerLeave={handleSpinPointerOut}
              onPointerCancel={handleSpinPointerOut}
              castShadow
              receiveShadow
            />
            <Text
              position={[
                0,
                spinLabelBaseOffset - spinButtonPressOffset,
                0
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={spinLabelFontSize}
              maxWidth={layout.spinButtonWidth * 0.9}
              anchorX="center"
              anchorY="middle"
              color="#ffffff"
              outlineWidth={spinLabelOutlineWidth}
              outlineColor="#320000"
              onPointerDown={handleSpinPointerDown}
              onPointerUp={handleSpinPointerUp}
              onPointerOut={handleSpinPointerOut}
              onPointerLeave={handleSpinPointerOut}
              onPointerCancel={handleSpinPointerOut}
            >
              SPIN
            </Text>
            <SpinCreditDisplay
              geometry={geometry.spinDisplay}
              material={materials.spinDisplayMaterial}
              layout={layout}
              credits={credits}
            />
          </group>
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
  const textFontSize = layout.spinDisplayHeight * 0.58;
  const textOutlineWidth = layout.spinDisplayHeight * 0.08;
  const textOffset = layout.spinDisplayDepth / 2 + 0.004;

  return (
    <group
      name="spinCreditsDisplay"
      // eslint-disable-next-line react/no-unknown-property
      position={[-2,0,0]}
      // eslint-disable-next-line react/no-unknown-property
      rotation={[-(Math.PI / 2), 0, 0]}
    >
      <StaticMesh
        name="spinCreditsDisplayBody"
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
      />
      <Text
        position={[0, 0, textOffset]}
        fontSize={textFontSize}
        maxWidth={layout.spinDisplayWidth * 0.92}
        color="#f6fbff"
        anchorX="center"
        anchorY="middle"
        lineHeight={1.05}
        outlineWidth={textOutlineWidth}
        outlineColor="#0b1017"
      >
        {`Credits: ${credits.toLocaleString()}`}
      </Text>
    </group>
  );
};
