import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import "@styles/app.css";
import { FruitMachineScene } from "@game/scene/FruitMachineScene";
import { GameHud } from "@ui/GameHud";
import { OrbitControls } from "@react-three/drei";

const App = () => {
  return (
    <div className="app-shell">
      <Canvas
        className="app-canvas"
        camera={{ position: [0, 3.5, 20], fov: 40, near: 0.1, far: 100 }}
        shadows
      >
        <color attach="background" args={["#0b111c"]} />
        <Suspense fallback={null}>
          <FruitMachineScene />
        </Suspense>
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={20}
          maxDistance={20}
          target={[0, 2.5, 0]}
        />
      </Canvas>
      <div className="hud-overlay">
        <GameHud />
      </div>
    </div>
  );
};

export default App;
