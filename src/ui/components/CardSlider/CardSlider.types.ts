import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { CardType } from "../../globals/types";

interface CardSliderProps {
  title: string;
  name: string;
  cardType: CardType;
  cardsData: IdentifierShortDetails[] | CredentialShortDetails[];
}

export type { CardSliderProps };
