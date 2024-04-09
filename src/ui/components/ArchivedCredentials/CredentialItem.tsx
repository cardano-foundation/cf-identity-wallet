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
import Minicred from "../../assets/images/minicred.jpg";

const CredentialItem = ({
  credential,
  activeList,
  isSelected,
  onClick,
  onCheckboxChange,
  onDelete,
  onRestore,
}: CredentialItemProps) => {
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
            src={Minicred}
            alt="credential-miniature"
            className="credential-miniature"
          />
          <div className="credential-info">
            <div
              data-testid={`credential-name-${credential.id}`}
              className="credential-name"
            >
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
