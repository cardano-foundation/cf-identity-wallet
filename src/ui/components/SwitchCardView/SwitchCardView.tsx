import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { ListHeader } from "../ListHeader";
import { CardListViewType, SwitchCardViewProps } from "./SwitchCardView.types";
import { CardsStack } from "../CardsStack";
import { CardItem, CardList } from "../CardList";
import { CardType, IDENTIFIER_BG_MAPPING } from "../../globals/types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { formatShortDate } from "../../utils/formatters";
import { combineClassNames } from "../../utils/style";
import "./SwitchCardView.scss";

const SwitchCardView = ({
  title,
  cardsData,
  cardTypes,
  name,
  hideHeader,
  defaultViewType,
  className,
  onShowCardDetails,
}: SwitchCardViewProps) => {
  const history = useHistory();
  const [type, setType] = useState<CardListViewType>(
    defaultViewType ?? CardListViewType.Stack
  );

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

  const handleOpenDetail = (
    data: IdentifierShortDetails | CredentialShortDetails
  ) => {
    let pathname = "";
    if (cardTypes === CardType.IDENTIFIERS) {
      pathname = `/tabs/identifiers/${data.id}`;
    } else {
      pathname = `/tabs/creds/${data.id}`;
    }

    history.push({ pathname: pathname });
  };

  const classes = combineClassNames("card-switch-view", className);

  return (
    <div className={classes}>
      {!hideHeader && (
        <ListHeader
          hasAction
          activeActionIndex={type}
          title={title}
          onFirstIconClick={() => setType(CardListViewType.Stack)}
          onSecondIconClick={() => setType(CardListViewType.List)}
        />
      )}
      {type === CardListViewType.Stack ? (
        <CardsStack
          cardsData={cardsData}
          cardsType={cardTypes}
          onShowCardDetails={onShowCardDetails}
          name={name}
        />
      ) : (
        <CardList
          className="card-switch-view-list"
          data={cardListData}
          onCardClick={handleOpenDetail}
        />
      )}
    </div>
  );
};

export { SwitchCardView };
