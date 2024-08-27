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
import RareEvoBackground from "../../assets/images/rare-evo-bg.jpg";
import { CredentialStatus } from "../../../core/agent/services/credentialService.types";
import { IpexCommunicationService } from "../../../core/agent/services/ipexCommunicationService";

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
  const isRareEvo =
    credential.schema === IpexCommunicationService.SCHEMA_SAID_RARE_EVO_DEMO;

  const image = isRareEvo ? RareEvoBackground : Minicred;

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
            src={image}
            alt="credential-miniature"
            className="credential-miniature"
          />
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
            {i18n.t("credentials.archived.restore")}
          </IonItemOption>
        )}
        <IonItemOption
          color="danger"
          onClick={() => {
            onDelete(credential.id);
          }}
        >
          {i18n.t("credentials.archived.delete")}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export { CredentialItem };
