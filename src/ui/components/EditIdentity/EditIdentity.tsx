import { useEffect, useState } from "react";
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
import { Share } from "@capacitor/share";
import { pencilOutline, shareOutline, trashOutline } from "ionicons/icons";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { i18n } from "../../../i18n";
import { EditIdentityProps } from "./EditIdentity.types";
import "./EditIdentity.scss";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import { VerifyPassword } from "../../components/VerifyPassword";
import { Alert } from "../Alert";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setDidsCache } from "../../../store/reducers/didsCache";
import { didsMock } from "../../__mocks__/didsMock";
import { getBackRoute } from "../../../routes/backRoute";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { getState } from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { CardsStackProps } from "../CardsStack/CardsStack.types";

const EditIdentity = ({ isOpen, setIsOpen, id, name }: EditIdentityProps) => {
  const storeState = useAppSelector(getState);
  const history = useHistory();
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(name);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [keyboardIsOpen, setkeyboardIsOpen] = useState(false);
  const DISPLAY_NAME_LENGTH = 32;
  const verifyDisplayName =
    newDisplayName.length > 0 &&
    newDisplayName.length <= DISPLAY_NAME_LENGTH &&
    newDisplayName !== name;
  const dispatch = useAppDispatch();

  useEffect(() => {
    setNewDisplayName(name);
  }, [name]);

  const handleDismiss = () => {
    setEditIsOpen(false);
    setIsOpen(false);
  };

  const handleDelete = () => {
    setActionType("delete");
    setIsOpen(false);
    setAlertIsOpen(true);
  };

  const handleSubmit = () => {
    setActionType("edit");
    setEditIsOpen(false);
    setIsOpen(false);
    setVerifyPasswordIsOpen(true);
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
    if (actionType === "edit") {
      // @TODO - sdisalvo: Update Database.
      // Remember to update CardDetails file too.
      //
      const updatedDids: CardsStackProps[] = [];
      didsMock.forEach((element) => {
        const obj = { ...element };
        if (element.id === id) {
          obj.name = newDisplayName;
        }
        updatedDids.push(obj);
      });
      dispatch(setDidsCache(updatedDids));
      handleDone();
    } else if (actionType === "delete") {
      // @TODO - sdisalvo: Update Database.
      // Remember to update CardDetails file too.
      //
      const updatedDids = didsMock.filter((item) => item.id !== id);
      dispatch(setDidsCache(updatedDids));
      handleDone();
    }
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
        initialBreakpoint={0.35}
        breakpoints={[0.35]}
        className={`page-layout ${keyboardIsOpen ? "extended-modal" : ""}`}
        data-testid="edit-identity"
        onDidDismiss={handleDismiss}
      >
        <div
          className={`edit-identity modal ${editIsOpen ? "editor" : "menu"}`}
        >
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              <IonTitle data-testid="edit-identity-title">
                <h2>{i18n.t("editidentity.title")}</h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent
            className="edit-identity-body"
            color="light"
          >
            {editIsOpen ? (
              <IonGrid className="edit-identity-inner">
                <IonRow>
                  <IonCol size="12">
                    <CustomInput
                      dataTestId="edit-display-name"
                      title={`${i18n.t("editidentity.inner.label")}`}
                      hiddenInput={false}
                      autofocus={true}
                      onChangeInput={setNewDisplayName}
                      value={newDisplayName}
                    />
                  </IonCol>
                </IonRow>
                {newDisplayName.length > DISPLAY_NAME_LENGTH ? (
                  <ErrorMessage
                    message={i18n.t("editidentity.inner.error")}
                    timeout={false}
                  />
                ) : (
                  <div className="error-placeholder" />
                )}
                <IonButton
                  shape="round"
                  expand="block"
                  className="ion-primary-button"
                  data-testid="continue-button"
                  onClick={handleSubmit}
                  disabled={!verifyDisplayName}
                >
                  {i18n.t("editidentity.inner.confirm")}
                </IonButton>
              </IonGrid>
            ) : (
              <IonGrid className="edit-identity-main">
                <IonRow>
                  <IonCol size="12">
                    <span
                      className="edit-identity-option"
                      data-testid="edit-identity-edit-button"
                      onClick={() => {
                        setNewDisplayName(name);
                        setEditIsOpen(true);
                      }}
                    >
                      <span>
                        <IonButton shape="round">
                          <IonIcon
                            slot="icon-only"
                            icon={pencilOutline}
                          />
                        </IonButton>
                      </span>
                      <span className="edit-identity-label">
                        {i18n.t("editidentity.title")}
                      </span>
                    </span>
                    <span
                      className="edit-identity-option"
                      data-testid="edit-identity-share-button"
                      onClick={async () => {
                        await Share.share({
                          text: name + " " + id,
                        });
                      }}
                    >
                      <span>
                        <IonButton shape="round">
                          <IonIcon
                            slot="icon-only"
                            icon={shareOutline}
                          />
                        </IonButton>
                      </span>
                      <span className="edit-identity-info-block-data">
                        {i18n.t("editidentity.share")}
                      </span>
                    </span>
                    <span
                      className="edit-identity-option"
                      data-testid="edit-identity-delete-button"
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
                      <span className="edit-identity-label">
                        {i18n.t("editidentity.delete")}
                      </span>
                    </span>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}
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
        action={verifyAction}
      />
    </>
  );
};

export { EditIdentity };
