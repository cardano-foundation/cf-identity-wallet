import {
  IonCol,
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
} from "@ionic/react";
import { PageLayout } from "../layout/PageLayout";
import { ArchivedCredentialsProps } from "./ArchivedCredentials.types";
import { i18n } from "../../../i18n";
import "./ArchivedCredentials.scss";
import { useAppSelector } from "../../../store/hooks";
import { getCredsCache } from "../../../store/reducers/credsCache";
import { CredProps } from "../CardsStack/CardsStack.types";
import { formatShortDate } from "../../../utils";

const ArchivedCredentials = ({
  archivedCredentialsIsOpen,
  setArchivedCredentialsIsOpen,
}: ArchivedCredentialsProps) => {
  const archivedCredentials = useAppSelector(getCredsCache).filter(
    (item) => item.isArchived === true
  );

  interface CredentialItemProps {
    key: number;
    index: number;
    credential: CredProps;
  }

  const CredentialItem = ({ credential, index }: CredentialItemProps) => {
    const credentialColor = {
      background: `linear-gradient(91.86deg, ${credential.colors[0]} 28.76%, ${credential.colors[1]} 119.14%)`,
      zIndex: index,
    };
    return (
      <IonItem>
        <IonGrid>
          <IonRow>
            <IonCol
              className="credential-color"
              style={credentialColor}
            />
            <IonCol className="credential-info">
              <IonLabel className="credential-name">
                {credential.credentialType}
              </IonLabel>
              <IonLabel className="credential-expiration">
                {formatShortDate(credential.issuanceDate)}
              </IonLabel>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>
    );
  };

  return (
    <IonModal
      isOpen={archivedCredentialsIsOpen}
      className={""}
      data-testid="archived-credentials"
      onDidDismiss={() => setArchivedCredentialsIsOpen(false)}
    >
      <div className="archived-credentials modal">
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonAction={() => setArchivedCredentialsIsOpen(false)}
          closeButtonLabel={`${i18n.t("creds.archived.done")}`}
          actionButton={true}
          actionButtonAction={() => setArchivedCredentialsIsOpen(false)}
          actionButtonLabel={`${i18n.t("creds.archived.select")}`}
          title={`${i18n.t("creds.archived.title")}`}
        >
          <IonList
            lines="none"
            className="archived-credentials-list"
          >
            {archivedCredentials.map((credential: CredProps, index: number) => {
              return (
                <CredentialItem
                  key={index}
                  index={index}
                  credential={credential as CredProps}
                />
              );
            })}
          </IonList>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { ArchivedCredentials };
