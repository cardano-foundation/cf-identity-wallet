import { CardsStackProps } from "./CardsStack.types";
import "./CardsStack.scss";
import { i18n } from "../../../i18n";

const CardsStack = ({
  cardsType,
  cardsData,
}: {
  cardsType: string;
  cardsData: CardsStackProps[];
}) => {
  const cardsBackgroundColor = [
    "linear-gradient(91.86deg, #92FFC0 28.76%, #47FF94 119.14%)",
    "linear-gradient(91.86deg, #FFBC60 28.76%, #FFA21F 119.14%)",
    "linear-gradient(91.86deg, #D9EDDF 28.76%, #ACD8B9 119.14%)",
    "linear-gradient(91.86deg, #47E0FF 28.76%, #00C6EF 119.14%)",
    "linear-gradient(91.86deg, #B5C2FF 28.76%, #708AFF 119.14%)",
    "linear-gradient(91.86deg, #FF9780 28.76%, #FF5833 119.14%)",
  ];

  const cardColorSelector = (index: number) => {
    if (index > 5) {
      return cardsBackgroundColor[index % 6];
    } else {
      return cardsBackgroundColor[index % 6];
    }
  };

  const renderCards = (cardsData: CardsStackProps[]) => {
    return cardsData.map((cardData, index) => (
      <div
        key={index}
        className="cards-stack-card"
        style={{ background: cardColorSelector(index) }}
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

  return <div className="cards-stack-container">{renderCards(cardsData)}</div>;
};

export { CardsStack };
