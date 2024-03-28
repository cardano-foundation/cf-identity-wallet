import { useState } from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { hourglassOutline } from "ionicons/icons";
import { Alert } from "../Alert";
import { CredCardTemplateProps } from "./CredCardTemplate.types";
import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { i18n } from "../../../i18n";
import {
  ConnectionType,
  CredentialType,
} from "../../../core/agent/agent.types";
import CardBodyPending from "./CardBodyPending";
import CardBodyGeneric from "./CardBodyGeneric";
import CardBodyResidency from "./CardBodyResidence";
import CardBodySummit from "./CardBodySummit";
import W3CLogo from "../../../ui/assets/images/w3c-logo.svg";
import ACDCLogo from "../../../ui/assets/images/keri-acdc.svg";
import KeriBackground from "../../../ui/assets/images/keri-0.png";
import uscisLogo from "../../../ui/assets/images/uscis-logo.svg";
import summitLogo from "../../../ui/assets/images/summit-logo.svg";
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
  const isResidency =
    cardData?.credentialType === CredentialType.PERMANENT_RESIDENT_CARD;
  const isAccessPass =
    cardData?.credentialType === CredentialType.ACCESS_PASS_CREDENTIAL;
  const isCustomTemplate = isResidency || isAccessPass;
  const isW3CTemplate = cardData?.connectionType === ConnectionType.DIDCOMM;
  const isAcdcTemplate = cardData?.connectionType === ConnectionType.KERI;

  const credCardTemplateStyles = {
    zIndex: index,
    ...(isAcdcTemplate && {
      backgroundImage: `url(${KeriBackground})`,
      backgroundSize: "cover",
    }),
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
      className={`cred-card-template ${isActive ? "active" : ""} ${
        isCustomTemplate
          ? cardData.credentialType
            .replace(/([a-z0–9])([A-Z])/g, "$1-$2")
            .toLowerCase()
          : "card-body-w3c-generic"
      } ${pickedCard ? "picked-card" : "not-picked"}`}
      onClick={() => handleCardClick()}
      style={credCardTemplateStyles}
    >
      {isW3CTemplate && !isCustomTemplate && (
        <img
          src={W3CLogo}
          alt="w3c-card-background"
        />
      )}
      {isResidency && (
        <img
          src={uscisLogo}
          alt="us-immigration-background"
        />
      )}
      {isAccessPass && (
        <img
          src={summitLogo}
          alt="summit-background"
        />
      )}
      <div className={`cred-card-template-inner ${cardData.status}`}>
        <div className="card-header">
          <span className="card-logo">
            <img
              src={
                (isResidency && uscisLogo) ||
                (isAccessPass && summitLogo) ||
                (isW3CTemplate && W3CLogo) ||
                (isAcdcTemplate && ACDCLogo)
              }
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
            <span className="credential-type">
              {isAcdcTemplate
                ? cardData.credentialType
                : cardData.credentialType.replace(/([a-z])([A-Z])/g, "$1 $2")}
            </span>
          )}
        </div>
        {cardData.status === CredentialMetadataRecordStatus.PENDING && (
          <CardBodyPending />
        )}
        {cardData.status === CredentialMetadataRecordStatus.CONFIRMED &&
          (isCustomTemplate ? (
            <>
              {isResidency && <CardBodyResidency cardData={cardData} />}
              {isAccessPass && <CardBodySummit cardData={cardData} />}
            </>
          ) : (
            <CardBodyGeneric cardData={cardData} />
          ))}
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
