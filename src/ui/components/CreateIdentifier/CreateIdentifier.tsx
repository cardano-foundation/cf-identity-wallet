import {
  IonButton,
  IonCard,
  IonCheckbox,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonSearchbar,
  IonSpinner,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import { addOutline, removeOutline, pencilOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { CreateIdentifierProps } from "./CreateIdentifier.types";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import "./CreateIdentifier.scss";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../store/reducers/identifiersCache";
import {
  IdentifierShortDetails,
  IdentifierType,
} from "../../../core/agent/services/identifierService.types";
import { ColorGenerator } from "../../utils/colorGenerator";
import { AriesAgent } from "../../../core/agent/agent";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { PageHeader } from "../PageHeader";
import { PageFooter } from "../PageFooter";
import { ResponsiveModal } from "../layout/ResponsiveModal";
import { TypeItem } from "./components/TypeItem";
import { IdentifierThemeSelector } from "./components/IdentifierThemeSelector";
import { ScrollablePageLayout } from "../layout/ScrollablePageLayout";
import { getConnectionsCache } from "../../../store/reducers/connectionsCache";
import { ConnectionShortDetails } from "../../pages/Connections/Connections.types";
import CardanoLogo from "../../assets/images/CardanoLogo.jpg";

const CreateIdentifier = ({
  modalIsOpen,
  setModalIsOpen,
}: CreateIdentifierProps) => {
  const componentId = "create-identifier-modal";
  const dispatch = useAppDispatch();
  const identifierData = useAppSelector(getIdentifiersCache);
  const connectionsCache = useAppSelector(getConnectionsCache);
  const [displayNameValue, setDisplayNameValue] = useState("");
  const [selectedIdentifierType, setSelectedIdentifierType] = useState(0);
  const [selectedAidType, setSelectedAidType] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [multiSigStage, setMultiSigStage] = useState(0);
  const [blur, setBlur] = useState(false);
  const CREATE_IDENTIFIER_BLUR_TIMEOUT = 250;
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);
  const displayNameValueIsValid =
    displayNameValue.length > 0 && displayNameValue.length <= 32;
  const typeIsSelectedIsValid = selectedIdentifierType !== undefined;
  const [sortedConnections, setSortedConnections] = useState<
    ConnectionShortDetails[]
  >([]);
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [threshold, setThreshold] = useState(1);

  useEffect(() => {
    if (connectionsCache.length) {
      const sortedConnections = [...connectionsCache].sort(function (a, b) {
        const textA = a.label.toUpperCase();
        const textB = b.label.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
      setSortedConnections(sortedConnections);
    }
  }, [connectionsCache]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Keyboard.addListener("keyboardWillShow", () => {
        setKeyboardIsOpen(true);
      });
      Keyboard.addListener("keyboardWillHide", () => {
        setKeyboardIsOpen(false);
      });
    }
  }, []);

  useEffect(() => {
    blur
      ? document?.querySelector("ion-router-outlet")?.classList.add("blur")
      : document?.querySelector("ion-router-outlet")?.classList.remove("blur");
  }, [blur]);

  const resetModal = () => {
    setModalIsOpen(false);
    setBlur(false);
    setDisplayNameValue("");
    setSelectedIdentifierType(0);
    setSelectedTheme(0);
    setSelectedAidType(0);
    setMultiSigStage(0);
    setSelectedConnections([]);
  };

  const handleCreateIdentifier = async () => {
    const colorGenerator = new ColorGenerator();
    const newColor = colorGenerator.generateNextColor();
    const type =
      selectedIdentifierType === 0 ? IdentifierType.KEY : IdentifierType.KERI;
    const identifier = await AriesAgent.agent.identifiers.createIdentifier({
      displayName: displayNameValue,
      method: type,
      colors: [newColor[1], newColor[0]],
      theme: selectedTheme,
    });
    if (identifier) {
      const newIdentifier: IdentifierShortDetails = {
        id: identifier,
        method: type,
        displayName: displayNameValue,
        createdAtUTC: new Date().toISOString(),
        colors: [newColor[1], newColor[0]],
        theme: selectedTheme,
      };
      dispatch(setIdentifiersCache([...identifierData, newIdentifier]));
      dispatch(setToastMsg(ToastMsgType.IDENTIFIER_CREATED));
      resetModal();
    }
  };

  const identifierTypeSelector = (index: number) => {
    if (selectedIdentifierType !== index) {
      setSelectedTheme(index === 0 ? 0 : 4);
    }
    setSelectedIdentifierType(index);
  };

  const handleSelectConnection = (id: string) => {
    let data = selectedConnections;
    if (data.find((item) => item === id)) {
      data = data.filter((item) => item !== id);
    } else {
      data = [...selectedConnections, id];
    }
    setSelectedConnections(data);
  };

  return (
    <>
      {multiSigStage === 0 && (
        <ResponsiveModal
          componentId={componentId}
          modalIsOpen={modalIsOpen}
          customClasses={`${componentId} ${blur ? "blur" : ""}`}
          onDismiss={() => resetModal()}
        >
          {blur && (
            <div
              className="spinner-container"
              data-testid="spinner-container"
            >
              <IonSpinner name="circular" />
            </div>
          )}
          <>
            <PageHeader
              closeButton={true}
              closeButtonLabel={`${i18n.t("createidentifier.cancel")}`}
              closeButtonAction={() => resetModal()}
              title={`${i18n.t("createidentifier.title")}`}
            />
            <div
              className={`identifier-name${
                displayNameValue.length !== 0 && !displayNameValueIsValid
                  ? " identifier-name-error"
                  : ""
              }`}
            >
              <CustomInput
                dataTestId="display-name-input"
                title={`${i18n.t("createidentifier.displayname.title")}`}
                placeholder={`${i18n.t(
                  "createidentifier.displayname.placeholder"
                )}`}
                hiddenInput={false}
                onChangeInput={setDisplayNameValue}
                value={displayNameValue}
              />
              <div className="error-message-container">
                {displayNameValue.length !== 0 && !displayNameValueIsValid && (
                  <ErrorMessage
                    message={`${i18n.t("createidentifier.error.maxlength")}`}
                    timeout={true}
                  />
                )}
              </div>
            </div>
            {!keyboardIsOpen ? (
              <>
                <div className="identifier-type">
                  <div className="type-input-title">{`${i18n.t(
                    "createidentifier.identifiertype.title"
                  )}`}</div>
                  <IonGrid
                    className="identifier-type-selector"
                    data-testid="identifier-type-selector"
                  >
                    <IonRow>
                      <IonCol>
                        <TypeItem
                          index={0}
                          text={i18n.t(
                            "createidentifier.identifiertype.didkey"
                          )}
                          clickEvent={() => identifierTypeSelector(0)}
                          selectedType={selectedIdentifierType}
                        />
                      </IonCol>
                      <IonCol>
                        <TypeItem
                          index={1}
                          text={i18n.t("createidentifier.identifiertype.keri")}
                          clickEvent={() => identifierTypeSelector(1)}
                          selectedType={selectedIdentifierType}
                        />
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </div>
                {selectedIdentifierType === 1 && (
                  <div className="aid-type">
                    <div className="type-input-title">{`${i18n.t(
                      "createidentifier.aidtype.title"
                    )}`}</div>
                    <IonGrid
                      className="aid-type-selector"
                      data-testid="aid-type-selector"
                    >
                      <IonRow>
                        <IonCol>
                          <TypeItem
                            index={0}
                            text={i18n.t(
                              "createidentifier.aidtype.default.label"
                            )}
                            clickEvent={() => setSelectedAidType(0)}
                            selectedType={selectedAidType}
                          />
                        </IonCol>
                        <IonCol>
                          <TypeItem
                            index={1}
                            text={i18n.t(
                              "createidentifier.aidtype.multisig.label"
                            )}
                            clickEvent={() => setSelectedAidType(1)}
                            selectedType={selectedAidType}
                          />
                        </IonCol>
                        <IonCol>
                          <TypeItem
                            index={2}
                            text={i18n.t(
                              "createidentifier.aidtype.delegated.label"
                            )}
                            clickEvent={() => setSelectedAidType(2)}
                            selectedType={selectedAidType}
                          />
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </div>
                )}
                <div className="identifier-theme">
                  <div className="theme-input-title">{`${i18n.t(
                    "createidentifier.theme.title"
                  )}`}</div>
                  <IdentifierThemeSelector
                    identifierType={selectedIdentifierType}
                    selectedTheme={selectedTheme}
                    setSelectedTheme={setSelectedTheme}
                  />
                </div>
                <PageFooter
                  pageId={componentId}
                  primaryButtonText={`${i18n.t(
                    "createidentifier.confirmbutton"
                  )}`}
                  primaryButtonAction={() => {
                    if (selectedIdentifierType === 1 && selectedAidType !== 0) {
                      setMultiSigStage(1);
                    } else {
                      setBlur(true);
                      setTimeout(() => {
                        handleCreateIdentifier();
                      }, CREATE_IDENTIFIER_BLUR_TIMEOUT);
                    }
                  }}
                  primaryButtonDisabled={
                    !(displayNameValueIsValid && typeIsSelectedIsValid)
                  }
                />
              </>
            ) : (
              <></>
            )}
          </>
        </ResponsiveModal>
      )}
      {multiSigStage === 1 && (
        <IonModal
          isOpen={modalIsOpen}
          className={componentId}
          data-testid={componentId}
          onDidDismiss={() => resetModal()}
        >
          <ScrollablePageLayout
            pageId={componentId + "-content"}
            header={
              <PageHeader
                closeButton={true}
                closeButtonAction={() => {
                  setMultiSigStage(0);
                  setSelectedConnections([]);
                }}
                closeButtonLabel={`${i18n.t("createidentifier.back")}`}
                title={`${i18n.t("createidentifier.connections.title")}`}
              />
            }
          >
            <p className="multisig-subtitle">
              {i18n.t("createidentifier.connections.subtitle")}
            </p>
            <IonSearchbar
              placeholder={`${i18n.t("createidentifier.connections.search")}`}
            />
            <IonList>
              {sortedConnections.map((connection, index) => {
                return (
                  <IonItem
                    key={index}
                    onClick={() => handleSelectConnection(connection.id)}
                    className={`${
                      selectedConnections.includes(connection.id) &&
                      "selected-connection"
                    }`}
                  >
                    <IonLabel>
                      <img
                        src={connection?.logo ?? CardanoLogo}
                        alt="connection-logo"
                      />
                      <span className="connection-name">
                        {connection.label}
                      </span>
                      <IonCheckbox
                        checked={selectedConnections.includes(connection.id)}
                        onIonChange={() => {
                          handleSelectConnection(connection.id);
                        }}
                        aria-label=""
                      />
                    </IonLabel>
                  </IonItem>
                );
              })}
            </IonList>
            <PageFooter
              pageId={componentId}
              primaryButtonText={`${i18n.t(
                "createidentifier.connections.continue"
              )}`}
              primaryButtonAction={() => setMultiSigStage(2)}
              primaryButtonDisabled={!selectedConnections.length}
            />
          </ScrollablePageLayout>
        </IonModal>
      )}
      {multiSigStage === 2 && (
        <ResponsiveModal
          componentId={componentId}
          modalIsOpen={modalIsOpen}
          customClasses={componentId}
          onDismiss={() => resetModal()}
        >
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${i18n.t("createidentifier.back")}`}
            closeButtonAction={() => {
              setThreshold(1);
              setMultiSigStage(1);
            }}
            title={`${i18n.t("createidentifier.threshold.title")}`}
          />
          <p className="multisig-subtitle">
            {i18n.t("createidentifier.threshold.subtitle")}
          </p>
          <div className="identifier-threshold">
            <div className="identifier-threshold-title">
              {i18n.t("createidentifier.threshold.label")}
            </div>
            <div className="identifier-threshold-items">
              <div className="identifier-threshold-amount">{threshold}</div>
              <div className="identifier-threshold-controls">
                <IonButton
                  shape="round"
                  className="decrease-threshold-button"
                  data-testid="decrease-threshold-button"
                  onClick={() => {
                    if (threshold === 1) {
                      return;
                    } else {
                      setThreshold(threshold - 1);
                    }
                  }}
                >
                  <IonIcon
                    slot="icon-only"
                    icon={removeOutline}
                    color="primary"
                  />
                </IonButton>
                <IonButton
                  shape="round"
                  className="increase-threshold-button"
                  data-testid="increase-threshold-button"
                  onClick={() => {
                    if (threshold === selectedConnections.length + 1) {
                      return;
                    } else {
                      setThreshold(threshold + 1);
                    }
                  }}
                >
                  <IonIcon
                    slot="icon-only"
                    icon={addOutline}
                    color="primary"
                  />
                </IonButton>
              </div>
            </div>
          </div>
          <PageFooter
            pageId={componentId}
            primaryButtonText={`${i18n.t(
              "createidentifier.threshold.continue"
            )}`}
            primaryButtonAction={() => setMultiSigStage(3)}
          />
        </ResponsiveModal>
      )}
      {multiSigStage === 3 && (
        <IonModal
          isOpen={modalIsOpen}
          className={componentId}
          data-testid={componentId}
          onDidDismiss={() => resetModal()}
        >
          <ScrollablePageLayout
            pageId={componentId + "-content"}
            header={
              <PageHeader
                closeButton={true}
                closeButtonAction={() => setMultiSigStage(2)}
                closeButtonLabel={`${i18n.t("createidentifier.back")}`}
                title={`${i18n.t("createidentifier.confirm.title")}`}
              />
            }
          >
            <p className="multisig-subtitle">
              {i18n.t("createidentifier.confirm.subtitle")}
            </p>
            <div>
              <div className="identifier-list-title">
                {i18n.t("createidentifier.confirm.displayname")}
              </div>
              <IonCard>
                <IonItem className="identifier-list-item">
                  <IonLabel>{displayNameValue}</IonLabel>
                  <IonIcon
                    aria-hidden="true"
                    icon={pencilOutline}
                    slot="end"
                    onClick={() => setMultiSigStage(0)}
                  />
                </IonItem>
              </IonCard>
            </div>
            <div>
              <div className="identifier-list-title">
                {i18n.t("createidentifier.confirm.selectedmembers")}
              </div>
              <IonCard>
                {sortedConnections.map((connection, index) => {
                  if (selectedConnections.includes(connection.id)) {
                    return (
                      <IonItem
                        key={index}
                        className="identifier-list-item"
                      >
                        <IonLabel>
                          <img
                            src={connection?.logo ?? CardanoLogo}
                            alt="connection-logo"
                          />
                          <span className="connection-name">
                            {connection.label}
                          </span>
                        </IonLabel>
                        <IonIcon
                          aria-hidden="true"
                          icon={pencilOutline}
                          slot="end"
                          onClick={() => setMultiSigStage(1)}
                        />
                      </IonItem>
                    );
                  }
                })}
              </IonCard>
            </div>
            <div>
              <div className="identifier-list-title">
                {i18n.t("createidentifier.confirm.treshold")}
              </div>
              <IonCard>
                <IonItem className="identifier-list-item">
                  <IonLabel>{threshold}</IonLabel>
                  <IonIcon
                    aria-hidden="true"
                    icon={pencilOutline}
                    slot="end"
                    onClick={() => setMultiSigStage(2)}
                  />
                </IonItem>
              </IonCard>
            </div>
            <PageFooter
              pageId={componentId}
              primaryButtonText={`${i18n.t(
                "createidentifier.confirm.continue"
              )}`}
              primaryButtonAction={() => {
                resetModal();
                alert("Transmit data");
              }}
            />
          </ScrollablePageLayout>
        </IonModal>
      )}
    </>
  );
};

export { CreateIdentifier };
