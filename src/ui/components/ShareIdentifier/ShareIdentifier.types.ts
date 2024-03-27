import { KERIDetails } from "../../../core/agent/services/identifierService.types";

interface ShareIdentifierProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  cardData: KERIDetails;
}

export type { ShareIdentifierProps };
