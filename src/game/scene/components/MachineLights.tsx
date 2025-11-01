export const MachineLights = () => {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        intensity={1.2}
        position={[6, 10, 5]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight
        position={[0, 6, 4]}
        intensity={1.3}
        angle={Math.PI / 5}
        penumbra={0.4}
        castShadow
      />
    </>
  );
};
