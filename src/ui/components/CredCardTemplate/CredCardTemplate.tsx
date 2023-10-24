import { useEffect, useState } from "react";
import { IonChip, IonIcon } from "@ionic/react";
import { hourglassOutline } from "ionicons/icons";
import { Alert } from "../Alert";
import { CredCardTemplateProps } from "./CredCardTemplate.types";
import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { i18n } from "../../../i18n";
import W3CLogo from "../../../ui/assets/images/w3c-logo.svg";
import "./CredCardTemplate.scss";
import CardBodyPending from "./CardBodyPending";
import CardBodyUniversity from "./CardBodyUniversity";
import { CredentialDetails } from "../../../core/agent/agent.types";
import { AriesAgent } from "../../../core/agent/agent";

const CredCardTemplate = ({
  name,
  shortData,
  isActive,
  index,
  onHandleShowCardDetails,
}: CredCardTemplateProps) => {
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [cardData, setCardData] = useState<CredentialDetails>();
  const isCardTemplate =
    shortData.credentialType ===
    ("UniversityDegreeCredential" ||
      "AccessPassCredential" ||
      "PermanentResidentCard");
  const colorBasedBackground = {
    background: `linear-gradient(91.86deg, ${shortData.colors[0]} 28.76%, ${shortData.colors[1]} 119.14%)`,
    zIndex: index,
  };

  const getCredDetails = async () => {
    const cardDetails =
      await AriesAgent.agent.credentials.getCredentialDetailsById(shortData.id);
    setCardData(cardDetails);
  };

  useEffect(() => {
    getCredDetails();
  }, [shortData.id]);

  return (
    <>
      <div
        key={index}
        data-testid={`cred-card-template-${
          index !== undefined ? `${name}-index-${index}` : ""
        }`}
        className={`cred-card-template ${isActive ? "active" : ""} ${
          isCardTemplate
            ? shortData.credentialType
              .replace(/([a-z0–9])([A-Z])/g, "$1-$2")
              .toLowerCase()
            : "color-based-background"
        }`}
        onClick={() => {
          if (shortData.status === CredentialMetadataRecordStatus.PENDING) {
            setAlertIsOpen(true);
          } else if (onHandleShowCardDetails) {
            onHandleShowCardDetails(index);
          }
        }}
        style={isCardTemplate ? { zIndex: index } : colorBasedBackground}
      >
        {shortData.credentialType === "UniversityDegreeCredential" && (
          <img
            src={W3CLogo}
            alt="w3c-card-background"
          />
        )}
        <div className={`cred-card-template-inner ${shortData.status}`}>
          <div className="card-header">
            <span className="card-logo">
              <img
                src={shortData.issuerLogo ?? W3CLogo}
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
          {shortData.credentialType === "UniversityDegreeCredential" &&
            cardData !== undefined && (
            <CardBodyUniversity cardData={cardData} />
          )}
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
