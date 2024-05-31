import { useMemo } from "react";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { CardType, IDENTIFIER_BG_MAPPING } from "../../globals/types";
import { formatShortDate } from "../../utils/formatters";
import { CardItem, CardList as BaseCardList } from "../CardList";
import "./SwitchCardView.scss";
import { CardListProps } from "./SwitchCardView.types";

const CardList = ({
  cardsData,
  cardTypes,
  testId,
  onCardClick,
}: CardListProps) => {
  const cardListData = useMemo(() => {
    return cardsData.map(
      (item): CardItem<IdentifierShortDetails | CredentialShortDetails> => {
        if (cardTypes === CardType.IDENTIFIERS) {
          const identifier = item as IdentifierShortDetails;

          return {
            id: item.id,
            title: identifier.displayName
              .replace(/([A-Z][a-z])/g, " $1")
              .replace(/(\d)/g, " $1"),
            subtitle: formatShortDate(identifier.createdAtUTC),
            data: identifier,
            image: IDENTIFIER_BG_MAPPING[identifier.theme] as string,
          };
        }

        const cred = item as CredentialShortDetails;
        return {
          id: item.id,
          title: cred.credentialType,
          subtitle: formatShortDate(cred.issuanceDate),
          data: cred,
        };
      }
    );
  }, [cardsData, cardTypes]);

  return (
    <BaseCardList
      className="card-switch-view-list"
      data={cardListData}
      onCardClick={onCardClick}
      rounded={false}
      testId={testId}
    />
  );
};

export { CardList };
