import { IonCol, IonGrid, IonRow, IonSpinner } from "@ionic/react";
import { useEffect, useState } from "react";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
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

const CreateIdentifier = ({
  modalIsOpen,
  setModalIsOpen,
}: CreateIdentifierProps) => {
  const componentId = "create-identifier-modal";
  const dispatch = useAppDispatch();
  const identifierData = useAppSelector(getIdentifiersCache);
  const [displayNameValue, setDisplayNameValue] = useState("");
  const [selectedIdentifierType, setSelectedIdentifierType] = useState(0);
  const [selectedAidType, setSelectedAidType] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [blur, setBlur] = useState(false);
  const CREATE_IDENTIFIER_BLUR_TIMEOUT = 250;
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);
  const displayNameValueIsValid =
    displayNameValue.length > 0 && displayNameValue.length <= 32;
  const typeIsSelectedIsValid = selectedIdentifierType !== undefined;

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

  return (
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
                      text={i18n.t("createidentifier.identifiertype.didkey")}
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
              primaryButtonText={`${i18n.t("createidentifier.confirmbutton")}`}
              primaryButtonAction={() => {
                setBlur(true);
                setTimeout(() => {
                  handleCreateIdentifier();
                }, CREATE_IDENTIFIER_BLUR_TIMEOUT);
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
  );
};

export { CreateIdentifier };
