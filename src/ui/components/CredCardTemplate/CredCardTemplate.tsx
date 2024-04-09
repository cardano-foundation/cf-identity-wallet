import { useState } from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { hourglassOutline } from "ionicons/icons";
import { Alert } from "../Alert";
import { CredCardTemplateProps } from "./CredCardTemplate.types";
import { CredentialMetadataRecordStatus } from "../../../core/agent/records/credentialMetadataRecord.types";
import { i18n } from "../../../i18n";
import CardBodyPending from "./CardBodyPending";
import CardBodyGeneric from "./CardBodyGeneric";
import ACDCLogo from "../../../ui/assets/images/keri-acdc.svg";
import KeriBackground from "../../../ui/assets/images/keri-0.png";
import "./CredCardTemplate.scss";

const CredCardTemplate = ({
  name = "default",
  cardData,
  isActive,
  index = 0,
  onHandleShowCardDetails,
  pickedCard,
}: CredCardTemplateProps) => {
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  const credCardTemplateStyles = {
    zIndex: index,
    backgroundImage: `url(${KeriBackground})`,
    backgroundSize: "cover",
  };

  const handleCardClick = () => {
    if (cardData.status === CredentialMetadataRecordStatus.PENDING) {
      setAlertIsOpen(true);
    } else if (onHandleShowCardDetails) {
      onHandleShowCardDetails(index);
    }
  };

  return (
    <div
      key={index}
      data-testid={`cred-card-template${
        index !== undefined ? `-${name}-index-${index}` : ""
      }`}
      className={`cred-card-template ${
        isActive ? "active" : ""
      } ${"card-body-generic"} ${pickedCard ? "picked-card" : "not-picked"}`}
      onClick={() => handleCardClick()}
      style={credCardTemplateStyles}
    >
      <div className={`cred-card-template-inner ${cardData.status}`}>
        <div className="card-header">
          <span className="card-logo">
            <img
              src={ACDCLogo}
              alt="card-logo"
            />
          </span>
          {cardData.status === CredentialMetadataRecordStatus.PENDING ? (
            <IonChip>
              <IonIcon
                icon={hourglassOutline}
                color="primary"
              />
              <span>{CredentialMetadataRecordStatus.PENDING}</span>
            </IonChip>
          ) : (
            <span className="credential-type">{cardData.credentialType}</span>
          )}
        </div>
        {cardData.status === CredentialMetadataRecordStatus.PENDING && (
          <CardBodyPending />
        )}
        {cardData.status === CredentialMetadataRecordStatus.CONFIRMED && (
          <CardBodyGeneric cardData={cardData} />
        )}
      </div>
      {cardData.status === CredentialMetadataRecordStatus.PENDING &&
        alertIsOpen && (
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          dataTestId="alert-confirm"
          headerText={i18n.t("creds.create.alert.title")}
          confirmButtonText={`${i18n.t("creds.create.alert.confirm")}`}
          actionConfirm={() => setAlertIsOpen(false)}
          backdropDismiss={false}
        />
      )}
    </div>
  );
};

export { CredCardTemplate };
