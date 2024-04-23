import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import { useEffect, useMemo, useState } from "react";
import { i18n } from "../../../../i18n";
import { CustomInput } from "../../CustomInput";
import { ErrorMessage } from "../../ErrorMessage";
import { PageFooter } from "../../PageFooter";
import { PageHeader } from "../../PageHeader";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  CreateIdentifierInputs,
  IdentifierShortDetails,
} from "../../../../core/agent/services/identifierService.types";
import { Agent } from "../../../../core/agent/agent";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../../store/reducers/identifiersCache";
import {
  getQueueIncomingRequest,
  setCurrentOperation,
  setToastMsg,
} from "../../../../store/reducers/stateCache";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { OperationType, ToastMsgType } from "../../../globals/types";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";
import { IdentifierThemeSelector } from "./IdentifierThemeSelector";

const IdentifierReceiveInvitation = ({
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
  const queueIncomingRequest = useAppSelector(getQueueIncomingRequest);
  const incomingRequest = useMemo(() => {
    return !queueIncomingRequest.isProcessing
      ? { id: "" }
      : queueIncomingRequest.queues.length > 0
        ? queueIncomingRequest.queues[0]
        : { id: "" };
  }, [queueIncomingRequest]);

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
    const groupMetadata = {
      groupId: incomingRequest.id,
      groupInitiator: false,
      groupCreated: false,
    };
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
      newIdentifier.groupMetadata = groupMetadata;
      dispatch(setIdentifiersCache([...identifiersData, newIdentifier]));
    }
  };

  const handleReset = async () => {
    dispatch(setCurrentOperation(OperationType.IDLE));
    resetModal && resetModal();
  };

  const handleContinue = async () => {
    setBlur && setBlur(true);
    setTimeout(async () => {
      await handleCreateIdentifier();
      dispatch(setToastMsg(ToastMsgType.IDENTIFIER_CREATED));
      handleReset();
    }, CREATE_IDENTIFIER_BLUR_TIMEOUT);
  };

  const handleCancel = async () => {
    // @TODO - sdisalvo: Placeholder for deleting the notification record
    // await Agent.agent.credentials.deleteKeriNotificationRecordById(
    //   incomingRequest.id
    // );
    handleReset();
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        activeStatus={true}
        customClass={keyboardIsOpen ? "keyboard-is-open" : ""}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={() => handleCancel()}
            closeButtonLabel={`${i18n.t("createidentifier.back")}`}
            title={`${i18n.t("createidentifier.receive.title")}`}
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
          "createidentifier.receive.confirmbutton"
        )}`}
        primaryButtonAction={async () => handleContinue()}
        primaryButtonDisabled={!displayNameValueIsValid}
      />
    </>
  );
};

export { IdentifierReceiveInvitation };
