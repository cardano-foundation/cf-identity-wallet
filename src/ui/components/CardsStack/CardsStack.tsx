import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { CardsStackProps } from "./CardsStack.types";
import "./CardsStack.scss";
import { i18n } from "../../../i18n";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { setCardInfoCache } from "../../../store/reducers/cardInfoCache";
import { RootState } from "../../../store";

const CardsStack = ({
  cardsType,
  cardsData,
}: {
  cardsType: string;
  cardsData: CardsStackProps[];
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [isActive, setIsActive] = useState(false);
  const cardsBackgroundColor = [
    "linear-gradient(91.86deg, #92FFC0 28.76%, #47FF94 119.14%)",
    "linear-gradient(91.86deg, #FFBC60 28.76%, #FFA21F 119.14%)",
    "linear-gradient(91.86deg, #D9EDDF 28.76%, #ACD8B9 119.14%)",
    "linear-gradient(91.86deg, #47E0FF 28.76%, #00C6EF 119.14%)",
    "linear-gradient(91.86deg, #B5C2FF 28.76%, #708AFF 119.14%)",
    "linear-gradient(91.86deg, #FF9780 28.76%, #FF5833 119.14%)",
  ];
  const cardColor = useSelector(
    (state: RootState) => state.cardInfoCache.cardProps.cardColor
  );

  const renderCards = (cardsData: CardsStackProps[]) => {
    return cardsData.map((cardData, index) => (
      <div
        key={index}
        id={`card-index-${index}`}
        className={`cards-stack-card ${isActive ? "active" : ""}`}
        style={{
          background:
            cardColor && cardsData.length === 1
              ? cardColor
              : cardsBackgroundColor[index % 6],
        }}
        onClick={() => handleShowCardDetails(index)}
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
                {i18n.t("dids.card.created")}
              </span>
              <span>{cardData.date}</span>
            </div>
          </div>
        )}
      </div>
    ));
  };

  const handleShowCardDetails = (index: number) => {
    dispatch(
      setCardInfoCache({
        cardProps: {
          cardType: cardsType,
          cardColor: cardsBackgroundColor[index % 6],
        },
        cardData: [cardsData[index]],
      })
    );
    setIsActive(true);
    setTimeout(() => {
      history.replace(TabsRoutePath.CARD_DETAILS);
    }, 250);
    setTimeout(() => {
      setIsActive(false);
    }, 1000);
  };

  return <div className="cards-stack-container">{renderCards(cardsData)}</div>;
};

export { CardsStack };
