import { useState } from "react";
import { useHistory } from "react-router-dom";
import "./CardsStack.scss";
import { IonButton, IonChip, IonIcon, IonLabel } from "@ionic/react";
import { hourglassOutline } from "ionicons/icons";
import { formatShortDate } from "../../../utils";
import { i18n } from "../../../i18n";
import {
  CredCardProps,
  CredentialShortDetails,
  DidCardProps,
} from "./CardsStack.types";
import {
  DIDDetails,
  IdentifierShortDetails,
  IdentifierType,
} from "../../../core/agent/agent.types";
import { cardTypes } from "../../constants/dictionary";
import { Alert } from "../Alert";
import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { AriesAgent } from "../../../core/agent/agent";

const NAVIGATION_DELAY = 250;
const CLEAR_STATE_DELAY = 1000;

const CredCard = ({
  cardData,
  isActive,
  index,
  onHandleShowCardDetails,
}: CredCardProps) => {
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  const divStyle = {
    background: `linear-gradient(91.86deg, ${cardData.colors[0]} 28.76%, ${cardData.colors[1]} 119.14%)`,
    zIndex: index,
  };

  const handleArchiveCredential = async (id: string) => {
    // @TODO - sdisalvo: TO BE REMOVED temporary function to archive credential
    await AriesAgent.agent.credentials.archiveCredential(id);
  };

  return (
    <>
      <div
        key={index}
        data-testid={`cred-card-stack${
          index !== undefined ? `-index-${index}` : ""
        }`}
        className={`cards-stack-card ${isActive ? "active" : ""}`}
        onClick={() => {
          if (cardData.status === CredentialMetadataRecordStatus.PENDING) {
            //  setAlertIsOpen(true);
            handleArchiveCredential(cardData.id);
          } else if (onHandleShowCardDetails) {
            onHandleShowCardDetails(index);
          }
        }}
        style={divStyle}
      >
        <div className={`cards-stack-cred-layout ${cardData.status}`}>
          <div className="card-header">
            <span className="card-logo">
              <img
                src={
                  cardData.issuerLogo ??
                  "https://www.w3.org/Icons/WWW/w3c_home_nb-v.svg"
                }
                alt="card-logo"
              />
            </span>
            {cardData.status === CredentialMetadataRecordStatus.PENDING ? (
              <IonChip>
                <IonIcon
                  icon={hourglassOutline}
                  color="primary"
                ></IonIcon>
                <span>{CredentialMetadataRecordStatus.PENDING}</span>
              </IonChip>
            ) : (
              <span className="credential-type">
                {cardData.credentialType.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </span>
            )}
          </div>
          <div className="card-body">
            <span>
              {cardData.status === CredentialMetadataRecordStatus.PENDING ? (
                <>&nbsp;</>
              ) : (
                <>&nbsp;</>
              )}
            </span>
          </div>
          <div className="card-footer">
            <div className="card-footer-column">
              <span className="card-footer-column-label">
                {i18n.t("creds.card.layout.name")}
              </span>
              <span className="card-footer-column-value">
                {cardData.status === CredentialMetadataRecordStatus.PENDING ? (
                  <>&nbsp;</>
                ) : (
                  // cardData.nameOnCredential
                  ""
                )}
              </span>
            </div>
            <div className="card-footer-column">
              <span className="card-footer-column-label">
                {i18n.t("creds.card.layout.issued")}
              </span>
              <span className="card-footer-column-value">
                {cardData.status === CredentialMetadataRecordStatus.PENDING ? (
                  <>&nbsp;</>
                ) : (
                  formatShortDate(cardData.issuanceDate)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-confirm"
        headerText={i18n.t("creds.create.alert.title")}
        confirmButtonText={`${i18n.t("creds.create.alert.confirm")}`}
        actionConfirm={() => setAlertIsOpen(false)}
      />
    </>
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
          <span>
            {cardData.method === IdentifierType.KEY ? "did:key" : "KERI"}
          </span>
          <span>{cardData.displayName}</span>
        </div>
        <div className="card-body">
          <span>{cardData.id}</span>
        </div>
        <div className="card-footer">
          <span className="card-footer-column">
            <span className="card-footer-column-label">
              {i18n.t("identity.card.layout.created")}
            </span>
            <span className="card-footer-column-info">
              {formatShortDate(cardData.createdAtUTC)}
            </span>
          </span>
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
        cardsType === cardTypes.dids ? (
          <DidCard
            key={index}
            index={index}
            cardData={cardData as IdentifierShortDetails}
            isActive={isActive}
            onHandleShowCardDetails={() => handleShowCardDetails(index)}
          />
        ) : (
          <CredCard
            key={index}
            index={index}
            cardData={cardData as CredentialShortDetails}
            isActive={isActive}
            onHandleShowCardDetails={() => handleShowCardDetails(index)}
          />
        )
    );
  };

  const handleShowCardDetails = (index: number) => {
    setIsActive(true);
    let pathname = "";

    if (cardsType === cardTypes.dids) {
      const data = cardsData[index] as DIDDetails;
      pathname = `/tabs/dids/${data.id}`;
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

export { DidCard, CredCard, CardsStack, NAVIGATION_DELAY, CLEAR_STATE_DELAY };
