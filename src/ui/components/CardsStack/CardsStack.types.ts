import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { CardType } from "../../globals/types";

export interface CardsStackProps {
  name: string;
  cardsType: CardType;
  cardsData: IdentifierShortDetails[] | CredentialShortDetails[];
  onShowCardDetails?: () => void;
}
