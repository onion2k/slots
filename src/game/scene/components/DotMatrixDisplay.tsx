import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CanvasTexture,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3
} from "three";
import { StaticMesh, type StaticMeshProps } from "./StaticMesh";

const PIXEL_COLUMNS = 48;
const PIXEL_ROWS = 16;
const FONT_HEIGHT = 7;
const CHARACTER_WIDTH = 5;
const CHARACTER_SPACING = 1;
const TRAILING_BLANK_COLUMNS = PIXEL_COLUMNS;
const CELL_RESOLUTION = 4;
const DOT_RADIUS = CELL_RESOLUTION * 0.38;
const BACKGROUND_COLOR = "#0c1425";
const DIM_PIXEL_COLOR = "#1b2840";
const ACTIVE_PIXEL_COLOR = "#f2c94c";
const FIREWORK_COLORS = ["#f2c94c", "#f2994a", "#eb5757", "#56ccf2", "#6fcf97"];
const CONFETTI_COLORS = ["#f2c94c", "#f2994a", "#eb5757", "#56ccf2", "#6fcf97"];

export type DotMatrixAnimationMode =
  | "horizontal-scroll"
  | "static"
  | "vertical-scroll"
  | "sine-wave";

export type DotMatrixEffect = "none" | "fireworks" | "confetti" | "wipe";

interface FireworkBurst {
  x: number;
  y: number;
  age: number;
  lifetime: number;
  maxRadius: number;
  color: string;
}

interface ConfettiPiece {
  x: number;
  y: number;
  velocityY: number;
  drift: number;
  color: string;
}

interface WipeState {
  progress: number;
}

interface EffectState {
  fireworks: FireworkBurst[];
  confetti: ConfettiPiece[];
  wipe: WipeState;
}

const DEFAULT_MESSAGE = "BREADWINNER!";
const DEFAULT_SCROLL_SPEED = 30; // columns per second
const DEFAULT_ANIMATION_MODE: DotMatrixAnimationMode = "horizontal-scroll";
const DEFAULT_VERTICAL_SCROLL_SPEED = 6; // rows per second
const DEFAULT_SINE_WAVE_AMPLITUDE = 2;
const DEFAULT_SINE_WAVE_FREQUENCY = 0.35; // radians per column
const DEFAULT_SINE_WAVE_SPEED = 2.4; // radians per second
const DEFAULT_EFFECT_INTENSITY = 1;
const DEFAULT_EFFECT: DotMatrixEffect = "none";
const DEFAULT_WIPE_SPEED = 22; // columns per second
const VERTICAL_SCROLL_TRAILING_ROWS = PIXEL_ROWS;
const WIPE_OVERTRAVEL = 4;
const WIPE_GLOW_WIDTH = 2;

const MAX_SINE_AMPLITUDE = Math.max(
  0,
  Math.floor((PIXEL_ROWS - FONT_HEIGHT) / 2)
);

const RAW_FONT: Record<string, string[]> = {
  " ": [
    "00000",
    "00000",
    "00000",
    "00000",
    "00000",
    "00000",
    "00000"
  ],
  "!": [
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "00000",
    "00100"
  ],
  ".": [
    "00000",
    "00000",
    "00000",
    "00000",
    "00000",
    "00110",
    "00110"
  ],
  ":": [
    "00000",
    "00110",
    "00110",
    "00000",
    "00110",
    "00110",
    "00000"
  ],
  "-": [
    "00000",
    "00000",
    "00000",
    "11111",
    "00000",
    "00000",
    "00000"
  ],
  "?": [
    "01110",
    "10001",
    "00001",
    "00010",
    "00100",
    "00000",
    "00100"
  ],
  "0": [
    "01110",
    "10001",
    "10011",
    "10101",
    "11001",
    "10001",
    "01110"
  ],
  "1": [
    "00100",
    "01100",
    "00100",
    "00100",
    "00100",
    "00100",
    "01110"
  ],
  "2": [
    "01110",
    "10001",
    "00001",
    "00010",
    "00100",
    "01000",
    "11111"
  ],
  "3": [
    "11110",
    "00001",
    "00001",
    "01110",
    "00001",
    "00001",
    "11110"
  ],
  "4": [
    "00010",
    "00110",
    "01010",
    "10010",
    "11111",
    "00010",
    "00010"
  ],
  "5": [
    "11111",
    "10000",
    "10000",
    "11110",
    "00001",
    "00001",
    "11110"
  ],
  "6": [
    "01110",
    "10000",
    "10000",
    "11110",
    "10001",
    "10001",
    "01110"
  ],
  "7": [
    "11111",
    "00001",
    "00010",
    "00100",
    "01000",
    "01000",
    "01000"
  ],
  "8": [
    "01110",
    "10001",
    "10001",
    "01110",
    "10001",
    "10001",
    "01110"
  ],
  "9": [
    "01110",
    "10001",
    "10001",
    "01111",
    "00001",
    "00001",
    "01110"
  ],
  A: [
    "01110",
    "10001",
    "10001",
    "11111",
    "10001",
    "10001",
    "10001"
  ],
  B: [
    "11110",
    "10001",
    "10001",
    "11110",
    "10001",
    "10001",
    "11110"
  ],
  C: [
    "01110",
    "10001",
    "10000",
    "10000",
    "10000",
    "10001",
    "01110"
  ],
  D: [
    "11100",
    "10010",
    "10001",
    "10001",
    "10001",
    "10010",
    "11100"
  ],
  E: [
    "11111",
    "10000",
    "10000",
    "11110",
    "10000",
    "10000",
    "11111"
  ],
  F: [
    "11111",
    "10000",
    "10000",
    "11110",
    "10000",
    "10000",
    "10000"
  ],
  G: [
    "01110",
    "10001",
    "10000",
    "10111",
    "10001",
    "10001",
    "01111"
  ],
  H: [
    "10001",
    "10001",
    "10001",
    "11111",
    "10001",
    "10001",
    "10001"
  ],
  I: [
    "01110",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "01110"
  ],
  J: [
    "00111",
    "00010",
    "00010",
    "00010",
    "10010",
    "10010",
    "01100"
  ],
  K: [
    "10001",
    "10010",
    "10100",
    "11000",
    "10100",
    "10010",
    "10001"
  ],
  L: [
    "10000",
    "10000",
    "10000",
    "10000",
    "10000",
    "10000",
    "11111"
  ],
  M: [
    "10001",
    "11011",
    "10101",
    "10101",
    "10001",
    "10001",
    "10001"
  ],
  N: [
    "10001",
    "11001",
    "10101",
    "10011",
    "10001",
    "10001",
    "10001"
  ],
  O: [
    "01110",
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "01110"
  ],
  P: [
    "11110",
    "10001",
    "10001",
    "11110",
    "10000",
    "10000",
    "10000"
  ],
  Q: [
    "01110",
    "10001",
    "10001",
    "10001",
    "10101",
    "10010",
    "01101"
  ],
  R: [
    "11110",
    "10001",
    "10001",
    "11110",
    "10100",
    "10010",
    "10001"
  ],
  S: [
    "01111",
    "10000",
    "10000",
    "01110",
    "00001",
    "00001",
    "11110"
  ],
  T: [
    "11111",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100"
  ],
  U: [
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "01110"
  ],
  V: [
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "01010",
    "00100"
  ],
  W: [
    "10001",
    "10001",
    "10001",
    "10101",
    "10101",
    "11011",
    "10001"
  ],
  X: [
    "10001",
    "10001",
    "01010",
    "00100",
    "01010",
    "10001",
    "10001"
  ],
  Y: [
    "10001",
    "10001",
    "01010",
    "00100",
    "00100",
    "00100",
    "00100"
  ],
  Z: [
    "11111",
    "00001",
    "00010",
    "00100",
    "01000",
    "10000",
    "11111"
  ]
};

const compileFont = (rawFont: Record<string, string[]>) => {
  return Object.entries(rawFont).reduce<Record<string, number[]>>(
    (accumulator, [character, rows]) => {
      const columns = new Array(CHARACTER_WIDTH).fill(0);
      for (let y = 0; y < FONT_HEIGHT; y += 1) {
        const row = rows[y] ?? "";
        for (let x = 0; x < CHARACTER_WIDTH; x += 1) {
          if (row[x] === "1") {
            columns[x] |= 1 << (FONT_HEIGHT - 1 - y);
          }
        }
      }
      accumulator[character] = columns;
      return accumulator;
    },
    {}
  );
};

const DOT_MATRIX_FONT = compileFont(RAW_FONT);
const EMPTY_GLYPH = new Array(CHARACTER_WIDTH).fill(0);

export interface DotMatrixDisplayProps extends Omit<StaticMeshProps, "name"> {
  message?: string;
  scrollSpeed?: number;
  animationMode?: DotMatrixAnimationMode;
  verticalScrollSpeed?: number;
  sineWaveAmplitude?: number;
  sineWaveFrequency?: number;
  sineWaveSpeed?: number;
  effect?: DotMatrixEffect;
  effectIntensity?: number;
  wipeSpeed?: number;
}

export const DotMatrixDisplay = ({
  geometry,
  material,
  message = DEFAULT_MESSAGE,
  scrollSpeed = DEFAULT_SCROLL_SPEED,
  animationMode = DEFAULT_ANIMATION_MODE,
  verticalScrollSpeed = DEFAULT_VERTICAL_SCROLL_SPEED,
  sineWaveAmplitude = DEFAULT_SINE_WAVE_AMPLITUDE,
  sineWaveFrequency = DEFAULT_SINE_WAVE_FREQUENCY,
  sineWaveSpeed = DEFAULT_SINE_WAVE_SPEED,
  effect = DEFAULT_EFFECT,
  effectIntensity = DEFAULT_EFFECT_INTENSITY,
  wipeSpeed = DEFAULT_WIPE_SPEED,
  ...groupProps
}: DotMatrixDisplayProps) => {
  const bounds = useMemo(() => {
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;
    if (!boundingBox) {
      return { width: 1, height: 1, depth: 0.2 };
    }
    const size = new Vector3();
    boundingBox.getSize(size);
    return {
      width: size.x,
      height: size.y,
      depth: size.z
    };
  }, [geometry]);

  const pixelAreaDimensions = useMemo(() => {
    const insetX = bounds.width * 0.08;
    const insetY = bounds.height * 0.1;
    return {
      width: Math.max(bounds.width - insetX * 2, bounds.width * 0.7),
      height: Math.max(bounds.height - insetY * 2, bounds.height * 0.7),
      offsetZ: bounds.depth / 2 + 0.001
    };
  }, [bounds]);

  const textureState = useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = PIXEL_COLUMNS * CELL_RESOLUTION;
    canvas.height = PIXEL_ROWS * CELL_RESOLUTION;
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.imageSmoothingEnabled = false;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.generateMipmaps = false;

    return { canvas, context, texture };
  }, []);

  useEffect(() => {
    return () => {
      textureState?.texture.dispose();
    };
  }, [textureState]);

  const pixelPlaneGeometry = useMemo(() => {
    return new PlaneGeometry(
      pixelAreaDimensions.width,
      pixelAreaDimensions.height
    );
  }, [pixelAreaDimensions.height, pixelAreaDimensions.width]);

  useEffect(() => {
    return () => {
      pixelPlaneGeometry.dispose();
    };
  }, [pixelPlaneGeometry]);

  const pixelPlaneMaterial = useMemo(() => {
    if (!textureState) {
      return null;
    }

    return new MeshBasicMaterial({
      map: textureState.texture,
      transparent: true,
      toneMapped: false
    });
  }, [textureState]);

  useEffect(() => {
    return () => {
      pixelPlaneMaterial?.dispose();
    };
  }, [pixelPlaneMaterial]);

  const centeredVerticalOffset = useMemo(() => {
    return Math.max(Math.floor((PIXEL_ROWS - FONT_HEIGHT) / 2), 0);
  }, []);

  const trailingColumnCount = animationMode === "static" ? 0 : TRAILING_BLANK_COLUMNS;

  const messageColumns = useMemo(() => {
    const normalizedMessage = message.toUpperCase();
    const columns: number[] = [];

    for (const character of normalizedMessage) {
      const glyph = DOT_MATRIX_FONT[character] ?? EMPTY_GLYPH;
      columns.push(...glyph);
      for (let i = 0; i < CHARACTER_SPACING; i += 1) {
        columns.push(0);
      }
    }

    for (let i = 0; i < trailingColumnCount; i += 1) {
      columns.push(0);
    }

    if (columns.length === 0) {
      return new Array(PIXEL_COLUMNS).fill(0);
    }

    return columns;
  }, [message, trailingColumnCount]);

  const normalizedSineAmplitude = Math.min(
    Math.max(sineWaveAmplitude, 0),
    MAX_SINE_AMPLITUDE
  );
  const normalizedSineFrequency = Math.max(sineWaveFrequency, 0);
  const normalizedSineSpeed = sineWaveSpeed;
  const normalizedVerticalSpeed = Math.max(verticalScrollSpeed, 0);
  const normalizedEffectIntensity = Math.max(effectIntensity, 0);
  const normalizedWipeSpeed = Math.max(wipeSpeed, 0);

  const columnOffsetRef = useRef(0);
  const columnAccumulatorRef = useRef(0);
  const verticalOffsetRef = useRef(centeredVerticalOffset);
  const verticalAccumulatorRef = useRef(0);
  const wavePhaseRef = useRef(0);
  const effectStateRef = useRef<EffectState>({
    fireworks: [],
    confetti: [],
    wipe: { progress: -WIPE_OVERTRAVEL }
  });

  const createFireworkBurst = useCallback((): FireworkBurst => {
    return {
      x: Math.random() * PIXEL_COLUMNS,
      y: Math.random() * PIXEL_ROWS,
      age: 0,
      lifetime: 0.6 + Math.random() * 0.6,
      maxRadius: 3 + Math.random() * 5,
      color:
        FIREWORK_COLORS[
          Math.floor(Math.random() * FIREWORK_COLORS.length)
        ] ?? ACTIVE_PIXEL_COLOR
    };
  }, []);

  const createConfettiPiece = useCallback((): ConfettiPiece => {
    return {
      x: Math.random() * PIXEL_COLUMNS,
      y: -Math.random() * PIXEL_ROWS,
      velocityY: 4 + Math.random() * 6,
      drift: (Math.random() - 0.5) * 2,
      color:
        CONFETTI_COLORS[
          Math.floor(Math.random() * CONFETTI_COLORS.length)
        ] ?? ACTIVE_PIXEL_COLOR
    };
  }, []);

  const initializeEffectState = useCallback(() => {
    const nextState: EffectState = {
      fireworks: [],
      confetti: [],
      wipe: { progress: -WIPE_OVERTRAVEL }
    };

    if (effect === "confetti") {
      const targetCount = Math.max(
        8,
        Math.round(20 * Math.max(normalizedEffectIntensity, 0.2))
      );
      for (let i = 0; i < targetCount; i += 1) {
        nextState.confetti.push(createConfettiPiece());
      }
    }

    effectStateRef.current = nextState;
  }, [createConfettiPiece, effect, normalizedEffectIntensity]);

  const drawPixels = useCallback(() => {
    if (!textureState) {
      return;
    }

    const { context, canvas, texture } = textureState;
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const totalColumns = messageColumns.length;
    const baseVerticalOffset =
      animationMode === "vertical-scroll"
        ? verticalOffsetRef.current
        : centeredVerticalOffset;
    const effectState = effectStateRef.current;

    for (let x = 0; x < PIXEL_COLUMNS; x += 1) {
      let columnIndex = -1;
      let messageColumn = 0;

      if (totalColumns > 0) {
        if (animationMode === "static") {
          if (totalColumns <= PIXEL_COLUMNS) {
            const leftPadding = Math.floor((PIXEL_COLUMNS - totalColumns) / 2);
            if (x >= leftPadding && x < leftPadding + totalColumns) {
              columnIndex = x - leftPadding;
            }
          } else {
            const start = Math.floor((totalColumns - PIXEL_COLUMNS) / 2);
            columnIndex = Math.min(start + x, totalColumns - 1);
          }
        } else {
          columnIndex = ((columnOffsetRef.current + x) % totalColumns + totalColumns) % totalColumns;
        }

        if (columnIndex >= 0 && columnIndex < totalColumns) {
          messageColumn = messageColumns[columnIndex];
        }
      }

      const waveOffset =
        animationMode === "sine-wave" && columnIndex >= 0
          ? Math.round(
              Math.sin(
                wavePhaseRef.current + columnIndex * normalizedSineFrequency
              ) * normalizedSineAmplitude
            )
          : 0;

      const columnTop = Math.round(baseVerticalOffset + waveOffset);

      for (let y = 0; y < PIXEL_ROWS; y += 1) {
        let isMessagePixel = false;

        if (columnIndex >= 0) {
          const relativeY = y - columnTop;
          if (relativeY >= 0 && relativeY < FONT_HEIGHT) {
            const glyphRow = FONT_HEIGHT - 1 - relativeY;
            isMessagePixel = (messageColumn & (1 << glyphRow)) !== 0;
          }
        }

        let pixelColor = isMessagePixel ? ACTIVE_PIXEL_COLOR : DIM_PIXEL_COLOR;

        if (effect === "wipe") {
          const wipeState = effectState.wipe;
          const withinWipe = x <= wipeState.progress;
          if (!withinWipe) {
            isMessagePixel = false;
            pixelColor = DIM_PIXEL_COLOR;
          } else if (x >= wipeState.progress - WIPE_GLOW_WIDTH) {
            pixelColor = ACTIVE_PIXEL_COLOR;
          } else if (isMessagePixel) {
            pixelColor = ACTIVE_PIXEL_COLOR;
          }

          if (Math.abs(x - wipeState.progress) < 1) {
            pixelColor = ACTIVE_PIXEL_COLOR;
          }
        }

        if (effect === "fireworks" && effectState.fireworks.length > 0) {
          for (const burst of effectState.fireworks) {
            const progress = burst.lifetime > 0 ? burst.age / burst.lifetime : 1;
            const radius = progress * burst.maxRadius;
            const dx = x + 0.5 - burst.x;
            const dy = y + 0.5 - burst.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const ringThickness = 0.8 + progress * 0.6;

            if (
              distance <= radius &&
              distance >= Math.max(radius - ringThickness, 0)
            ) {
              pixelColor = burst.color;
              break;
            }

            if (distance <= radius * 0.25) {
              pixelColor = burst.color;
              break;
            }
          }
        } else if (effect === "confetti" && effectState.confetti.length > 0) {
          for (const piece of effectState.confetti) {
            if (Math.round(piece.x) === x && Math.round(piece.y) === y) {
              pixelColor = piece.color;
              break;
            }
          }
        }

        const centerX = x * CELL_RESOLUTION + CELL_RESOLUTION / 2;
        const centerY = y * CELL_RESOLUTION + CELL_RESOLUTION / 2;

        context.beginPath();
        context.fillStyle = pixelColor;
        context.arc(centerX, centerY, DOT_RADIUS, 0, Math.PI * 2);
        context.fill();
      }
    }

    texture.needsUpdate = true;
  }, [
    animationMode,
    centeredVerticalOffset,
    effect,
    messageColumns,
    normalizedSineAmplitude,
    normalizedSineFrequency,
    textureState
  ]);

  const updateEffectState = useCallback(
    (delta: number) => {
      if (effect === "none") {
        return false;
      }

      const state = effectStateRef.current;
      let changed = false;

      if (effect === "fireworks") {
        const spawnRate = 0.6 + normalizedEffectIntensity * 1.2;
        for (let i = state.fireworks.length - 1; i >= 0; i -= 1) {
          const burst = state.fireworks[i];
          burst.age += delta;
          if (burst.age >= burst.lifetime) {
            state.fireworks.splice(i, 1);
            changed = true;
          }
        }

        if (Math.random() < delta * spawnRate) {
          state.fireworks.push(createFireworkBurst());
          changed = true;
        }

        if (state.fireworks.length > 0) {
          changed = true;
        }
      } else if (effect === "confetti") {
        const targetCount = Math.max(
          8,
          Math.round(20 * Math.max(normalizedEffectIntensity, 0.2))
        );

        while (state.confetti.length < targetCount) {
          state.confetti.push(createConfettiPiece());
          changed = true;
        }

        while (state.confetti.length > targetCount) {
          state.confetti.pop();
          changed = true;
        }

        for (const piece of state.confetti) {
          piece.y += piece.velocityY * delta;
          piece.x += piece.drift * delta;

          if (piece.x < -1) {
            piece.x = PIXEL_COLUMNS + Math.random();
          } else if (piece.x > PIXEL_COLUMNS + 1) {
            piece.x = -Math.random();
          }

          if (piece.y > PIXEL_ROWS + 2) {
            piece.y = -Math.random() * PIXEL_ROWS;
            piece.x = Math.random() * PIXEL_COLUMNS;
          }
        }

        if (state.confetti.length > 0) {
          changed = true;
        }
      } else if (effect === "wipe") {
        state.wipe.progress += normalizedWipeSpeed * delta;
        if (state.wipe.progress > PIXEL_COLUMNS + WIPE_OVERTRAVEL) {
          state.wipe.progress = -WIPE_OVERTRAVEL;
        }
        changed = true;
      }

      return changed;
    },
    [
      createConfettiPiece,
      createFireworkBurst,
      effect,
      normalizedEffectIntensity,
      normalizedWipeSpeed
    ]
  );

  useEffect(() => {
    columnOffsetRef.current = 0;
    columnAccumulatorRef.current = 0;
    verticalAccumulatorRef.current = 0;
    wavePhaseRef.current = 0;
    verticalOffsetRef.current =
      animationMode === "vertical-scroll"
        ? PIXEL_ROWS + FONT_HEIGHT
        : centeredVerticalOffset;
    initializeEffectState();
    drawPixels();
  }, [
    animationMode,
    centeredVerticalOffset,
    drawPixels,
    initializeEffectState,
    messageColumns
  ]);

  useEffect(() => {
    initializeEffectState();
    drawPixels();
  }, [
    drawPixels,
    effect,
    initializeEffectState,
    normalizedEffectIntensity
  ]);

  useFrame((_, delta) => {
    if (!textureState) {
      return;
    }

    let needsRedraw = false;
    const totalColumns = messageColumns.length;

    if (
      (animationMode === "horizontal-scroll" || animationMode === "sine-wave") &&
      scrollSpeed > 0 &&
      totalColumns > 0
    ) {
      columnAccumulatorRef.current += delta * scrollSpeed;

      if (columnAccumulatorRef.current >= 1) {
        const steps = Math.floor(columnAccumulatorRef.current);
        columnAccumulatorRef.current -= steps;
        columnOffsetRef.current =
          (columnOffsetRef.current + steps) % totalColumns;
        needsRedraw = true;
      }
    }

    if (animationMode === "vertical-scroll" && normalizedVerticalSpeed > 0) {
      verticalAccumulatorRef.current += delta * normalizedVerticalSpeed;

      if (verticalAccumulatorRef.current >= 1) {
        const steps = Math.floor(verticalAccumulatorRef.current);
        verticalAccumulatorRef.current -= steps;
        verticalOffsetRef.current -= steps;

        const minimumOffset = -FONT_HEIGHT - VERTICAL_SCROLL_TRAILING_ROWS;
        if (verticalOffsetRef.current < minimumOffset) {
          const wrapRange =
            PIXEL_ROWS + FONT_HEIGHT + VERTICAL_SCROLL_TRAILING_ROWS;
          verticalOffsetRef.current += wrapRange;
        }

        needsRedraw = true;
      }
    }

    if (
      animationMode === "sine-wave" &&
      normalizedSineAmplitude > 0 &&
      normalizedSineSpeed !== 0
    ) {
      wavePhaseRef.current += delta * normalizedSineSpeed;
      needsRedraw = true;
    }

    const effectChanged = updateEffectState(delta);
    if (effectChanged) {
      needsRedraw = true;
    }

    if (animationMode === "static" && effect === "none") {
      // Static text without effects only needs a single draw.
      return;
    }

    if (needsRedraw) {
      drawPixels();
    }
  });

  return (
    <group name="dotMatrixDisplay" {...groupProps}>
      <StaticMesh
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
      />
      {textureState && pixelPlaneMaterial && (
        <mesh
          position={[0, 0, pixelAreaDimensions.offsetZ]}
          geometry={pixelPlaneGeometry}
          material={pixelPlaneMaterial}
        />
      )}
    </group>
  );
};
