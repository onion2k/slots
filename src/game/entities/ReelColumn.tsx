import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Box3, Group, MeshStandardMaterial, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { shallow } from "zustand/shallow";
import {
  useSlotsStore,
  type ReelRuntimeState
} from "@game/state/slotsStore";
import { easeOutCubic } from "@game/utils/easing";
import type { SymbolModelConfig } from "@game/core/fruitMachineConfig";

const TAU = Math.PI * 2;
const SYMBOL_SPIN_SPEED = 0.35;
const TEMP_BOX = new Box3();
const TEMP_CENTER = new Vector3();

interface ReelColumnProps {
  reelId: string;
  position: [number, number, number];
}

const useReelState = (reelId: string): ReelRuntimeState =>
  useSlotsStore(
    (state) => {
      const reel = state.reels.find((candidate) => candidate.id === reelId);
      if (!reel) {
        throw new Error(`Reel with id ${reelId} not found`);
      }
      return reel;
    },
    shallow
  );

export const ReelColumn = ({ reelId, position }: ReelColumnProps) => {
  const reel = useReelState(reelId);
  const { config, completeReelSpin } = useSlotsStore((state) => ({
    config: state.config,
    completeReelSpin: state.completeReelSpin
  }));

  const reelGroup = useRef<Group>(null);
  const planRef = useRef(reel.spinPlan);
  const angleRef = useRef(reel.currentAngle);

  useEffect(() => {
    planRef.current = reel.spinPlan;
  }, [reel.spinPlan]);

  useEffect(() => {
    angleRef.current = reel.currentAngle;
    if (reelGroup.current && !planRef.current) {
      reelGroup.current.rotation.x = reel.currentAngle;
    }
  }, [reel.currentAngle]);

  useFrame(() => {
    const group = reelGroup.current;
    if (!group) {
      return;
    }

    const plan = planRef.current;

    if (!plan) {
      group.rotation.x = angleRef.current;
      return;
    }

    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsed = (now - plan.startTime) / 1000;

    if (elapsed < plan.delay) {
      group.rotation.x = plan.startAngle;
      return;
    }

    const easedProgress = easeOutCubic(
      Math.min((elapsed - plan.delay) / plan.duration, 1)
    );
    const angle =
      plan.startAngle + (plan.targetAngle - plan.startAngle) * easedProgress;

    group.rotation.x = angle;

    if (easedProgress >= 0.999) {
      planRef.current = null;
      angleRef.current = angle;
      completeReelSpin(reelId);
    }
  });

  const symbolLayout = useMemo(() => {
    const radius = config.reelRadius;
    const count = reel.config.symbols.length;

    return reel.config.symbols.map((symbol, index) => {
      const angle = (index / count) * TAU;
      const y = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      return {
        symbol,
        angle,
        position: [0, y, z] as [number, number, number],
        rotation: [Math.PI / 2 - angle, 0, 0] as [number, number, number]
      };
    });
  }, [config.reelRadius, reel.config.symbols]);

  const { symbolDefinitions } = config;

  const renderModelSymbol = (modelConfig: SymbolModelConfig | undefined) => {
    if (!modelConfig) {
      return null;
    }

    return <CenteredModel modelConfig={modelConfig} />;
  };

  const symbolMaterials = useMemo(() => {
    return reel.config.symbols.map((symbol) => {
      const symbolDefinition = symbolDefinitions[symbol];

      if (symbolDefinition.geometry === "model") {
        return null;
      }

      return new MeshStandardMaterial({
        color: symbolDefinition.color,
        roughness: symbolDefinition.geometry === "box" ? 0.35 : 0.6,
        metalness: symbolDefinition.geometry === "box" ? 0.8 : 0.3,
        emissive: reel.held ? symbolDefinition.color : "#000000",
        emissiveIntensity: reel.held ? 0.25 : 0.05
      });
    });
  }, [reel.config.symbols, reel.held, symbolDefinitions]);

  useEffect(() => {
    return () => {
      symbolMaterials.forEach((material) => material?.dispose());
    };
  }, [symbolMaterials]);

  return (
    <group position={position}>
      <group ref={reelGroup}>
        {symbolLayout.map(({ symbol, rotation, position: symbolPosition }, index) => {
          const symbolDefinition = symbolDefinitions[symbol];

          return (
            <group key={`${symbol}-${index}`} position={symbolPosition}>
              <group rotation={rotation}>
                {
                  renderModelSymbol(symbolDefinition.model)
                }
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
};

interface CenteredModelProps {
  modelConfig: SymbolModelConfig;
}

const CenteredModel = ({ modelConfig }: CenteredModelProps) => {
  const { Component } = modelConfig;
  const spinGroupRef = useRef<Group>(null);
  const contentGroupRef = useRef<Group>(null);
  const initialRotationRef = useRef(Math.random() * TAU);
  const rotationVelocityRef = useRef(
    SYMBOL_SPIN_SPEED *
      (Math.random() > 0.5 ? -1 : 1) *
      (0.75 + Math.random() * 0.5)
  );

  useLayoutEffect(() => {
    const contentGroup = contentGroupRef.current;
    const spinGroup = spinGroupRef.current;

    if (spinGroup) {
      spinGroup.rotation.y = initialRotationRef.current;
    }

    if (!contentGroup) {
      return;
    }

    const alignToCenter = () => {
      contentGroup.position.set(0, 0, 0);
      contentGroup.updateMatrixWorld(true);

      TEMP_BOX.makeEmpty();
      TEMP_BOX.setFromObject(contentGroup);

      if (!Number.isFinite(TEMP_BOX.min.x)) {
        return false;
      }

      TEMP_BOX.getCenter(TEMP_CENTER);
      contentGroup.position.set(
        -TEMP_CENTER.x,
        -TEMP_CENTER.y,
        -TEMP_CENTER.z
      );
      return true;
    };

    if (alignToCenter()) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      alignToCenter();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  useFrame((_, delta) => {
    const spinGroup = spinGroupRef.current;
    if (!spinGroup) {
      return;
    }

    spinGroup.rotation.y += delta * rotationVelocityRef.current;
  });

  return (
    <group ref={spinGroupRef}>
      <group ref={contentGroupRef}>
        <Component castShadow receiveShadow scale={1} />
      </group>
    </group>
  );
};
