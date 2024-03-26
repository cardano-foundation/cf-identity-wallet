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
  name,
  shortData,
  isActive,
  index,
  onHandleShowCardDetails,
  styles,
}: CredCardTemplateProps) => {
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  const credCardTemplateStyles = {
    zIndex: index,
    backgroundImage: `url(${KeriBackground})`,
    backgroundSize: "cover",
    ...styles,
  };

  return (
    <>
      <div
        key={index}
        data-testid={`cred-card-template${
          index !== undefined ? `-${name}-index-${index}` : ""
        }`}
        className={`cred-card-template ${
          isActive ? "active" : ""
        } ${"card-body-w3c-generic"}`}
        onClick={() => {
          if (shortData.status === CredentialMetadataRecordStatus.PENDING) {
            setAlertIsOpen(true);
          } else if (onHandleShowCardDetails) {
            onHandleShowCardDetails(index);
          }
        }}
        style={credCardTemplateStyles}
      >
        <div className={`cred-card-template-inner ${shortData.status}`}>
          <div className="card-header">
            <span className="card-logo">
              <img
                src={ACDCLogo}
                alt="card-logo"
              />
            </span>
            {shortData.status === CredentialMetadataRecordStatus.PENDING ? (
              <IonChip>
                <IonIcon
                  icon={hourglassOutline}
                  color="primary"
                />
                <span>{CredentialMetadataRecordStatus.PENDING}</span>
              </IonChip>
            ) : (
              <span className="credential-type">
                ? shortData.credentialType
              </span>
            )}
          </div>
          {shortData.status === CredentialMetadataRecordStatus.PENDING && (
            <CardBodyPending />
          )}
          {shortData.status === CredentialMetadataRecordStatus.CONFIRMED && (
            <CardBodyGeneric cardData={shortData} />
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
