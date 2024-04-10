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
  archiveOutline,
  copyOutline,
  downloadOutline,
} from "ionicons/icons";
import { i18n } from "../../../i18n";
import { CredentialOptionsProps } from "./CredentialOptions.types";
import "./CredentialOptions.scss";
import { VerifyPassword } from "../VerifyPassword";
import { Alert } from "../Alert";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getBackRoute } from "../../../routes/backRoute";
import { TabsRoutePath } from "../../../routes/paths";
import {
  getStateCache,
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { VerifyPasscode } from "../VerifyPasscode";
import { OperationType, ToastMsgType } from "../../globals/types";
import { PageLayout } from "../layout/PageLayout";
import { writeToClipboard } from "../../utils/clipboard";

const CredentialOptions = ({
  cardData,
  optionsIsOpen,
  setOptionsIsOpen,
  credsOptionAction,
}: CredentialOptionsProps) => {
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
    const { backPath, updateRedux } = getBackRoute(
      TabsRoutePath.CREDENTIAL_DETAILS,
      {
        store: { stateCache },
      }
    );

    updateReduxState(
      backPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );
    history.push(TabsRoutePath.CREDENTIALS);
  };

  const verifyAction = () => {
    handleCloseView();
    handleCloseOptions();
    credsOptionAction();
    handleDone();
  };

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
                <h2>{i18n.t("credentials.details.options.title")}</h2>
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
                      {i18n.t("credentials.details.options.view")}
                    </span>
                  </span>
                  <span
                    className="creds-option"
                    data-testid="creds-options-archive-button"
                    onClick={() => {
                      handleDelete();
                      dispatch(
                        setCurrentOperation(OperationType.ARCHIVE_CREDENTIAL)
                      );
                    }}
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={archiveOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="creds-options-label">
                      {i18n.t("credentials.details.options.archive")}
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
          {cardData && (
            <PageLayout
              header={true}
              closeButton={true}
              closeButtonLabel={`${i18n.t("credentials.details.view.cancel")}`}
              closeButtonAction={handleCloseView}
              title={`${i18n.t("credentials.details.view.title")}`}
            >
              <IonGrid className="creds-options-inner">
                <pre>{JSON.stringify(cardData, null, 2)}</pre>
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
                        writeToClipboard(JSON.stringify(cardData, null, 2));
                        dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
                      }}
                    >
                      <IonIcon
                        slot="icon-only"
                        size="small"
                        icon={copyOutline}
                        color="primary"
                      />
                      {i18n.t("credentials.details.view.copy")}
                    </IonButton>
                    <IonButton
                      shape="round"
                      expand="block"
                      className="primary-button"
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
                      {i18n.t("credentials.details.view.save")}
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
        headerText={i18n.t("credentials.details.alert.archive.title")}
        confirmButtonText={`${i18n.t(
          "credentials.details.alert.archive.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "credentials.details.alert.archive.cancel"
        )}`}
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
        actionCancel={() => dispatch(setCurrentOperation(OperationType.IDLE))}
        actionDismiss={() => dispatch(setCurrentOperation(OperationType.IDLE))}
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

export { CredentialOptions };
