export const MachineLights = () => {
  return (
    <>
      <ambientLight intensity={0.18} color="#2c3040" />
      <hemisphereLight
        intensity={0.55}
        color="#ffe9c6"
        groundColor="#1a2033"
        position={[0, 8, 0]}
      />
      <directionalLight
        intensity={1.35}
        color="#ffe0a6"
        position={[6, 9, 6]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight
        position={[-4, 7, 6]}
        color="#d0f0ff"
        intensity={0.8}
        angle={Math.PI / 6}
        penumbra={0.4}
        castShadow
      />
      <spotLight
        position={[3.5, 6.5, 5]}
        color="#ff8f4f"
        intensity={1.15}
        angle={Math.PI / 5}
        penumbra={0.35}
        castShadow
      />
      <pointLight
        position={[0, 2.2, 3]}
        color="#5ab6ff"
        intensity={0.6}
        distance={14}
        decay={2}
      />
      <pointLight
        position={[0, 2.2, -4]}
        color="#ff5aa5"
        intensity={0.45}
        distance={12}
        decay={2}
      />
    </>
  );
};
