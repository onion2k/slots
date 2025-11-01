import { StaticMesh, type StaticMeshProps } from "./StaticMesh";

export interface DotMatrixDisplayProps extends Omit<StaticMeshProps, "name"> {}

export const DotMatrixDisplay = ({ ...props }: DotMatrixDisplayProps) => {
  return <StaticMesh name="dotMatrixDisplay" castShadow receiveShadow {...props} />;
};
