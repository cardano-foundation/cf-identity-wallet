import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { IdentifierShortDetails } from "../../../core/agent/services/singleSig.types";
import { CardType } from "../../globals/types";

export interface CardsStackProps {
  name: string;
  cardsType: CardType;
  cardsData: IdentifierShortDetails[] | CredentialShortDetails[];
  onShowCardDetails?: () => void;
}
