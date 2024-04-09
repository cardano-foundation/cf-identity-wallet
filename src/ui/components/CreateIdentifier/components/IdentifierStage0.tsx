import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import { IonGrid, IonRow, IonCol } from "@ionic/react";
import { useEffect, useState } from "react";
import { i18n } from "../../../../i18n";
import { CustomInput } from "../../CustomInput";
import { ErrorMessage } from "../../ErrorMessage";
import { PageFooter } from "../../PageFooter";
import { PageHeader } from "../../PageHeader";
import { IdentifierThemeSelector } from "./IdentifierThemeSelector";
import { TypeItem } from "./TypeItem";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { ColorGenerator } from "../../../utils/colorGenerator";
import { IdentifierShortDetails } from "../../../../core/agent/services/identifier.types";
import { Agent } from "../../../../core/agent/agent";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../../store/reducers/identifiersCache";
import { setToastMsg } from "../../../../store/reducers/stateCache";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { ToastMsgType } from "../../../globals/types";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";

const IdentifierStage0 = ({
  state,
  setState,
  componentId,
  setBlur,
  resetModal,
}: IdentifierStageProps) => {
  const dispatch = useAppDispatch();
  const identifiersData = useAppSelector(getIdentifiersCache);
  const CREATE_IDENTIFIER_BLUR_TIMEOUT = 250;
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);
  const [displayNameValue, setDisplayNameValue] = useState(
    state.displayNameValue
  );
  const [selectedTheme, setSelectedTheme] = useState(state.selectedTheme);
  const displayNameValueIsValid =
    displayNameValue.length > 0 && displayNameValue.length <= 32;

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
    setState((prevState: IdentifierStageProps) => ({
      ...prevState,
      displayNameValue: displayNameValue,
    }));
  }, [displayNameValue, setState]);

  useEffect(() => {
    setState((prevState: IdentifierStageProps) => ({
      ...prevState,
      selectedTheme: selectedTheme,
    }));
  }, [selectedTheme, setState]);

  const handleCreateIdentifier = async () => {
    // @TODO - sdisalvo: Colors will need to be removed
    const colorGenerator = new ColorGenerator();
    const newColor = colorGenerator.generateNextColor();
    const { identifier, signifyName } =
      await Agent.agent.identifiers.createIdentifier({
        displayName: state.displayNameValue,
        // @TODO - sdisalvo: Colors will need to be removed
        colors: [newColor[1], newColor[0]],
        theme: state.selectedTheme,
      });
    if (identifier) {
      const newIdentifier: IdentifierShortDetails = {
        id: identifier,
        displayName: state.displayNameValue,
        createdAtUTC: new Date().toISOString(),
        // @TODO - sdisalvo: Colors will need to be removed
        colors: [newColor[1], newColor[0]],
        theme: state.selectedTheme,
        isPending: false,
        signifyName,
      };
      dispatch(setIdentifiersCache([...identifiersData, newIdentifier]));
      dispatch(setToastMsg(ToastMsgType.IDENTIFIER_CREATED));
      resetModal && resetModal();
    }
  };

  const handleContinue = async () => {
    if (state.selectedAidType !== 0) {
      setState((prevState: IdentifierStageProps) => ({
        ...prevState,
        identifierCreationStage: 1,
      }));
    } else {
      setBlur && setBlur(true);
      setTimeout(async () => {
        await handleCreateIdentifier();
      }, CREATE_IDENTIFIER_BLUR_TIMEOUT);
    }
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        customClass={keyboardIsOpen ? "keyboard-is-open" : ""}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={() => resetModal && resetModal()}
            closeButtonLabel={`${i18n.t("createidentifier.cancel")}`}
            title={`${i18n.t("createidentifier.title")}`}
          />
        }
      >
        <div
          className={`identifier-name${
            state.displayNameValue.length !== 0 && !displayNameValueIsValid
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
                  dataTestId="identifier-aidtype-default"
                  index={0}
                  text={i18n.t("createidentifier.aidtype.default.label")}
                  clickEvent={() =>
                    setState((prevState: IdentifierStageProps) => ({
                      ...prevState,
                      selectedAidType: 0,
                    }))
                  }
                  selectedType={state.selectedAidType}
                />
              </IonCol>
              <IonCol>
                <TypeItem
                  dataTestId="identifier-aidtype-multisig"
                  index={1}
                  text={i18n.t("createidentifier.aidtype.multisig.label")}
                  clickEvent={() =>
                    setState((prevState: IdentifierStageProps) => ({
                      ...prevState,
                      selectedAidType: 1,
                    }))
                  }
                  selectedType={state.selectedAidType}
                />
              </IonCol>
              <IonCol>
                <TypeItem
                  dataTestId="identifier-aidtype-delegated"
                  index={2}
                  text={i18n.t("createidentifier.aidtype.delegated.label")}
                  clickEvent={() =>
                    setState((prevState: IdentifierStageProps) => ({
                      ...prevState,
                      selectedAidType: 2,
                    }))
                  }
                  selectedType={state.selectedAidType}
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
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
          />
        </div>
      </ScrollablePageLayout>
      <PageFooter
        pageId={componentId}
        customClass={keyboardIsOpen ? "ion-hide" : ""}
        primaryButtonText={`${i18n.t("createidentifier.confirmbutton")}`}
        primaryButtonAction={async () => handleContinue()}
        primaryButtonDisabled={!displayNameValueIsValid}
      />
    </>
  );
};

export { IdentifierStage0 };
