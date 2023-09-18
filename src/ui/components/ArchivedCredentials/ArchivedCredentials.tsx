import { useState } from "react";
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonCol,
  IonFooter,
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonToolbar,
} from "@ionic/react";
import i18next from "i18next";
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
  const [activeList, setActiveList] = useState(false);
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([]);

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
            {activeList && (
              <IonCol className="credential-selector">
                <IonCheckbox
                  onIonChange={() => handleSelectCredentials(credential.id)}
                />
              </IonCol>
            )}
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

  const handleSelectCredentials = (id: string) => {
    let data = selectedCredentials;
    let match = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i] === id) {
        match = true;
      }
    }
    if (match) {
      data = data.filter((item) => item !== id);
    } else {
      data = [...selectedCredentials, id];
    }
    setSelectedCredentials(data);
  };

  const handleDeleteCredentials = () => {
    //
  };

  const handleRestoreCredentials = () => {
    //
  };

  return (
    <IonModal
      isOpen={archivedCredentialsIsOpen}
      className={""}
      data-testid="archived-credentials"
      onDidDismiss={() => setArchivedCredentialsIsOpen(false)}
    >
      <div
        className={`archived-credentials modal ${
          activeList ? "active-list" : ""
        }`}
      >
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonAction={() => setArchivedCredentialsIsOpen(false)}
          closeButtonLabel={`${i18n.t("creds.archived.done")}`}
          actionButton={true}
          actionButtonAction={() => setActiveList(!activeList)}
          actionButtonLabel={`${
            activeList
              ? i18n.t("creds.archived.cancel")
              : i18n.t("creds.archived.select")
          }`}
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
          <IonFooter
            collapse="fade"
            className="archived-credentials-footer ion-no-border"
          >
            <IonToolbar
              color="light"
              className="page-footer"
            >
              <IonButtons slot="start">
                <IonButton
                  className="delete-credentials-label"
                  onClick={() => handleDeleteCredentials()}
                  data-testid="delete-credentials"
                >
                  {i18n.t("creds.archived.delete")}
                </IonButton>
              </IonButtons>
              <div className="selected-amount-credentials-label">
                {i18next.t("creds.archived.selectedamount", {
                  amount: selectedCredentials.length,
                })}
              </div>
              <IonButtons slot="end">
                <IonButton
                  className="restore-credentials-label"
                  onClick={() => handleRestoreCredentials()}
                  data-testid="restore-credentials"
                >
                  {i18n.t("creds.archived.restore")}
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonFooter>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { ArchivedCredentials };
