import { CameraDirection } from "@capacitor-community/barcode-scanner";

interface ScannerProps {
  routePath?: string;
  cameraDirection?: CameraDirection;
  setIsValueCaptured?: (value: boolean) => void;
  handleReset?: () => void;
}
export type { ScannerProps };
