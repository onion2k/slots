import { useEffect, useMemo, useRef } from "react";
import { Group, MeshStandardMaterial } from "three";
import { useFrame } from "@react-three/fiber";
import { shallow } from "zustand/shallow";
import {
  useSlotsStore,
  type ReelRuntimeState
} from "@game/state/slotsStore";
import { easeOutCubic } from "@game/utils/easing";
import type { SymbolModelConfig } from "@game/core/fruitMachineConfig";

const TAU = Math.PI * 2;

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
        position: [0, y, z] as [number, number, number]
      };
    });
  }, [config.reelRadius, reel.config.symbols]);

  const { symbolDefinitions, itemScale } = config;

  const renderModelSymbol = (modelConfig: SymbolModelConfig | undefined) => {
    if (!modelConfig) {
      return null;
    }

    const { Component, baseScale } = modelConfig;

    return (
      <Component
        castShadow
        receiveShadow
        scale={1}
      />
    );
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
        {symbolLayout.map(({ symbol, angle, position: symbolPosition }, index) => {
          const symbolDefinition = symbolDefinitions[symbol];
          const material = symbolMaterials[index];

          return (
            <group key={`${symbol}-${index}`} position={symbolPosition}>
              <group rotation={[angle, 0, 0]}>
                {symbolDefinition.geometry === "model" ? (
                  renderModelSymbol(symbolDefinition.model)
                ) : (
                  <mesh castShadow>
                    {symbolDefinition.geometry === "box" ? (
                      <boxGeometry
                        args={[
                          itemScale,
                          itemScale,
                          itemScale
                        ]}
                      />
                    ) : (
                      <sphereGeometry args={[itemScale * 0.65, 32, 32]} />
                    )}
                    {material && <primitive object={material} attach="material" />}
                  </mesh>
                )}
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
};
