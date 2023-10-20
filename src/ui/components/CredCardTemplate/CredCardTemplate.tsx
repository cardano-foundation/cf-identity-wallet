import { useState } from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { hourglassOutline } from "ionicons/icons";
import { Alert } from "../Alert";
import { CredCardTemplateProps } from "./CredCardTemplate.types";
import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { i18n } from "../../../i18n";
import W3CLogo from "../../../ui/assets/images/w3c-logo.svg";
import "./CredCardTemplate.scss";
import CardBodyPending from "./CardBodyPending";

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
        data-testid={`cred-card-template${
          index !== undefined ? `-index-${index}` : ""
        }`}
        className={`cred-card-template ${isActive ? "active" : ""}`}
        onClick={() => {
          if (cardData.status === CredentialMetadataRecordStatus.PENDING) {
            setAlertIsOpen(true);
          } else if (onHandleShowCardDetails) {
            onHandleShowCardDetails(index);
          }
        }}
        style={divStyle}
      >
        <div className={`cred-card-template-inner ${cardData.status}`}>
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
          {cardData.status === CredentialMetadataRecordStatus.PENDING ? (
            <CardBodyPending />
          ) : null}
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
