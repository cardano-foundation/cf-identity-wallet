import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonModal,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  codeSlashOutline,
  trashOutline,
  copyOutline,
  downloadOutline,
} from "ionicons/icons";
import { i18n } from "../../../i18n";
import { CredsOptionsProps } from "./CredsOptions.types";
import "./CredsOptions.scss";
import { VerifyPassword } from "../VerifyPassword";
import { Alert } from "../Alert";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getBackRoute } from "../../../routes/backRoute";
import { TabsRoutePath } from "../../../routes/paths";
import {
  getStateCache,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { credsFix } from "../../__fixtures__/credsFix";
import { setCredsCache } from "../../../store/reducers/credsCache";
import { VerifyPasscode } from "../VerifyPasscode";
import { operationState, toastState } from "../../constants/dictionary";
import { PageLayout } from "../layout/PageLayout";
import { writeToClipboard } from "../../../utils/clipboard";

const CredsOptions = ({
  optionsIsOpen,
  setOptionsIsOpen,
  id,
}: CredsOptionsProps) => {
  const stateCache = useAppSelector(getStateCache);
  const history = useHistory();
  const [viewIsOpen, setViewIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleCloseOptions = () => setOptionsIsOpen(false);
  const handleCloseView = () => setViewIsOpen(false);
  const handleOpenAlert = () => setAlertIsOpen(true);
  const handleDelete = () => {
    handleCloseView();
    handleCloseOptions();
    handleOpenAlert();
  };

  const handleDone = () => {
    const { backPath, updateRedux } = getBackRoute(TabsRoutePath.CRED_DETAILS, {
      store: { stateCache },
    });

    updateReduxState(
      backPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );
    history.push(TabsRoutePath.CREDS);
  };

  const verifyAction = () => {
    handleCloseView();
    handleCloseOptions();
    // @TODO - sdisalvo: Update Database.
    // Remember to update CredCardDetails file too.
    // const updatedCreds = credsFix.filter((item) => item.id !== id);
    // dispatch(setCredsCache(updatedCreds));
    handleDone();
  };

  const cred = credsFix.find((item) => item.id === id);

  return (
    <>
      <IonModal
        isOpen={optionsIsOpen}
        initialBreakpoint={0.25}
        breakpoints={[0, 0.25]}
        className="page-layout"
        data-testid="creds-options-modal"
        onDidDismiss={handleCloseOptions}
      >
        <div className="creds-options modal menu">
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              <IonTitle data-testid="creds-options-title">
                <h2>{i18n.t("creds.card.details.options.title")}</h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent
            className="creds-options-body"
            color="light"
          >
            <IonGrid className="creds-options-main">
              <IonRow>
                <IonCol size="12">
                  <span
                    className="creds-option"
                    data-testid="creds-options-view-button"
                    onClick={() => {
                      handleCloseOptions();
                      setViewIsOpen(true);
                    }}
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={codeSlashOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="creds-options-label">
                      {i18n.t("creds.card.details.options.view")}
                    </span>
                  </span>
                  <span
                    className="creds-option"
                    data-testid="creds-options-delete-button"
                    onClick={() => {
                      handleDelete();
                      dispatch(
                        setCurrentOperation(operationState.deleteCredential)
                      );
                    }}
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={trashOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="creds-options-label">
                      {i18n.t("creds.card.details.options.delete")}
                    </span>
                  </span>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </div>
      </IonModal>
      <IonModal
        isOpen={viewIsOpen}
        initialBreakpoint={1}
        breakpoints={[1]}
        className="page-layout"
        data-testid="view-creds-modal"
        onDidDismiss={handleCloseView}
      >
        <div className="creds-options modal viewer">
          {!cred ? null : (
            <PageLayout
              header={true}
              closeButton={true}
              closeButtonLabel={`${i18n.t("creds.card.details.view.cancel")}`}
              closeButtonAction={handleCloseView}
              title={`${i18n.t("creds.card.details.view.title")}`}
            >
              <IonGrid className="creds-options-inner">
                <pre>{JSON.stringify(cred, null, 2)}</pre>
              </IonGrid>
              <IonGrid>
                <IonRow>
                  <IonCol className="footer-col">
                    <IonButton
                      shape="round"
                      expand="block"
                      fill="outline"
                      className="secondary-button"
                      onClick={() => {
                        writeToClipboard(JSON.stringify(cred, null, 2));
                        dispatch(
                          setCurrentOperation(toastState.copiedToClipboard)
                        );
                      }}
                    >
                      <IonIcon
                        slot="icon-only"
                        size="small"
                        icon={copyOutline}
                        color="primary"
                      />
                      {i18n.t("creds.card.details.view.copy")}
                    </IonButton>
                    <IonButton
                      shape="round"
                      expand="block"
                      className="ion-primary-button"
                      onClick={() => {
                        // @TODO - sdisalvo: Save to device
                        return;
                      }}
                    >
                      <IonIcon
                        slot="icon-only"
                        size="small"
                        icon={downloadOutline}
                        color="primary"
                      />
                      {i18n.t("creds.card.details.view.save")}
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </PageLayout>
          )}
        </div>
      </IonModal>
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-confirm"
        headerText={i18n.t("creds.card.details.delete.alert.title")}
        confirmButtonText={`${i18n.t(
          "creds.card.details.delete.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t("creds.card.details.delete.alert.cancel")}`}
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
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        onVerify={verifyAction}
      />
      <VerifyPasscode
        isOpen={verifyPasscodeIsOpen}
        setIsOpen={setVerifyPasscodeIsOpen}
        onVerify={verifyAction}
      />
    </>
  );
};

export { CredsOptions };
