import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  DidProps,
  CredCardProps,
  DidCardProps,
  CredProps,
} from "./CardsStack.types";
import "./CardsStack.scss";
import { i18n } from "../../../i18n";
import { formatDate } from "../../../utils";

const NAVIGATION_DELAY = 250;
const CLEAR_STATE_DELAY = 1000;

const CredCard = ({
  cardData,
  isActive,
  index = 0,
  onHandleShowCardDetails,
}: CredCardProps) => {
  let shadowClass = "";
  if (index === 0) {
    shadowClass = "bottom-shadow";
  } else if (index !== 0) {
    shadowClass = "top-shadow";
  }
  return (
    <div
      key={index}
      data-testid={`cred-card-stack${
        index !== undefined ? `-index-${index}` : ""
      }`}
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
      <div className="cards-stack-cred-layout">
        <div className="card-header">
          <img
            src={cardData.issuerLogo}
            className="card-logo"
            alt="card-logo"
          />
          <span>{cardData.credentialType}</span>
        </div>
        <div className="card-body">
          <span> </span>
        </div>
        <div className="card-footer">
          <div className="card-footer-column">
            <span className="card-footer-column-label">
              {i18n.t("creds.card.layout.name")}
            </span>
            <span>{cardData.nameOnCredential}</span>
          </div>
          <div className="card-footer-column">
            <span className="card-footer-column-label">
              {i18n.t("creds.card.layout.issued")}
            </span>
            <span>{formatDate(cardData.issuanceDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DidCard = ({
  cardData,
  isActive,
  index = 0,
  onHandleShowCardDetails,
}: DidCardProps) => {
  let shadowClass = "";
  if (index === 0) {
    shadowClass = "bottom-shadow";
  } else if (index !== 0) {
    shadowClass = "top-shadow";
  }
  return (
    <div
      key={index}
      data-testid={`did-card-stack${
        index !== undefined ? `-index-${index}` : ""
      }`}
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
  cardsData: DidProps[] | CredProps[];
}) => {
  const history = useHistory();
  const [isActive, setIsActive] = useState(false);

  const renderCards = (cardsData: DidProps[] | CredProps[]) => {
    return cardsData.map((cardData: DidProps | CredProps, index: number) =>
      cardsType === "dids" ? (
        <DidCard
          key={index}
          index={index}
          cardData={cardData as DidProps}
          isActive={isActive}
          onHandleShowCardDetails={() => handleShowCardDetails(index)}
        />
      ) : (
        <CredCard
          key={index}
          index={index}
          cardData={cardData as CredProps}
          isActive={isActive}
          onHandleShowCardDetails={() => handleShowCardDetails(index)}
        />
      )
    );
  };

  const handleShowCardDetails = (index: number) => {
    setIsActive(true);
    let pathname = "";

    if (cardsType === "dids") {
      const data = cardsData[index] as DidProps;
      pathname = `/tabs/dids/${data.id}`;
    } else {
      const data = cardsData[index] as CredProps;
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

export { DidCard, CredCard, CardsStack, NAVIGATION_DELAY, CLEAR_STATE_DELAY };
