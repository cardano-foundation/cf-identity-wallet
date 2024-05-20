import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { PreferencesKeys, PreferencesStorage } from "../../../core/storage";
import { CardType } from "../../globals/types";
import { combineClassNames } from "../../utils/style";
import { CardsStack } from "../CardsStack";
import { ListHeader } from "../ListHeader";
import { CardList } from "./CardList";
import "./SwitchCardView.scss";
import { CardListViewType, SwitchCardViewProps } from "./SwitchCardView.types";
import { TabsRoutePath } from "../navigation/TabsMenu";

const SwitchCardView = ({
  title,
  cardsData,
  cardTypes,
  name,
  hideHeader,
  className,
  onShowCardDetails,
}: SwitchCardViewProps) => {
  const history = useHistory();
  const [type, setType] = useState<CardListViewType>(CardListViewType.Stack);

  useEffect(() => {
    const getDefaultViewType = async () => {
      try {
        const storageViewType = await PreferencesStorage.get(
          PreferencesKeys.APP_IDENTIFIER_VIEW_TYPE
        );

        if (!storageViewType) {
          setType(CardListViewType.Stack);
          return;
        }

        setType(Number(storageViewType.viewType) as CardListViewType);
      } catch (e) {
        // TODO: handle error
      }
    };

    getDefaultViewType();
  }, []);

  const handleOpenDetail = (
    data: IdentifierShortDetails | CredentialShortDetails
  ) => {
    let pathname = "";
    if (cardTypes === CardType.IDENTIFIERS) {
      pathname = `${TabsRoutePath.IDENTIFIERS}/${data.id}`;
    } else {
      pathname = `${TabsRoutePath.CREDENTIALS}/${data.id}`;
    }

    history.push({ pathname: pathname });
  };

  const setViewType = (viewType: CardListViewType) => {
    setType(viewType);
    PreferencesStorage.set(PreferencesKeys.APP_IDENTIFIER_VIEW_TYPE, {
      viewType,
    });
  };

  const classes = combineClassNames("card-switch-view", className);

  return (
    <div className={classes}>
      {!hideHeader && (
        <ListHeader
          hasAction
          activeActionIndex={type}
          title={title}
          onFirstIconClick={() => setViewType(CardListViewType.Stack)}
          onSecondIconClick={() => setViewType(CardListViewType.List)}
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
          cardTypes={cardTypes}
          cardsData={cardsData}
          onCardClick={handleOpenDetail}
          testId="card-list"
        />
      )}
    </div>
  );
};

export { SwitchCardView };
