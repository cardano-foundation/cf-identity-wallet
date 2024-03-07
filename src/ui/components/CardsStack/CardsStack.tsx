import { useState } from "react";
import { useHistory } from "react-router-dom";
import "./CardsStack.scss";
import {
  DIDDetails,
  IdentifierShortDetails,
} from "../../../core/agent/services/identifierService.types";
import { CardType } from "../../globals/types";

import { IdentifierCardTemplate } from "../IdentifierCardTemplate";
import { CredCardTemplate } from "../CredCardTemplate";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { AriesAgent } from "../../../core/agent/agent";

const NAVIGATION_DELAY = 250;
const CLEAR_STATE_DELAY = 1000;

const CardsStack = ({
  name,
  cardsType,
  cardsData,
}: {
  name: string;
  cardsType: CardType;
  cardsData: IdentifierShortDetails[] | CredentialShortDetails[];
}) => {
  const history = useHistory();
  const [isActive, setIsActive] = useState(false);

  const renderCards = (
    cardsData: IdentifierShortDetails[] | CredentialShortDetails[]
  ) => {
    return cardsData.map(
      (
        cardData: IdentifierShortDetails | CredentialShortDetails,
        index: number
      ) =>
        cardsType === CardType.IDENTIFIERS ? (
          <IdentifierCardTemplate
            name={name}
            key={index}
            index={index}
            cardData={cardData as IdentifierShortDetails}
            isActive={isActive}
            onHandleShowCardDetails={() => handleShowCardDetails(index)}
          />
        ) : (
          <CredCardTemplate
            name={name}
            key={index}
            index={index}
            shortData={cardData as CredentialShortDetails}
            isActive={isActive}
            onHandleShowCardDetails={() => handleShowCardDetails(index)}
          />
        )
    );
  };

  const handleShowCardDetails = async (index: number) => {
    setIsActive(true);
    let pathname = "";

    if (cardsType === CardType.IDENTIFIERS) {
      const data = cardsData[index] as DIDDetails;
      pathname = `/tabs/identifiers/${data.id}`;
    } else {
      const data = cardsData[index] as CredentialShortDetails;
      pathname = `/tabs/creds/${data.id}`;
    }

    setTimeout(() => {
      history.push({ pathname: pathname });
    }, NAVIGATION_DELAY);

    setTimeout(() => {
      setIsActive(false);
    }, CLEAR_STATE_DELAY);
  };

  return <div className="cards-stack-container">{renderCards(cardsData)}</div>;
};

export { CardsStack, NAVIGATION_DELAY, CLEAR_STATE_DELAY };
