import { LensFacing } from "@capacitor-mlkit/barcode-scanning";
import { OperationType } from "../../globals/types";

interface ScannerProps {
  routePath?: string;
  cameraDirection?: LensFacing;
  setIsValueCaptured?: (value: boolean) => void;
  handleReset?: (navTo?: string, operation?: OperationType) => void;
  onCheckPermissionFinish?: (permission: boolean) => void;
}

enum ErrorMessage {
  INVALID_CONNECTION_URL = "Invalid connection url",
  GROUP_ID_NOT_MATCH = "Multisig group id not match",
}

export type { ScannerProps };
export { ErrorMessage };
