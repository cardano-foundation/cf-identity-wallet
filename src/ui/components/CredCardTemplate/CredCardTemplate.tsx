import { useEffect, useState } from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { hourglassOutline } from "ionicons/icons";
import { Alert } from "../Alert";
import { CredCardTemplateProps } from "./CredCardTemplate.types";
import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { i18n } from "../../../i18n";
import W3CLogo from "../../../ui/assets/images/w3c-logo.svg";
import uscisLogo from "../../../ui/assets/images/uscis-logo.svg";
import "./CredCardTemplate.scss";
import CardBodyPending from "./CardBodyPending";
import CardBodyUniversity from "./CardBodyUniversity";
import { CredentialDetails } from "../../../core/agent/agent.types";
import { AriesAgent } from "../../../core/agent/agent";
import { CredentialType } from "../../constants/dictionary";
import CardBodyResidency from "./CardBodyResidence";

const CredCardTemplate = ({
  name,
  shortData,
  isActive,
  index,
  onHandleShowCardDetails,
}: CredCardTemplateProps) => {
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [cardData, setCardData] = useState<CredentialDetails>();
  const isUniversity =
    shortData.credentialType === CredentialType.UNIVERSITY_DEGREE_CREDENTIAL;
  const isResidency =
    shortData.credentialType === CredentialType.PERMANENT_RESIDENT_CARD;
  const isAccessPass =
    shortData.credentialType === CredentialType.PERMANENT_RESIDENT_CARD;
  const isW3CTemplate = isUniversity || !isResidency || !isAccessPass;
  const isKnownTemplate = isUniversity || isResidency || isAccessPass;

  const getCredDetails = async () => {
    const cardDetails =
      await AriesAgent.agent.credentials.getCredentialDetailsById(shortData.id);
    setCardData(cardDetails);
    console.log(cardDetails);
  };

  useEffect(() => {
    getCredDetails();
  }, [shortData]);

  return (
    <>
      <div
        key={index}
        data-testid={`cred-card-template-${
          index !== undefined ? `${name}-index-${index}` : ""
        }`}
        className={`cred-card-template ${isActive ? "active" : ""} ${
          isKnownTemplate
            ? shortData.credentialType
                .replace(/([a-z0–9])([A-Z])/g, "$1-$2")
                .toLowerCase()
            : "generic-w3c-template"
        }`}
        onClick={() => {
          if (shortData.status === CredentialMetadataRecordStatus.PENDING) {
            setAlertIsOpen(true);
          } else if (onHandleShowCardDetails) {
            onHandleShowCardDetails(index);
          }
        }}
        style={{ zIndex: index }}
      >
        {isW3CTemplate && (
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
        <div className={`cred-card-template-inner ${shortData.status}`}>
          <div className="card-header">
            <span className="card-logo">
              <img
                src={(isW3CTemplate && W3CLogo) || (isResidency && uscisLogo)}
                alt="card-logo"
              />
            </span>
            {shortData.status === CredentialMetadataRecordStatus.PENDING ? (
              <IonChip>
                <IonIcon
                  icon={hourglassOutline}
                  color="primary"
                ></IonIcon>
                <span>{CredentialMetadataRecordStatus.PENDING}</span>
              </IonChip>
            ) : (
              <span className="credential-type">
                {shortData.credentialType.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </span>
            )}
          </div>
          {shortData.status === CredentialMetadataRecordStatus.PENDING && (
            <CardBodyPending />
          )}
          {isW3CTemplate && cardData !== undefined && (
            <CardBodyUniversity cardData={cardData} />
          )}
          {shortData.credentialType ===
            CredentialType.PERMANENT_RESIDENT_CARD &&
            cardData !== undefined && <CardBodyResidency cardData={cardData} />}
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
