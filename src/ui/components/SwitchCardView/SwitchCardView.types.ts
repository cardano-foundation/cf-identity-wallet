import { ReactNode } from "react";
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
  hideHeader?: boolean;
  name: string;
  onShowCardDetails?: () => void;
  className?: string;
  filters?: ReactNode;
  placeholder?: ReactNode;
}

interface CardListProps {
  cardsData: IdentifierShortDetails[] | CredentialShortDetails[];
  cardTypes: CardType;
  testId?: string;
  onCardClick?: (card: IdentifierShortDetails | CredentialShortDetails) => void;
}

export type { SwitchCardViewProps, CardListProps };
export { CardListViewType };
