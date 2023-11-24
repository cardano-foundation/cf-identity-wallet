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
import { IdentifierOptionsProps } from "./IdentifierOptions.types";
import "./IdentifierOptions.scss";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import { VerifyPassword } from "../VerifyPassword";
import { Alert } from "../Alert";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../store/reducers/identifiersCache";
import { getBackRoute } from "../../../routes/backRoute";
import { TabsRoutePath } from "../../../routes/paths";
import {
  getStateCache,
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { DISPLAY_NAME_LENGTH } from "../../globals/constants";
import { VerifyPasscode } from "../VerifyPasscode";
import { OperationType, ToastMsgType } from "../../globals/types";
import { PageLayout } from "../layout/PageLayout";
import { writeToClipboard } from "../../utils/clipboard";
import { AriesAgent } from "../../../core/agent/agent";
import { IdentifierThemeSelector } from "../IdentifierThemeSelector";
import { IdentifierType } from "../../../core/agent/agent.types";

const IdentifierOptions = ({
  optionsIsOpen,
  setOptionsIsOpen,
  cardData,
  setCardData,
}: IdentifierOptionsProps) => {
  const dispatch = useAppDispatch();
  const identifierData = useAppSelector(getIdentifiersCache);
  const stateCache = useAppSelector(getStateCache);
  const history = useHistory();
  const [editorOptionsIsOpen, setEditorIsOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(cardData.displayName);
  const [newSelectedTheme, setNewSelectedTheme] = useState(cardData.theme);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [viewIsOpen, setViewIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [keyboardIsOpen, setkeyboardIsOpen] = useState(false);
  const verifyDisplayName =
    newDisplayName.length > 0 &&
    newDisplayName.length <= DISPLAY_NAME_LENGTH &&
    (newDisplayName !== cardData.displayName ||
      newSelectedTheme !== cardData.theme);

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

  useEffect(() => {
    setNewSelectedTheme(cardData.theme);
  }, [editorOptionsIsOpen]);

  const handleClose = () => {
    setEditorIsOpen(false);
    setOptionsIsOpen(false);
  };

  const handleDelete = () => {
    setActionType("delete");
    setOptionsIsOpen(false);
    setAlertIsOpen(true);
  };

  const handleSubmit = async () => {
    setActionType("edit");
    setEditorIsOpen(false);
    setOptionsIsOpen(false);
    const updatedIdentifiers = [...identifierData];
    const index = updatedIdentifiers.findIndex(
      (identifier) => identifier.id === cardData.id
    );
    updatedIdentifiers[index] = {
      ...updatedIdentifiers[index],
      displayName: newDisplayName,
      theme: newSelectedTheme,
    };
    await AriesAgent.agent.identifiers.updateIdentifier(cardData.id, {
      displayName: newDisplayName,
      theme: newSelectedTheme,
    });
    setCardData({
      ...cardData,
      displayName: newDisplayName,
      theme: newSelectedTheme,
    });
    dispatch(setIdentifiersCache(updatedIdentifiers));
    dispatch(setToastMsg(ToastMsgType.IDENTIFIER_UPDATED));
    handleDone();
  };

  const verifyAction = () => {
    handleClose();
    const updatedIdentifiers = identifierData.filter(
      (item) => item.id !== cardData.id
    );
    dispatch(setIdentifiersCache(updatedIdentifiers));
    handleDone();
  };

  const handleDone = async () => {
    const { backPath, updateRedux } = getBackRoute(
      TabsRoutePath.IDENTIFIER_DETAILS,
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
    if (actionType === "delete") {
      await AriesAgent.agent.identifiers.archiveIdentifier(cardData.id);
      await AriesAgent.agent.identifiers.deleteIdentifier(cardData.id);
      history.push(TabsRoutePath.IDENTIFIERS);
    }
  };

  return (
    <>
      <IonModal
        isOpen={optionsIsOpen}
        initialBreakpoint={0.4}
        breakpoints={[0, 0.4]}
        className="page-layout"
        data-testid="identifier-options-modal"
        onDidDismiss={() => setOptionsIsOpen(false)}
      >
        <div className="identifier-options modal menu">
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              <IonTitle data-testid="identifier-options-title">
                <h2>{i18n.t("identifiers.card.details.options.title")}</h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent
            className="identifier-options-body"
            color="light"
          >
            <IonGrid className="identifier-options-main">
              <IonRow>
                <IonCol size="12">
                  <span
                    className="identifier-options-option"
                    data-testid="identifier-options-view-button"
                    onClick={() => {
                      setOptionsIsOpen(false);
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
                    <span className="identifier-options-label">
                      {i18n.t("identifiers.card.details.options.view")}
                    </span>
                  </span>
                  <span
                    className="identifier-options-option"
                    data-testid="identifier-options-identifier-options-button"
                    onClick={() => {
                      dispatch(
                        setCurrentOperation(OperationType.UPDATE_IDENTIFIER)
                      );
                      setNewDisplayName(cardData.displayName);
                      setOptionsIsOpen(false);
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
                    <span className="identifier-options-label">
                      {i18n.t("identifiers.card.details.options.edit")}
                    </span>
                  </span>
                  <span
                    className="identifier-options-option"
                    data-testid="identifier-options-share-button"
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
                    <span className="identifier-options-info-block-data">
                      {i18n.t("identifiers.card.details.options.share")}
                    </span>
                  </span>
                  <span
                    className="identifier-options-option"
                    data-testid="identifier-options-delete-button"
                    onClick={() => {
                      setOptionsIsOpen(false);
                      handleDelete();
                      dispatch(
                        setCurrentOperation(OperationType.DELETE_IDENTIFIER)
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
                    <span className="identifier-options-label">
                      {i18n.t("identifiers.card.details.options.delete")}
                    </span>
                  </span>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </div>
      </IonModal>
      <IonModal
        isOpen={editorOptionsIsOpen}
        initialBreakpoint={0.65}
        breakpoints={[0, 0.65]}
        className={`page-layout ${keyboardIsOpen ? "extended-modal" : ""}`}
        data-testid="edit-identifier-modal"
        onDidDismiss={() => {
          setEditorIsOpen(false);
          setNewDisplayName(cardData.displayName);
          setNewSelectedTheme(cardData.theme);
        }}
      >
        <div className="identifier-options modal editor">
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              <IonButtons slot="start">
                <IonButton
                  className="close-button-label"
                  onClick={() => {
                    handleClose();
                    dispatch(setCurrentOperation(OperationType.IDLE));
                  }}
                  data-testid="close-button"
                >
                  {i18n.t("identifiers.card.details.options.cancel")}
                </IonButton>
              </IonButtons>
              <IonTitle data-testid="identifier-options-title">
                <h2>{i18n.t("identifiers.card.details.options.edit")}</h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent
            className="identifier-options-body"
            color="light"
          >
            <IonGrid className="identifier-options-inner">
              <IonRow>
                <IonCol size="12">
                  <CustomInput
                    dataTestId="edit-display-name"
                    title={`${i18n.t(
                      "identifiers.card.details.options.inner.label"
                    )}`}
                    hiddenInput={false}
                    autofocus={true}
                    onChangeInput={setNewDisplayName}
                    value={newDisplayName}
                  />
                </IonCol>
              </IonRow>
              <IonRow className="error-message-container">
                {newDisplayName.length > DISPLAY_NAME_LENGTH ? (
                  <ErrorMessage
                    message={`${i18n.t(
                      "identifiers.card.details.options.inner.error"
                    )}`}
                    timeout={false}
                  />
                ) : null}
              </IonRow>
              <IonRow>
                <span className="theme-input-title">{`${i18n.t(
                  "identifiers.card.details.options.inner.theme"
                )}`}</span>
              </IonRow>
              <IdentifierThemeSelector
                identifierType={cardData.method === IdentifierType.KEY ? 0 : 1}
                selectedTheme={newSelectedTheme}
                setSelectedTheme={setNewSelectedTheme}
              />
              <IonButton
                shape="round"
                expand="block"
                className="primary-button"
                data-testid="continue-button"
                onClick={handleSubmit}
                disabled={!verifyDisplayName}
              >
                {i18n.t("identifiers.card.details.options.inner.confirm")}
              </IonButton>
            </IonGrid>
          </IonContent>
        </div>
      </IonModal>
      <IonModal
        isOpen={viewIsOpen}
        initialBreakpoint={1}
        breakpoints={[0, 1]}
        className="page-layout"
        data-testid="view-identifier-modal"
        onDidDismiss={() => setViewIsOpen(false)}
      >
        <div className="identifier-options modal viewer">
          {!cardData ? null : (
            <PageLayout
              header={true}
              closeButton={true}
              closeButtonLabel={`${i18n.t(
                "identifiers.card.details.view.cancel"
              )}`}
              closeButtonAction={() => setViewIsOpen(false)}
              title={`${i18n.t("identifiers.card.details.view.title")}`}
            >
              <IonGrid className="identifier-options-inner">
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
                      />
                      {i18n.t("identifiers.card.details.view.copy")}
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
                      />
                      {i18n.t("identifiers.card.details.view.save")}
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
        headerText={i18n.t("identifiers.card.details.delete.alert.title")}
        confirmButtonText={`${i18n.t(
          "identifiers.card.details.delete.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "identifiers.card.details.delete.alert.cancel"
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

export { IdentifierOptions };
