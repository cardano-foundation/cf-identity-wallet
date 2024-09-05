import { LensFacing } from "@capacitor-mlkit/barcode-scanning";

interface ScannerProps {
  routePath?: string;
  cameraDirection?: LensFacing;
  setIsValueCaptured?: (value: boolean) => void;
  handleReset?: () => void;
}
export type { ScannerProps };
