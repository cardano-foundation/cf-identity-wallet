import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import { IonGrid, IonRow, IonCol } from "@ionic/react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { i18n } from "../../../../i18n";
import { CustomInput } from "../../CustomInput";
import { ErrorMessage } from "../../ErrorMessage";
import { PageFooter } from "../../PageFooter";
import { PageHeader } from "../../PageHeader";
import { TypeItem } from "./TypeItem";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  CreateIdentifierInputs,
  IdentifierShortDetails,
} from "../../../../core/agent/services/identifierService.types";
import { Agent } from "../../../../core/agent/agent";
import {
  getIdentifiersCache,
  getMultiSigGroupsCache,
  setIdentifiersCache,
  setMultiSigGroupsCache,
} from "../../../../store/reducers/identifiersCache";
import {
  setCurrentOperation,
  setToastMsg,
} from "../../../../store/reducers/stateCache";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { OperationType, ToastMsgType } from "../../../globals/types";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";
import { IdentifierThemeSelector } from "./IdentifierThemeSelector";
import { MultiSigGroup } from "../../../../store/reducers/identifiersCache/identifiersCache.types";

const IdentifierStage0 = ({
  state,
  setState,
  componentId,
  setBlur,
  resetModal,
  groupId,
}: IdentifierStageProps) => {
  const dispatch = useAppDispatch();
  const identifiersData = useAppSelector(getIdentifiersCache);
  const multiSigGroupCache = useAppSelector(getMultiSigGroupsCache);
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
    const metadata: CreateIdentifierInputs = {
      displayName: state.displayNameValue,
      theme: state.selectedTheme,
    };
    let groupMetadata;
    if (groupId) {
      groupMetadata = {
        groupId,
        groupInitiator: false,
        groupCreated: false,
      };
    } else if (state.selectedAidType == 1) {
      groupMetadata = {
        groupId: uuidv4(),
        groupInitiator: true,
        groupCreated: false,
      };
    }
    metadata.groupMetadata = groupMetadata;
    const { identifier, signifyName } =
      await Agent.agent.identifiers.createIdentifier(metadata);
    if (identifier) {
      const newIdentifier: IdentifierShortDetails = {
        id: identifier,
        displayName: state.displayNameValue,
        createdAtUTC: new Date().toISOString(),
        theme: state.selectedTheme,
        isPending: false,
        signifyName,
      };
      if (groupMetadata) {
        newIdentifier.groupMetadata = groupMetadata;
      }
      dispatch(setIdentifiersCache([...identifiersData, newIdentifier]));
      if (groupId) {
        const connections =
          await Agent.agent.connections.getMultisigLinkedContacts(groupId);
        const newMultiSigGroup: MultiSigGroup = {
          groupId,
          connections,
        };
        dispatch(
          setMultiSigGroupsCache([...multiSigGroupCache, newMultiSigGroup])
        );
      }
      if (state.selectedAidType !== 0 || groupId) {
        setState((prevState: IdentifierStageProps) => ({
          ...prevState,
          identifierCreationStage: 1,
          newIdentifier,
        }));
        groupId && dispatch(setCurrentOperation(OperationType.IDLE));
      }
    }
  };

  const handleContinue = async () => {
    setBlur && setBlur(true);
    setTimeout(async () => {
      await handleCreateIdentifier();
      if (state.selectedAidType !== 0 || groupId) {
        setBlur && setBlur(false);
      } else {
        resetModal && resetModal();
      }
      dispatch(setToastMsg(ToastMsgType.IDENTIFIER_CREATED));
    }, CREATE_IDENTIFIER_BLUR_TIMEOUT);
  };

  const handleCancel = async () => {
    groupId && dispatch(setCurrentOperation(OperationType.IDLE));
    resetModal && resetModal();
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        customClass={keyboardIsOpen ? "keyboard-is-open" : ""}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={() => handleCancel()}
            closeButtonLabel={`${i18n.t(
              groupId ? "createidentifier.back" : "createidentifier.cancel"
            )}`}
            title={`${i18n.t(
              groupId
                ? "createidentifier.receive.title"
                : "createidentifier.add.title"
            )}`}
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
        {!groupId && (
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
        )}
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
        primaryButtonText={`${i18n.t(
          groupId
            ? "createidentifier.receive.confirmbutton"
            : "createidentifier.add.confirmbutton"
        )}`}
        primaryButtonAction={async () => handleContinue()}
        primaryButtonDisabled={!displayNameValueIsValid}
      />
    </>
  );
};

export { IdentifierStage0 };
