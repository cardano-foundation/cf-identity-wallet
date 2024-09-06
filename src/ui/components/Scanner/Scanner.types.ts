import { CameraDirection } from "@capacitor-community/barcode-scanner";

interface ScannerProps {
  routePath?: string;
  cameraDirection?: CameraDirection;
  setIsValueCaptured?: (value: boolean) => void;
  handleReset?: () => void;
}

enum ErrorMessage {
  INVALID_CONNECTION_URL = "Invalid connection url",
  GROUP_ID_NOT_MATCH = "Multisig group id not match",
}

export type { ScannerProps };
export { ErrorMessage };
