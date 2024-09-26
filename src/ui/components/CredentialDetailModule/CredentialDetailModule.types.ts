import { ACDCDetails } from "../../../core/agent/services/credentialService.types";
import { NotificationDetailState } from "../../pages/NotificationDetails/NotificationDetails.types";
import { HardwareBackButtonConfig } from "../PageHeader/PageHeader.types";

type CredHistory = NotificationDetailState;

enum BackReason {
  DELETE,
  ARCHIVED,
  RESTORE,
  CLOSE,
}

type CredentialDetailModuleBaseProps = {
  pageId: string;
  id: string;
  credDetail?: ACDCDetails;
  onClose?: (reason: BackReason) => void;
  navAnimation?: boolean;
  hardwareBackButtonConfig?: HardwareBackButtonConfig;
} & (
  | { viewOnly: false }
  | { viewOnly: true; credDetail: ACDCDetails | undefined }
);

type CredentialDetailModuleLightModeProps = {
  isLightMode: true;
  selected: boolean;
  setSelected: (value: boolean) => void;
} & CredentialDetailModuleBaseProps;

type CredentialDetailModuleNormalModeProps = {
  isLightMode?: undefined;
} & CredentialDetailModuleBaseProps;

type CredentialDetailModuleProps =
  | CredentialDetailModuleLightModeProps
  | CredentialDetailModuleNormalModeProps;

type CredentialDetailModalProps = CredentialDetailModuleProps & {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export type {
  CredHistory,
  CredentialDetailModuleProps,
  CredentialDetailModalProps,
};

export { BackReason };
