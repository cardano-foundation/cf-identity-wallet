import { ACDCDetails } from "../../../core/agent/services/credentialService.types";
import { MemberInfo } from "../../pages/NotificationDetails/components/CredentialRequest/CredentialRequest.types";
import { NotificationDetailState } from "../../pages/NotificationDetails/NotificationDetails.types";
import { HardwareBackButtonConfig } from "../PageHeader/PageHeader.types";

type CredHistory = NotificationDetailState;

enum BackReason {
  DELETE,
  ARCHIVED,
  RESTORE,
  CLOSE,
}

interface CredentialDetailModuleBaseProps {
  pageId: string;
  id: string;
  credDetail?: ACDCDetails;
  onClose?: (reason: BackReason) => void;
  navAnimation?: boolean;
  hardwareBackButtonConfig?: HardwareBackButtonConfig;
  viewOnly?: boolean;
  joinedCredRequestMembers?: MemberInfo[];
}

interface CredentialDetailModuleLightModeProps
  extends CredentialDetailModuleBaseProps {
  isLightMode: true;
  selected: boolean;
  setSelected: (value: boolean) => void;
}

interface CredentialDetailModuleNormalModeProps
  extends CredentialDetailModuleBaseProps {
  isLightMode?: undefined;
}

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
