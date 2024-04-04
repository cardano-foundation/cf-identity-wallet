import {
  IonCheckbox,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
} from "@ionic/react";
import { i18n } from "../../../i18n";
import "./ArchivedCredentials.scss";
import { formatShortDate } from "../../utils/formatters";
import { CredentialItemProps } from "./ArchivedCredentials.types";
import {
  ConnectionType,
  CredentialType,
} from "../../../core/agent/agent.types";
import Minicred1 from "../../assets/images/minicred1.jpg";
import Minicred2 from "../../assets/images/minicred2.jpg";
import Minicred3 from "../../assets/images/minicred3.jpg";
import Minicred4 from "../../assets/images/minicred4.jpg";

const CredentialItem = ({
  credential,
  activeList,
  isSelected,
  onClick,
  onCheckboxChange,
  onDelete,
  onRestore,
}: CredentialItemProps) => {
  const credentialBackground = () => {
    if (credential.connectionType === ConnectionType.KERI) {
      return Minicred4;
    } else if (credential.connectionType === ConnectionType.DIDCOMM) {
      switch (credential.credentialType) {
      case CredentialType.PERMANENT_RESIDENT_CARD:
        return Minicred3;
      case CredentialType.ACCESS_PASS_CREDENTIAL:
        return Minicred2;
      default:
        return Minicred1;
      }
    }
  };

  return (
    <IonItemSliding>
      <IonItem
        onClick={() => onClick(credential.id)}
        className={isSelected ? "selected-credential" : undefined}
        data-testid={`crendential-card-item-${credential.id}`}
      >
        <IonLabel>
          {activeList && (
            <IonCheckbox
              checked={isSelected}
              onIonChange={() => {
                onCheckboxChange(credential.id);
              }}
              aria-label=""
            />
          )}
          <img
            src={credentialBackground()}
            alt="credential-miniature"
            className="credential-miniature"
          />
          <div className="credential-info">
            <div className="credential-name">
              {credential.credentialType
                .replace(/([A-Z][a-z])/g, " $1")
                .replace(/(\d)/g, " $1")}
            </div>
            <div className="credential-expiration">
              {formatShortDate(credential.issuanceDate)}
            </div>
          </div>
        </IonLabel>
      </IonItem>

      <IonItemOptions>
        <IonItemOption
          color="dark-grey"
          onClick={() => {
            onRestore(credential.id);
          }}
        >
          {i18n.t("creds.archived.restore")}
        </IonItemOption>
        <IonItemOption
          color="danger"
          onClick={() => {
            onDelete(credential.id);
          }}
        >
          {i18n.t("creds.archived.delete")}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export { CredentialItem };
