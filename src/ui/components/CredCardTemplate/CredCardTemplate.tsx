import { useState } from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { hourglassOutline } from "ionicons/icons";
import { Alert } from "../Alert";
import { CredCardTemplateProps } from "./CredCardTemplate.types";
import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { formatShortDate } from "../../../utils";
import { i18n } from "../../../i18n";
import W3CLogo from "../../../ui/assets/images/w3c-logo.svg";

const CredCardTemplate = ({
  cardData,
  isActive,
  index,
  onHandleShowCardDetails,
}: CredCardTemplateProps) => {
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  const divStyle = {
    background: `linear-gradient(91.86deg, ${cardData.colors[0]} 28.76%, ${cardData.colors[1]} 119.14%)`,
    zIndex: index,
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
            setAlertIsOpen(true);
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
                src={cardData.issuerLogo ?? W3CLogo}
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

export { CredCardTemplate };
