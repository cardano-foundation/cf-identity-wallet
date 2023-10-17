import {
  IonButton,
  IonCol,
  IonGrid,
  IonItem,
  IonModal,
  IonRow,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { CreateIdentityProps } from "./CreateIdentity.types";
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
} from "../../../core/agent/agent.types";
import { ColorGenerator } from "../../utils/ColorGenerator";
import { AriesAgent } from "../../../core/agent/agent";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { toastState } from "../../constants/dictionary";
import BackgroundDidKey0 from "../../../ui/assets/images/did-key-0.png";
import BackgroundDidKey1 from "../../../ui/assets/images/did-key-1.png";
import BackgroundDidKey2 from "../../../ui/assets/images/did-key-2.png";
import BackgroundDidKey3 from "../../../ui/assets/images/did-key-3.png";
import BackgroundKERI0 from "../../../ui/assets/images/keri-0.png";
import BackgroundKERI1 from "../../../ui/assets/images/keri-1.png";

const CreateIdentity = ({
  modalIsOpen,
  setModalIsOpen,
}: CreateIdentityProps) => {
  const dispatch = useAppDispatch();
  const identityData = useAppSelector(getIdentitiesCache);
  const [displayNameValue, setDisplayNameValue] = useState("");
  const [selectedType, setSelectedType] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(0);
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

  const resetModal = () => {
    setModalIsOpen(false);
    setDisplayNameValue("");
    setSelectedType(0);
  };

  const handleCreateIdentity = async () => {
    const colorGenerator = new ColorGenerator();
    const newColor = colorGenerator.generateNextColor();
    const type = selectedType === 0 ? IdentifierType.KEY : IdentifierType.KERI;
    // @TODO: for test, should set colors
    let theme = selectedTheme;
    if (type === IdentifierType.KERI) {
      theme = selectedTheme === 5 ? 1 : 0;
    }
    const identifier = await AriesAgent.agent.identifiers.createIdentifier({
      displayName: displayNameValue,
      method: type,
      colors: [newColor[1], newColor[0]],
      theme,
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
      dispatch(setCurrentOperation(toastState.identityCreated));
      resetModal();
    }
  };

  return (
    <IonModal
      isOpen={modalIsOpen}
      initialBreakpoint={0.675}
      breakpoints={[0, 0.675]}
      className={`page-layout ${keyboardIsOpen ? "extended-modal" : ""}`}
      data-testid="create-identity-modal"
      onDidDismiss={() => resetModal()}
    >
      <div className="create-identity modal">
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonLabel={`${i18n.t("verifypassword.cancel")}`}
          closeButtonAction={() => setModalIsOpen(false)}
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
            <IonRow>
              <span className="type-input-title">{`${i18n.t(
                "createidentity.identitytype.title"
              )}`}</span>
            </IonRow>
            <IonRow className="identity-type-input">
              <IonCol className="col-left">
                <IonItem
                  onClick={() => {
                    setSelectedType(0);
                    if (selectedTheme > 3) {
                      setSelectedTheme(0);
                    }
                  }}
                  className={`type-input ${
                    selectedType === 0 ? "selected-type" : ""
                  }`}
                >
                  <div className="centered-text">
                    <span>{"DID:KEY"}</span>
                  </div>
                </IonItem>
              </IonCol>
              <IonCol className="col-right">
                <IonItem
                  onClick={() => {
                    setSelectedType(1);
                    if (selectedTheme < 4) {
                      setSelectedTheme(4);
                    }
                  }}
                  className={`type-input ${
                    selectedType === 1 ? "selected-type" : ""
                  }`}
                >
                  <div className="centered-text">
                    <span>{"KERI"}</span>
                  </div>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <span className="type-input-title">{`${i18n.t(
                "createidentity.theme.title"
              )}`}</span>
            </IonRow>
            {selectedType === 0 ? (
              <>
                <IonRow className="identity-theme-input">
                  <IonCol className="col-left">
                    <IonItem
                      onClick={() => setSelectedTheme(0)}
                      className={`theme-input ${
                        selectedTheme === 0 ? "selected-theme" : ""
                      }`}
                      style={{
                        backgroundImage: `url(${BackgroundDidKey0})`,
                        backgroundSize: "cover",
                      }}
                    ></IonItem>
                  </IonCol>
                  <IonCol className="col-right">
                    <IonItem
                      onClick={() => setSelectedTheme(1)}
                      className={`theme-input ${
                        selectedTheme === 1 ? "selected-theme" : ""
                      }`}
                      style={{
                        backgroundImage: `url(${BackgroundDidKey1})`,
                        backgroundSize: "cover",
                      }}
                    ></IonItem>
                  </IonCol>
                </IonRow>
                <IonRow className="identity-theme-input">
                  <IonCol className="col-left">
                    <IonItem
                      onClick={() => setSelectedTheme(2)}
                      className={`theme-input ${
                        selectedTheme === 2 ? "selected-theme" : ""
                      }`}
                      style={{
                        backgroundImage: `url(${BackgroundDidKey2})`,
                        backgroundSize: "cover",
                      }}
                    ></IonItem>
                  </IonCol>
                  <IonCol className="col-right">
                    <IonItem
                      onClick={() => setSelectedTheme(3)}
                      className={`theme-input ${
                        selectedTheme === 3 ? "selectedtheme" : ""
                      }`}
                      style={{
                        backgroundImage: `url(${BackgroundDidKey3})`,
                        backgroundSize: "cover",
                      }}
                    ></IonItem>
                  </IonCol>
                </IonRow>
              </>
            ) : (
              <>
                <IonRow className="identity-theme-input">
                  <IonCol className="col-left">
                    <IonItem
                      onClick={() => setSelectedTheme(4)}
                      className={`theme-input ${
                        selectedTheme === 4 ? "selected-theme" : ""
                      }`}
                      style={{
                        backgroundImage: `url(${BackgroundKERI0})`,
                        backgroundSize: "cover",
                      }}
                    ></IonItem>
                  </IonCol>
                  <IonCol className="col-right">
                    <IonItem
                      onClick={() => setSelectedTheme(5)}
                      className={`theme-input ${
                        selectedTheme === 5 ? "selected-theme" : ""
                      }`}
                      style={{
                        backgroundImage: `url(${BackgroundKERI1})`,
                        backgroundSize: "cover",
                      }}
                    ></IonItem>
                  </IonCol>
                </IonRow>
              </>
            )}

            <IonRow className="continue-button-container">
              <IonCol>
                <IonButton
                  shape="round"
                  expand="block"
                  className="ion-primary-button"
                  data-testid="continue-button"
                  onClick={handleCreateIdentity}
                  disabled={!(displayNameValueIsValid && typeIsSelectedIsValid)}
                >
                  {`${i18n.t("createidentity.confirmbutton")}`}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { CreateIdentity };
