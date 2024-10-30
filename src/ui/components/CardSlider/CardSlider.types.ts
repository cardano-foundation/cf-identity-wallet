import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { CardType } from "../../globals/types";

interface CardProps {
  name: string;
  index: number;
  cardType: CardType;
  cardData: IdentifierShortDetails | CredentialShortDetails;
  handleShowCardDetails: (index: number) => void;
  pickedCard: number | null;
}

interface CardSliderProps {
  title: string;
  name: string;
  cardType: CardType;
  cardsData: IdentifierShortDetails[] | CredentialShortDetails[];
  onShowCardDetails?: () => void;
}

export type { CardSliderProps, CardProps };
