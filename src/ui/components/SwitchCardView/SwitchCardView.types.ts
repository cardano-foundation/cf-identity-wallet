import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { CardType } from "../../globals/types";

enum CardListViewType {
  Stack,
  List,
}

interface SwitchCardViewProps {
  title: string;
  cardsData: IdentifierShortDetails[] | CredentialShortDetails[];
  cardTypes: CardType;
  defaultViewType?: CardListViewType;
  hideHeader?: boolean;
  name: string;
  onShowCardDetails?: () => void;
  className?: string;
}

export type { SwitchCardViewProps };
export { CardListViewType };
