import {
  IonCheckbox,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
} from "@ionic/react";
import { CredentialStatus } from "../../../core/agent/services/credentialService.types";
import { i18n } from "../../../i18n";
import { formatShortDate } from "../../utils/formatters";
import { CardTheme } from "../CardTheme";
import "./ArchivedCredentials.scss";
import { CredentialItemProps } from "./ArchivedCredentials.types";
import { IpexCommunicationService } from "../../../core/agent/services/ipexCommunicationService";
import BackgroundROME from "../../assets/images/rome-bg.png";

const CredentialItem = ({
  credential,
  activeList,
  isSelected,
  onClick,
  onCheckboxChange,
  onDelete,
  onRestore,
}: CredentialItemProps) => {
  const isRevoked = credential.status === CredentialStatus.REVOKED;
  const isRome =
    credential.schema === IpexCommunicationService.SCHEMA_SAID_ROME_DEMO;

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
          {isRome ? (
            <img
              src={BackgroundROME}
              alt="credential-miniature"
              className="credential-miniature"
            />
          ) : (
            <div className="credential-miniature">
              <CardTheme />
            </div>
          )}
          <div className="credential-info">
            <div
              data-testid={`credential-name-${credential.id}`}
              className="credential-name"
            >
              {credential.credentialType}
            </div>
            <div className="credential-expiration">
              {!isRevoked ? (
                formatShortDate(credential.issuanceDate)
              ) : (
                <span className="revoked-label">{credential.status}</span>
              )}
            </div>
          </div>
        </IonLabel>
      </IonItem>

      <IonItemOptions>
        {onRestore && (
          <IonItemOption
            color="dark-grey"
            onClick={() => {
              onRestore(credential.id);
            }}
          >
            {i18n.t("tabs.credentials.archived.restore")}
          </IonItemOption>
        )}
        <IonItemOption
          color="danger"
          onClick={() => {
            onDelete(credential.id);
          }}
        >
          {i18n.t("tabs.credentials.archived.delete")}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export { CredentialItem };
