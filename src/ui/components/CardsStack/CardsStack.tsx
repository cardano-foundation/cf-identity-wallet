import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  CardsStackProps,
  CredCardProps,
  DidCardProps,
} from "./CardsStack.types";
import "./CardsStack.scss";
import { i18n } from "../../../i18n";
import {formatDate} from "../../../utils";

const NAVIGATION_DELAY = 250;
const CLEAR_STATE_DELAY = 1000;

const CredCard = ({
  cardData,
  isActive,
  index = 0,
  onHandleShowCardDetails,
}: CredCardProps) => {
  // TODO: Implement credential card
  return null;
};

const DidCard = ({
  cardData,
  isActive,
  index,
  onHandleShowCardDetails,
}: DidCardProps) => {
  let shadowClass = "";
  if (index === undefined){
    shadowClass = "bottom-shadow";
  } else if (index !== 0){
    shadowClass = "top-shadow"
  }
  return (
    <div
      key={index}
      data-testid={`card-stack${index !== undefined ? `-index-${index}` : ""}`}
      className={`cards-stack-card ${isActive ? "active" : ""} ${shadowClass}`}
      onClick={() => {
        if (onHandleShowCardDetails) {
          onHandleShowCardDetails(index);
        }
      }}
      style={{
        background: `linear-gradient(91.86deg, ${cardData.colors[0]} 28.76%, ${cardData.colors[1]} 119.14%)`,
      }}
    >
      <div className="cards-stack-did-layout">
        <div className="card-header">
          <span>{cardData.type}</span>
          <span>{cardData.name}</span>
        </div>
        <div className="card-body">
          <span>{cardData.id}</span>
        </div>
        <div className="card-footer">
          <span className="card-created-label">
            {i18n.t("dids.card.layout.created")}
          </span>
          <span>{formatDate(cardData.date)}</span>
        </div>
      </div>
    </div>
  );
};
const CardsStack = ({
  cardsType,
  cardsData,
}: {
  cardsType: string;
  cardsData: CardsStackProps[];
}) => {
  const history = useHistory();
  const [isActive, setIsActive] = useState(false);

  const renderCards = (cardsData: CardsStackProps[]) => {
    return cardsData.map((cardData: CardsStackProps, index: number) =>
      cardsType === "dids" ? (
        <DidCard
          key={index}
          index={index}
          cardData={cardData}
          isActive={isActive}
          onHandleShowCardDetails={() => handleShowCardDetails(index)}
        />
      ) : (
        <CredCard
          key={index}
          index={index}
          cardData={cardData}
          isActive={isActive}
          onHandleShowCardDetails={() => handleShowCardDetails(index)}
        />
      )
    );
  };

  const handleShowCardDetails = (index: number) => {
    setIsActive(true);
    setTimeout(() => {
      history.push({
        pathname: `/tabs/${cardsType === "dids" ? "dids" : "creds"}/${
          cardsData[index].id
        }`,
      });
    }, NAVIGATION_DELAY);

    setTimeout(() => {
      setIsActive(false);
    }, CLEAR_STATE_DELAY);
  };

  return <div className="cards-stack-container">{renderCards(cardsData)}</div>;
};

export { DidCard, CredCard, CardsStack, NAVIGATION_DELAY, CLEAR_STATE_DELAY };
