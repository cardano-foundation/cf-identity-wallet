import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { CardType } from "../../globals/types";
import { combineClassNames } from "../../utils/style";
import { CardsStack } from "../CardsStack";
import { ListHeader } from "../ListHeader";
import { CardList } from "./CardList";
import "./SwitchCardView.scss";
import { CardListViewType, SwitchCardViewProps } from "./SwitchCardView.types";
import { TabsRoutePath } from "../../../routes/paths";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getIdentifierViewTypeCacheCache,
  setViewTypeCache,
} from "../../../store/reducers/identifierViewTypeCache";
import { Agent } from "../../../core/agent/agent";

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
  const dispatch = useAppDispatch();
  const [type, setType] = useState<CardListViewType>(CardListViewType.Stack);
  const viewTypeCache = useAppSelector(getIdentifierViewTypeCacheCache);
  useEffect(() => {
    if (!viewTypeCache) {
      setType(CardListViewType.Stack);
      return;
    }
    setViewType(viewTypeCache.viewType as CardListViewType);
  }, [viewTypeCache]);

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
    Agent.agent.basicStorage
      .createOrUpdateBasicRecord(
        new BasicRecord({
          id: MiscRecordId.IDENTIFIER_VIEW_TYPE,
          content: { viewType },
        })
      )
      .then(() => {
        dispatch(setViewTypeCache(viewType));
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
