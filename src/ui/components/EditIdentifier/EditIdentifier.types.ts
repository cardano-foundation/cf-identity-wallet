import { IdentifierDetails } from "../../../core/agent/services/identifier.types";

interface EditIdentifierProps {
  modalIsOpen: boolean;
  setModalIsOpen: (value: boolean) => void;
  cardData: IdentifierDetails;
  setCardData: (data: IdentifierDetails) => void;
}

export type { EditIdentifierProps };
