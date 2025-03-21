import { HardwareBackButtonConfig } from "../PageHeader/PageHeader.types";

interface IdentifierDetailModuleProps {
  pageId: string;
  identifierDetailId: string;
  onClose?: (animation?: boolean) => void;
  navAnimation: boolean;
  hardwareBackButtonConfig?: HardwareBackButtonConfig;
  restrictedOptions?: boolean;
}

interface IdentifierDetailModalProps
  extends Omit<IdentifierDetailModuleProps, "navAnimation"> {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export type { IdentifierDetailModuleProps, IdentifierDetailModalProps };
