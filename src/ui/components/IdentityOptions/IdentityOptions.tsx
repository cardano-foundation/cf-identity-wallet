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
import { Share } from "@capacitor/share";
import {
  codeSlashOutline,
  pencilOutline,
  shareOutline,
  trashOutline,
  copyOutline,
  downloadOutline,
} from "ionicons/icons";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { i18n } from "../../../i18n";
import { IdentityOptionsProps } from "./IdentityOptions.types";
import "./IdentityOptions.scss";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import { VerifyPassword } from "../VerifyPassword";
import { Alert } from "../Alert";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getIdentitiesCache,
  setIdentitiesCache,
} from "../../../store/reducers/identitiesCache";
import { getBackRoute } from "../../../routes/backRoute";
import { TabsRoutePath } from "../../../routes/paths";
import {
  getStateCache,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { DISPLAY_NAME_LENGTH } from "../../../constants/appConstants";
import { VerifyPasscode } from "../VerifyPasscode";
import { operationState, toastState } from "../../constants/dictionary";
import { PageLayout } from "../layout/PageLayout";
import { writeToClipboard } from "../../../utils/clipboard";

const IdentityOptions = ({
  isOpen,
  setIsOpen,
  cardData,
  setCardData,
}: IdentityOptionsProps) => {
  const dispatch = useAppDispatch();
  const identitiesData = useAppSelector(getIdentitiesCache);
  const stateCache = useAppSelector(getStateCache);
  const history = useHistory();
  const [editorOptionsIsOpen, setEditorIsOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(cardData.displayName);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [viewIsOpen, setViewIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [keyboardIsOpen, setkeyboardIsOpen] = useState(false);
  const verifyDisplayName =
    newDisplayName.length > 0 &&
    newDisplayName.length <= DISPLAY_NAME_LENGTH &&
    newDisplayName !== cardData.displayName;

  useEffect(() => {
    setNewDisplayName(cardData.displayName);
  }, [cardData.displayName]);

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

  const handleDismiss = () => {
    setEditorIsOpen(false);
    setIsOpen(false);
  };

  const handleClose = () => {
    setEditorIsOpen(false);
    setIsOpen(true);
  };

  const handleDelete = () => {
    setActionType("delete");
    setIsOpen(false);
    setAlertIsOpen(true);
  };

  const handleSubmit = () => {
    setActionType("edit");
    setEditorIsOpen(false);
    setIsOpen(false);
    const updatedIdentities = [...identitiesData];
    const index = updatedIdentities.findIndex(
      (identity) => identity.id === cardData.id
    );
    updatedIdentities[index] = {
      ...updatedIdentities[index],
      displayName: newDisplayName,
    };
    setCardData({ ...cardData, displayName: newDisplayName });
    dispatch(setIdentitiesCache(updatedIdentities));
    handleDone();
  };

  const verifyAction = () => {
    handleDismiss();
    const updatedIdentities = identitiesData.filter(
      (item) => item.id !== cardData.id
    );
    dispatch(setIdentitiesCache(updatedIdentities));
    handleDone();
  };

  const handleDone = () => {
    const { backPath, updateRedux } = getBackRoute(TabsRoutePath.DID_DETAILS, {
      store: { stateCache },
    });

    updateReduxState(
      backPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );
    if (actionType === "delete") {
      history.push(TabsRoutePath.DIDS);
    }
  };

  return (
    <>
      <IonModal
        isOpen={isOpen}
        initialBreakpoint={0.35}
        breakpoints={[0, 0.35]}
        className={`page-layout ${keyboardIsOpen ? "extended-modal" : ""}`}
        data-testid="identity-options-modal"
        onDidDismiss={handleDismiss}
      >
        <div
          className={`identity-options modal ${
            editorOptionsIsOpen ? "editor" : "menu"
          }`}
        >
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              {editorOptionsIsOpen && (
                <IonButtons slot="start">
                  <IonButton
                    className="close-button-label"
                    onClick={() => {
                      handleClose();
                      dispatch(setCurrentOperation(""));
                    }}
                    data-testid="close-button"
                  >
                    {i18n.t("identity.card.details.options.cancel")}
                  </IonButton>
                </IonButtons>
              )}
              <IonTitle data-testid="identity-options-title">
                <h2>
                  {i18n.t(
                    editorOptionsIsOpen
                      ? "identity.card.details.options.edit"
                      : "identity.card.details.options.title"
                  )}
                </h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent
            className="identity-options-body"
            color="light"
          >
            {editorOptionsIsOpen ? (
              <IonGrid className="identity-options-inner">
                <IonRow>
                  <IonCol size="12">
                    <CustomInput
                      dataTestId="edit-display-name"
                      title={`${i18n.t(
                        "identity.card.details.options.inner.label"
                      )}`}
                      hiddenInput={false}
                      autofocus={true}
                      onChangeInput={setNewDisplayName}
                      value={newDisplayName}
                    />
                  </IonCol>
                </IonRow>
                {newDisplayName.length > DISPLAY_NAME_LENGTH ? (
                  <ErrorMessage
                    message={`${i18n.t(
                      "identity.card.details.options.inner.error"
                    )}`}
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
                  {i18n.t("identity.card.details.options.inner.confirm")}
                </IonButton>
              </IonGrid>
            ) : (
              <IonGrid className="identity-options-main">
                <IonRow>
                  <IonCol size="12">
                    <span
                      className="identity-options-option"
                      data-testid="identity-options-view-button"
                      onClick={() => {
                        setIsOpen(false);
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
                      <span className="identity-options-label">
                        {i18n.t("identity.card.details.options.view")}
                      </span>
                    </span>
                    <span
                      className="identity-options-option"
                      data-testid="identity-options-identity-options-button"
                      onClick={() => {
                        dispatch(
                          setCurrentOperation(operationState.renameIdentity)
                        );
                        setNewDisplayName(cardData.displayName);
                        setEditorIsOpen(true);
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
                      <span className="identity-options-label">
                        {i18n.t("identity.card.details.options.edit")}
                      </span>
                    </span>
                    <span
                      className="identity-options-option"
                      data-testid="identity-options-share-button"
                      onClick={async () => {
                        await Share.share({
                          text: cardData.displayName + " " + cardData.id,
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
                      <span className="identity-options-info-block-data">
                        {i18n.t("identity.card.details.options.share")}
                      </span>
                    </span>
                    <span
                      className="identity-options-option"
                      data-testid="identity-options-delete-button"
                      onClick={() => {
                        setIsOpen(false);
                        handleDelete();
                        dispatch(
                          setCurrentOperation(operationState.deleteIdentity)
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
                      <span className="identity-options-label">
                        {i18n.t("identity.card.details.options.delete")}
                      </span>
                    </span>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}
          </IonContent>
        </div>
      </IonModal>
      <IonModal
        isOpen={viewIsOpen}
        initialBreakpoint={1}
        breakpoints={[1]}
        className="page-layout"
        data-testid="view-identity-modal"
        onDidDismiss={() => setViewIsOpen(false)}
      >
        <div className="identity-options modal viewer">
          {!cardData ? null : (
            <PageLayout
              header={true}
              closeButton={true}
              closeButtonLabel={`${i18n.t(
                "identity.card.details.view.cancel"
              )}`}
              closeButtonAction={() => setViewIsOpen(false)}
              title={`${i18n.t("identity.card.details.view.title")}`}
            >
              <IonGrid className="identity-options-inner">
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
                        dispatch(
                          setCurrentOperation(toastState.copiedToClipboard)
                        );
                      }}
                    >
                      <IonIcon
                        slot="icon-only"
                        size="small"
                        icon={copyOutline}
                      />
                      {i18n.t("identity.card.details.view.copy")}
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
                      />
                      {i18n.t("identity.card.details.view.save")}
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
        headerText={i18n.t("identity.card.details.delete.alert.title")}
        confirmButtonText={`${i18n.t(
          "identity.card.details.delete.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "identity.card.details.delete.alert.cancel"
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

export { IdentityOptions };
