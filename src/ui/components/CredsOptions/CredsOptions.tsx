import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonButton,
  IonButtons,
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
import { codeSlashOutline, trashOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { CredsOptionsProps } from "./CredsOptions.types";
import "./CredsOptions.scss";
import { VerifyPassword } from "../VerifyPassword";
import { Alert } from "../Alert";
import { useAppDispatch } from "../../../store/hooks";
import { getBackRoute } from "../../../routes/backRoute";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { updateReduxState } from "../../../store/utils";
import { credsMock } from "../../__mocks__/credsMock";
import { setCredsCache } from "../../../store/reducers/credsCache";

const CredsOptions = ({
  optionsIsOpen,
  setOptionsIsOpen,
  id,
}: CredsOptionsProps) => {
  const history = useHistory();
  const [viewIsOpen, setViewIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
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
    const { backPath, updateRedux } = getBackRoute(TabsRoutePath.CRED_DETAILS);
    updateReduxState(backPath.pathname, {}, dispatch, updateRedux);
    history.push(TabsRoutePath.CREDS);
  };

  const verifyAction = () => {
    handleCloseView();
    handleCloseOptions();
    // @TODO - sdisalvo: Update Database.
    // Remember to update CredCardDetails file too.
    const updatedCreds = credsMock.filter((item) => item.id !== id);
    dispatch(setCredsCache(updatedCreds));
    handleDone();
  };

  const cred = credsMock.find((item) => item.id === id);

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
                    onClick={() => setViewIsOpen(true)}
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
                    onClick={handleDelete}
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
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              <IonButtons slot="start">
                <IonButton
                  className="close-button-label"
                  onClick={handleCloseView}
                  data-testid="close-button"
                >
                  {i18n.t("creds.card.details.view.cancel")}
                </IonButton>
              </IonButtons>
              <IonTitle data-testid="creds-options-title">
                <h2>{i18n.t("creds.card.details.view.title")}</h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent
            className="creds-options-body"
            color="light"
          >
            <IonGrid className="creds-options-inner">
              <pre>{JSON.stringify(cred, null, 2)}</pre>
            </IonGrid>
          </IonContent>
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
        actionConfirm={() => setVerifyPasswordIsOpen(true)}
      />
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        onVerify={verifyAction}
      />
    </>
  );
};

export { CredsOptions };
