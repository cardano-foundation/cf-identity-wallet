import { useState } from "react";
import { useHistory } from "react-router-dom";
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
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCredsCache,
  setCredsCache,
} from "../../../store/reducers/credsCache";
import { CredProps } from "../CardsStack/CardsStack.types";
import { formatShortDate } from "../../../utils";
import { VerifyPassword } from "../VerifyPassword";
import { VerifyPasscode } from "../VerifyPasscode";
import {
  Alert as AlertDelete,
  Alert as AlertRestore,
} from "../../components/Alert";
import {
  getStateCache,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { AriesAgent } from "../../../core/agent/agent";
import { CredentialShortDetails } from "../../../core/agent/agent.types";

const ArchivedCredentials = ({
  archivedCredentialsIsOpen,
  setArchivedCredentialsIsOpen,
}: ArchivedCredentialsProps) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const [creds, setCreds] = useState(
    useAppSelector(getCredsCache).filter((item) => item.isArchived === true)
  );
  const [activeList, setActiveList] = useState(false);
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([]);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const [alertDeleteIsOpen, setAlertDeleteIsOpen] = useState(false);
  const [alertRestoreIsOpen, setAlertRestoreIsOpen] = useState(false);

  interface CredentialItemProps {
    key: number;
    index: number;
    credential: CredProps;
  }

  const selectAll = () => {
    const data = [];
    for (const i in creds) {
      data.push(creds[i].id);
    }
    return data;
  };

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
                  checked={selectedCredentials.includes(credential.id)}
                  onIonChange={() => {
                    handleSelectCredentials(credential.id);
                  }}
                />
              </IonCol>
            )}
            <IonCol
              className="credential-color"
              style={credentialColor}
            />
            <IonCol
              className="credential-info"
              onClick={() => handleShowCardDetails(credential.id)}
            >
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

  const handleShowCardDetails = (id: string) => {
    const pathname = `/tabs/creds/${id}`;
    history.push({ pathname: pathname });
    setArchivedCredentialsIsOpen(false);
  };

  const handleSelectCredentials = (id: string) => {
    let data = selectedCredentials;
    let match = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i] === id) {
        match = true;
        break;
      }
    }
    if (match) {
      data = data.filter((item) => item !== id);
    } else {
      data = [...selectedCredentials, id];
    }
    setSelectedCredentials(data);
  };

  const handleDeleteCredentials = async () => {
    // @TODO - sdisalvo: hook up function to delete credential
    // setVerifyPasswordIsOpen(false);
    // for (const i in selectedCredentials) {
    //   await AriesAgent.agent.credentials.deleteCredential(
    //     selectedCredentials[i]
    //   );
    // }
    // await AriesAgent.agent.credentials
    //   .getCredentials(true)
    //   .then((results) => {
    //     setCreds(results);
    //     dispatch(setCredsCache(results));
    //   })
    //   .catch((error) => {
    //     throw new Error(error);
    //   });
  };

  const handleRestoreCredentials = async () => {
    // @TODO - sdisalvo: hook up function to restore credential
    // for (const i in selectedCredentials) {
    //   await AriesAgent.agent.credentials.restoreCredential(
    //     selectedCredentials[i]
    //   );
    // }
    // await AriesAgent.agent.credentials
    //   .getCredentials(true)
    //   .then((results) => {
    //     setCreds(results);
    //     dispatch(setCredsCache(results));
    //   })
    //   .catch((error) => {
    //     throw new Error(error);
    //   });
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
          closeButtonAction={() =>
            activeList
              ? selectedCredentials.length > 0
                ? setSelectedCredentials([])
                : setSelectedCredentials(selectAll)
              : setArchivedCredentialsIsOpen(false)
          }
          closeButtonLabel={`${
            activeList
              ? selectedCredentials.length > 0
                ? i18n.t("creds.archived.deselectall")
                : i18n.t("creds.archived.selectall")
              : i18n.t("creds.archived.done")
          }`}
          actionButton={true}
          actionButtonAction={() => {
            setSelectedCredentials([]);
            setActiveList(!activeList);
          }}
          actionButtonLabel={`${
            activeList
              ? i18n.t("creds.archived.cancel")
              : i18n.t("creds.archived.edit")
          }`}
          title={`${i18n.t("creds.archived.title")}`}
        >
          <IonList
            lines="none"
            className="archived-credentials-list"
          >
            {creds.map((credential: CredProps, index: number) => {
              return (
                <CredentialItem
                  key={index}
                  index={index}
                  credential={credential as CredProps}
                />
              );
            })}
          </IonList>
          {activeList ? (
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
                    onClick={() => setAlertDeleteIsOpen(true)}
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
                    onClick={() => setAlertRestoreIsOpen(true)}
                    data-testid="restore-credentials"
                  >
                    {i18n.t("creds.archived.restore")}
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonFooter>
          ) : null}
        </PageLayout>
      </div>
      <AlertDelete
        isOpen={alertDeleteIsOpen}
        setIsOpen={setAlertDeleteIsOpen}
        dataTestId="alert-delete"
        headerText={i18n.t("creds.card.details.alert.delete.title")}
        confirmButtonText={`${i18n.t(
          "creds.card.details.alert.delete.confirm"
        )}`}
        cancelButtonText={`${i18n.t("creds.card.details.alert.delete.cancel")}`}
        actionConfirm={() => {
          if (
            !stateCache?.authentication.passwordIsSkipped &&
            stateCache?.authentication.passwordIsSet
          ) {
            setVerifyPasswordIsOpen(true);
          } else {
            setVerifyPasscodeIsOpen(true);
          }
        }}
        actionCancel={() => dispatch(setCurrentOperation(""))}
        actionDismiss={() => dispatch(setCurrentOperation(""))}
      />
      <AlertRestore
        isOpen={alertRestoreIsOpen}
        setIsOpen={setAlertRestoreIsOpen}
        dataTestId="alert-restore"
        headerText={i18n.t("creds.card.details.alert.restore.title")}
        confirmButtonText={`${i18n.t(
          "creds.card.details.alert.restore.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "creds.card.details.alert.restore.cancel"
        )}`}
        actionConfirm={() => handleRestoreCredentials()}
        actionCancel={() => dispatch(setCurrentOperation(""))}
        actionDismiss={() => dispatch(setCurrentOperation(""))}
      />
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        onVerify={handleDeleteCredentials}
      />
      <VerifyPasscode
        isOpen={verifyPasscodeIsOpen}
        setIsOpen={setVerifyPasscodeIsOpen}
        onVerify={handleDeleteCredentials}
      />
    </IonModal>
  );
};

export { ArchivedCredentials };
