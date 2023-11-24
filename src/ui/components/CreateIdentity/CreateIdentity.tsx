import {
  IonButton,
  IonCol,
  IonGrid,
  IonItem,
  IonModal,
  IonRow,
  IonSpinner,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { CreateIdentityProps, TypeItemProps } from "./CreateIdentity.types";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import "./CreateIdentity.scss";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getIdentitiesCache,
  setIdentitiesCache,
} from "../../../store/reducers/identitiesCache";
import {
  IdentifierShortDetails,
  IdentifierType,
} from "../../../core/agent/services/identifierService.types";
import { ColorGenerator } from "../../utils/colorGenerator";
import { AriesAgent } from "../../../core/agent/agent";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { IdentityThemeSelector } from "../IdentityThemeSelector";

const CreateIdentity = ({
  modalIsOpen,
  setModalIsOpen,
}: CreateIdentityProps) => {
  const dispatch = useAppDispatch();
  const identityData = useAppSelector(getIdentitiesCache);
  const [displayNameValue, setDisplayNameValue] = useState("");
  const [selectedType, setSelectedType] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [blur, setBlur] = useState(false);
  const CREATE_IDENTITY_BLUR_TIMEOUT = 250;
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);
  const displayNameValueIsValid =
    displayNameValue.length > 0 && displayNameValue.length <= 32;
  const typeIsSelectedIsValid = selectedType !== undefined;

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
    setSelectedType(0);
    setSelectedTheme(0);
  };

  const handleCreateIdentity = async () => {
    const colorGenerator = new ColorGenerator();
    const newColor = colorGenerator.generateNextColor();
    const type = selectedType === 0 ? IdentifierType.KEY : IdentifierType.KERI;
    const identifier = await AriesAgent.agent.identifiers.createIdentifier({
      displayName: displayNameValue,
      method: type,
      colors: [newColor[1], newColor[0]],
      theme: selectedTheme,
    });
    if (identifier) {
      const newIdentity: IdentifierShortDetails = {
        id: identifier,
        method: type,
        displayName: displayNameValue,
        createdAtUTC: new Date().toISOString(),
        colors: [newColor[1], newColor[0]],
        theme: selectedTheme,
      };
      dispatch(setIdentitiesCache([...identityData, newIdentity]));
      dispatch(setToastMsg(ToastMsgType.IDENTIFIER_CREATED));
      resetModal();
    }
  };

  const TypeItem = ({ index, text }: TypeItemProps) => {
    return (
      <IonCol>
        <IonItem
          onClick={() => {
            if (selectedType !== index) {
              setSelectedTheme(index === 0 ? 0 : 4);
            }
            setSelectedType(index);
          }}
          className={`type-input ${
            selectedType === index ? "selected-type" : ""
          }`}
        >
          <div className="centered-text">
            <span>{text}</span>
          </div>
        </IonItem>
      </IonCol>
    );
  };

  return (
    <IonModal
      isOpen={modalIsOpen}
      initialBreakpoint={0.85}
      breakpoints={[0, 0.85]}
      className={`page-layout create-identity-modal ${blur ? "blur" : ""}`}
      data-testid="create-identity-modal"
      onDidDismiss={() => resetModal()}
    >
      {blur ? (
        <div
          className="spinner-container"
          data-testid="spinner-container"
        >
          <IonSpinner name="circular" />
        </div>
      ) : null}
      <div className="create-identity modal">
        <PageLayout
          header={true}
          title={`${i18n.t("createidentity.title")}`}
        >
          <IonGrid>
            <IonRow className="identity-name-input">
              <IonCol>
                <CustomInput
                  dataTestId="display-name-input"
                  title={`${i18n.t("createidentity.displayname.title")}`}
                  placeholder={`${i18n.t(
                    "createidentity.displayname.placeholder"
                  )}`}
                  hiddenInput={false}
                  onChangeInput={setDisplayNameValue}
                  value={displayNameValue}
                />
              </IonCol>
            </IonRow>

            <IonRow className="error-message-container">
              {displayNameValue.length !== 0 && !displayNameValueIsValid ? (
                <ErrorMessage
                  message={`${i18n.t("createidentity.error.maxlength")}`}
                  timeout={true}
                />
              ) : null}
            </IonRow>

            {!keyboardIsOpen ? (
              <>
                <IonRow>
                  <span className="type-input-title">{`${i18n.t(
                    "createidentity.identitytype.title"
                  )}`}</span>
                </IonRow>

                <IonRow
                  className="identity-type-selector"
                  data-testid="identity-type-selector"
                >
                  <TypeItem
                    index={0}
                    text={i18n.t("createidentity.identitytype.didkey")}
                  />
                  <TypeItem
                    index={1}
                    text={i18n.t("createidentity.identitytype.keri")}
                  />
                </IonRow>

                <IonRow>
                  <span className="type-input-title">{`${i18n.t(
                    "createidentity.theme.title"
                  )}`}</span>
                </IonRow>
                <IdentityThemeSelector
                  identityType={selectedType}
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                />

                <IonRow className="continue-button-container">
                  <IonCol>
                    <IonButton
                      shape="round"
                      expand="block"
                      className="primary-button"
                      data-testid="continue-button"
                      onClick={() => {
                        setBlur(true);
                        setTimeout(() => {
                          handleCreateIdentity();
                        }, CREATE_IDENTITY_BLUR_TIMEOUT);
                      }}
                      disabled={
                        !(displayNameValueIsValid && typeIsSelectedIsValid)
                      }
                    >
                      {`${i18n.t("createidentity.confirmbutton")}`}
                    </IonButton>
                  </IonCol>
                </IonRow>
              </>
            ) : null}
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { CreateIdentity };
