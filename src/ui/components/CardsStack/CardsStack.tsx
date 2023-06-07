import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { CardsStackProps } from "./CardsStack.types";
import "./CardsStack.scss";
import { i18n } from "../../../i18n";

const NAVIGATION_DELAY = 250;
const CLEAR_STATE_DELAY = 1000;

const cardsBackgroundColor = [
  ["#92FFC0", "#47FF94"],
  ["#FFBC60", "#FFA21F"],
  ["#D9EDDF", "#ACD8B9"],
  ["#47E0FF", "#00C6EF"],
  ["#B5C2FF", "#708AFF"],
  ["#FF9780", "#FF5833"],
];

const Card = ({
  cardData,
  isActive,
  index = 0,
  onHandleShowCardDetails
}: {
  cardData: CardsStackProps;
  isActive: boolean;
  index: number;
}) => {
  return <div
      key={index}
      data-testid={`card-stack-index-${index}`}
      className={`cards-stack-card ${isActive ? "active" : ""}`}
      onClick={() => {
        onHandleShowCardDetails(index);
      }}
      style={{
        background: `linear-gradient(91.86deg, ${
            cardsBackgroundColor[index % 6][0]
        } 28.76%, ${cardsBackgroundColor[index % 6][1]} 119.14%)`,
      }}
  >
    {cardsType === "dids" && (
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
            <span>{cardData.date}</span>
          </div>
        </div>
    )}
  </div>
}
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
    return cardsData.map((cardData: CardsStackProps, index: number) => (
      <div
        key={index}
        data-testid={`card-stack-index-${index}`}
        className={`cards-stack-card ${isActive ? "active" : ""}`}
        onClick={() => {
          if (cardsData.length > 1) {
            handleShowCardDetails(index);
          }
        }}
        style={{
          background: `linear-gradient(91.86deg, ${
            cardsBackgroundColor[index % 6][0]
          } 28.76%, ${cardsBackgroundColor[index % 6][1]} 119.14%)`,
        }}
      >
        {cardsType === "dids" && (
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
              <span>{cardData.date}</span>
            </div>
          </div>
        )}
      </div>
    ));
  };

  const handleShowCardDetails = (index: number) => {
    const isDids = cardsType === "dids";
    // fake db query based on did id
    /*
    let did;
    if (isDids) {
      did = didsMock.find((did) => did.id === cardsData[index].id);
    } else {
      // credentials
      did = {};
    }

    did = {
      cardProps: {
        cardType: cardsType,
        cardColor: cardsBackgroundColor[index % 6],
      },
      cardData: did,
    };*/

    setIsActive(true);

    setTimeout(() => {
      history.push({
        pathname: `/tabs/${isDids ? "dids" : "creds"}/${cardsData[index].id}`,
      });
    }, NAVIGATION_DELAY);

    setTimeout(() => {
      setIsActive(false);
    }, CLEAR_STATE_DELAY);
  };

  return <div className="cards-stack-container">{renderCards(cardsData)}</div>;
};

export { CardsStack, NAVIGATION_DELAY, CLEAR_STATE_DELAY };
