import { useEffect, useState } from "react";
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
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { i18n } from "../../../i18n";
import { CredsOptionsProps } from "./CredsOptions.types";
import "./CredsOptions.scss";
import { VerifyPassword } from "../VerifyPassword";
import { Alert } from "../Alert";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getBackRoute } from "../../../routes/backRoute";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { getState } from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { credsMock } from "../../__mocks__/credsMock";
import { setCredsCache } from "../../../store/reducers/credsCache";

const CredsOptions = ({ isOpen, setIsOpen, id }: CredsOptionsProps) => {
  const storeState = useAppSelector(getState);
  const history = useHistory();
  const [viewIsOpen, setViewIsOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [keyboardIsOpen, setkeyboardIsOpen] = useState(false);
  const dispatch = useAppDispatch();

  const handleDismiss = () => {
    setViewIsOpen(false);
    setIsOpen(false);
  };

  const handleDelete = () => {
    handleDismiss();
    setAlertIsOpen(true);
  };

  const handleDone = () => {
    const { backPath, updateRedux } = getBackRoute(TabsRoutePath.DID_DETAILS, {
      store: storeState,
    });
    updateReduxState(
      backPath.pathname,
      { store: storeState },
      dispatch,
      updateRedux
    );
    history.push(TabsRoutePath.DIDS);
  };

  const verifyAction = () => {
    handleDismiss();
    // @TODO - sdisalvo: Update Database.
    // Remember to update CardDetails file too.
    const updatedCreds = credsMock.filter((item) => item.id !== id);
    dispatch(setCredsCache(updatedCreds));
    handleDone();
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Keyboard.addListener("keyboardWillShow", () => {
        setkeyboardIsOpen(true);
      });
      Keyboard.addListener("keyboardWillHide", () => {
        setkeyboardIsOpen(false);
      });
    }
  }, []);

  return (
    <>
      <IonModal
        isOpen={isOpen}
        initialBreakpoint={0.25}
        breakpoints={[0.25]}
        className={`page-layout ${keyboardIsOpen ? "extended-modal" : ""}`}
        data-testid="creds-options-modal"
        onDidDismiss={handleDismiss}
      >
        <div className="creds-options modal menu">
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              {viewIsOpen && (
                <IonButtons slot="start">
                  <IonButton
                    className="close-button-label"
                    onClick={() => {
                      setIsOpen(false);
                      setViewIsOpen(true);
                    }}
                    data-testid="close-button"
                  >
                    {i18n.t("creds.card.details.view.cancel")}
                  </IonButton>
                </IonButtons>
              )}
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
        className={`page-layout ${keyboardIsOpen ? "extended-modal" : ""}`}
        data-testid="creds-options-modal"
        onDidDismiss={handleDismiss}
      >
        <div className="creds-options modal viewer">
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              {viewIsOpen && (
                <IonButtons slot="start">
                  <IonButton
                    className="close-button-label"
                    onClick={() => {
                      setViewIsOpen(false);
                      setIsOpen(true);
                    }}
                    data-testid="close-button"
                  >
                    {i18n.t("creds.card.details.view.cancel")}
                  </IonButton>
                </IonButtons>
              )}
              <IonTitle data-testid="creds-options-title">
                <h2>{i18n.t("creds.card.details.view.title")}</h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent
            className="creds-options-body"
            color="light"
          >
            <IonGrid className="creds-options-inner">The grid</IonGrid>
          </IonContent>
        </div>
      </IonModal>
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        headerText={i18n.t("dids.card.details.delete.alert.title")}
        confirmButtonText={`${i18n.t(
          "dids.card.details.delete.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t("dids.card.details.delete.alert.cancel")}`}
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
