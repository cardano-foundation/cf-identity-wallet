import { CameraDirection } from "@capacitor-community/barcode-scanner";

interface ScannerProps {
  routePath?: string;
  cameraDirection?: CameraDirection;
  setIsValueCaptured?: (value: boolean) => void;
  handleReset?: () => void;
}

enum ErrorMessage {
  RECORD_ALREADY_EXISTS_ERROR_MSG = "Record already exists with id",
  INVALID_CONNECTION_URL = "Invalid connection url",
}

export type { ScannerProps };
export { ErrorMessage };
