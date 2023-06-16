import {
  IonButton,
  IonCol,
  IonGrid,
  IonItem,
  IonModal,
  IonRow,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { CreateIdentityProps } from "./CreateIdentity.types";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import "./CreateIdentity.scss";
import {VerifyPassword} from "../VerifyPassword";
import {generateUUID} from "../../../utils";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {getDidsCache, setDidsCache} from "../../../store/reducers/didsCache";
import {ColorGenerator} from "../../utils/ColorGenerator";
import {Capacitor} from "@capacitor/core";
import {Keyboard} from "@capacitor/keyboard";
const CreateIdentity = ({
  modalIsOpen,
  setModalIsOpen,
}: CreateIdentityProps) => {
  const dispatch = useAppDispatch();
  const didsData = useAppSelector(getDidsCache);
  const [displayNameValue, setDisplayNameValue] = useState("");
  const [selectedType, setSelectedType] = useState<number | undefined>(
    undefined
  );
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
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
    setSelectedType(undefined);
  };

  const handleCreateIdentity = () => {
    setShowVerifyPassword(true);
  };

  const handleOnVerifyPassword = () => {
    const uuid = generateUUID();
    const id = `did:key:${uuid}`;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");

    const formattedDate = `${day}-${month}-${year}`;
    const colorGenerator = new ColorGenerator();
    const newColor = colorGenerator.generateNextColor();
    const newDid = {
      id,
      type: selectedType === 0 ? `${i18n.t(
        "createIdentity.identityType.types.type0"
      )}` : `${i18n.t(
        "createIdentity.identityType.types.type1"
      )}`,
      name: displayNameValue,
      date: formattedDate,
      colors: [newColor[1], newColor[0]]
    }
    dispatch(setDidsCache([...didsData, newDid]))
    setShowVerifyPassword(false);
    resetModal();
  };



  return (
    <IonModal
      isOpen={modalIsOpen}
      initialBreakpoint={0.45}
      breakpoints={[0.45]}
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
          title={`${i18n.t("createIdentity.title")}`}
        >
          <IonGrid>
            <IonRow>
              <IonCol>
                <CustomInput
                  dataTestId="display-name-input"
                  title={`${i18n.t("createIdentity.displayName.title")}`}
                  placeholder={`${i18n.t(
                    "createIdentity.displayName.placeholder"
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
                  message={`${i18n.t("createIdentity.error.maxLength")}`}
                  timeout={true}
                />
              ) : null}
            </IonRow>
            <IonRow>
              <span className="type-input-title">{`${i18n.t(
                "createIdentity.identityType.title"
              )}`}</span>
            </IonRow>
            <IonRow>
              <IonCol className="col-left">
                <IonItem
                  onClick={() => setSelectedType(0)}
                  className={`type-input ${
                    selectedType === 0 ? "selectedType" : ""
                  }`}
                >
                  <div className="centered-text">
                    <span>{`${i18n.t(
                      "createIdentity.identityType.types.type0"
                    )}`}</span>
                  </div>
                </IonItem>
              </IonCol>
              <IonCol className="col-right">
                <IonItem
                  onClick={() => setSelectedType(1)}
                  className={`type-input ${
                    selectedType === 1 ? "selectedType" : ""
                  }`}
                >
                  <div className="centered-text">
                    <span>{`${i18n.t(
                      "createIdentity.identityType.types.type1"
                    )}`}</span>
                  </div>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow className="continue-button-container">
              <IonCol>
                <IonButton
                  shape="round"
                  expand="block"
                  className="ion-primary-button"
                  data-testid="continue-button"
                  onClick={() => handleCreateIdentity()}
                  disabled={!(displayNameValueIsValid && typeIsSelectedIsValid)}
                >
                  {`${i18n.t("createIdentity.confirmButton")}`}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
          <VerifyPassword
            modalIsOpen={showVerifyPassword}
            onVerify={() => handleOnVerifyPassword()}
            setModalIsOpen={(isOpen:boolean) => setShowVerifyPassword(isOpen)}
          />
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { CreateIdentity };
