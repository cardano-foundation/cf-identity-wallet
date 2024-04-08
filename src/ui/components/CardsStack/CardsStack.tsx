import { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import "./CardsStack.scss";
import {
  IdentifierDetails,
  IdentifierShortDetails,
} from "../../../core/agent/services/identifierService.types";
import { CardType } from "../../globals/types";

import { IdentifierCardTemplate } from "../IdentifierCardTemplate";
import { CredCardTemplate } from "../CredCardTemplate";
import {
  CredentialShortDetails,
  JSONObject,
} from "../../../core/agent/services/credentialService.types";
import { CardsStackProps } from "./CardsStack.types";

const NAVIGATION_DELAY = 250;
const CLEAR_STATE_DELAY = 1000;

const CardsStack = ({
  name,
  cardsType,
  cardsData,
  onShowCardDetails,
}: CardsStackProps) => {
  const history = useHistory();
  const [pickedCardIndex, setPickedCardIndex] = useState<number | null>(null);
  const inShowCardProgress = useRef(false);

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
            isActive={pickedCardIndex !== null}
            pickedCard={index === pickedCardIndex}
            onHandleShowCardDetails={() => handleShowCardDetails(index)}
          />
        ) : (
          <CredCardTemplate
            name={name}
            key={index}
            index={index}
            cardData={cardData as CredentialShortDetails}
            isActive={pickedCardIndex !== null}
            pickedCard={index === pickedCardIndex}
            onHandleShowCardDetails={() => handleShowCardDetails(index)}
          />
        )
    );
  };

  const handleShowCardDetails = async (index: number) => {
    if (inShowCardProgress.current) return;
    inShowCardProgress.current = true;
    setPickedCardIndex(index);
    onShowCardDetails?.();
    let pathname = "";

    if (cardsType === CardType.IDENTIFIERS) {
      const data = cardsData[index] as IdentifierDetails;
      pathname = `/tabs/identifiers/${data.id}`;
    } else {
      const data = cardsData[index] as CredentialShortDetails;
      pathname = `/tabs/creds/${data.id}`;
    }

    setTimeout(() => {
      history.push({ pathname: pathname });
    }, NAVIGATION_DELAY);

    setTimeout(() => {
      setPickedCardIndex(null);
      inShowCardProgress.current = false;
    }, CLEAR_STATE_DELAY);
  };

  const containerClasses = `cards-stack-container ${
    pickedCardIndex !== null ? "transition-start" : ""
  }`;

  return <div className={containerClasses}>{renderCards(cardsData)}</div>;
};

export { CardsStack, NAVIGATION_DELAY, CLEAR_STATE_DELAY };
