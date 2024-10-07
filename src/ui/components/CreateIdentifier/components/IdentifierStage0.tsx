import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Agent } from "../../../../core/agent/agent";
import {
  CreateIdentifierInputs,
  IdentifierShortDetails,
} from "../../../../core/agent/services/identifier.types";
import { i18n } from "../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  getIdentifiersCache,
  setIdentifiersCache,
  setMultiSigGroupCache,
} from "../../../../store/reducers/identifiersCache";
import { MultiSigGroup } from "../../../../store/reducers/identifiersCache/identifiersCache.types";
import {
  setCurrentOperation,
  setToastMsg,
} from "../../../../store/reducers/stateCache";
import { OperationType, ToastMsgType } from "../../../globals/types";
import { CustomInput } from "../../CustomInput";
import { ErrorMessage } from "../../ErrorMessage";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";
import { PageFooter } from "../../PageFooter";
import { PageHeader } from "../../PageHeader";
import {
  IdentifierStageProps,
  IdentifierStageStateProps,
} from "../CreateIdentifier.types";
import { IdentifierColorSelector } from "./IdentifierColorSelector";
import { IdentifierThemeSelector } from "./IdentifierThemeSelector";
import { TypeItem } from "./TypeItem";
import { createThemeValue } from "../../../utils/theme";
import { IADTypeInfoModal } from "./AIDTypeInfoModal";
import { showError } from "../../../utils/error";

const IdentifierStage0 = ({
  state,
  setState,
  componentId,
  setBlur,
  resetModal,
  multiSigGroup,
  isModalOpen,
}: IdentifierStageProps) => {
  const dispatch = useAppDispatch();
  const identifiersData = useAppSelector(getIdentifiersCache);
  const CREATE_IDENTIFIER_BLUR_TIMEOUT = 250;
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);
  const [openAIDInfo, setOpenAIDInfo] = useState(false);
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
    setState((prevState: IdentifierStageStateProps) => ({
      ...prevState,
      displayNameValue: displayNameValue,
    }));
  }, [displayNameValue, setState]);

  useEffect(() => {
    setState((prevState: IdentifierStageStateProps) => ({
      ...prevState,
      selectedTheme: selectedTheme,
    }));
  }, [selectedTheme, setState]);

  const handleCreateIdentifier = async () => {
    const selectedTheme = createThemeValue(state.color, state.selectedTheme);

    const metadata: CreateIdentifierInputs = {
      displayName: state.displayNameValue,
      theme: selectedTheme,
    };
    let groupMetadata;
    if (multiSigGroup) {
      groupMetadata = {
        groupId: multiSigGroup.groupId,
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
    try {
      const { identifier, isPending } =
        await Agent.agent.identifiers.createIdentifier(metadata);
      if (identifier) {
        const newIdentifier: IdentifierShortDetails = {
          id: identifier,
          displayName: state.displayNameValue,
          createdAtUTC: new Date().toISOString(),
          theme: selectedTheme,
          isPending: isPending,
        };
        if (groupMetadata) {
          newIdentifier.groupMetadata = groupMetadata;
        }
        dispatch(setIdentifiersCache([...identifiersData, newIdentifier]));
        if (multiSigGroup) {
          const connections =
            await Agent.agent.connections.getMultisigLinkedContacts(
              multiSigGroup.groupId
            );
          const newMultiSigGroup: MultiSigGroup = {
            groupId: multiSigGroup.groupId,
            connections,
          };
          dispatch(setMultiSigGroupCache(newMultiSigGroup));
        }
        if (state.selectedAidType !== 0 || multiSigGroup) {
          setState((prevState: IdentifierStageProps) => ({
            ...prevState,
            ourIdentifier: identifier,
            identifierCreationStage: 1,
            newIdentifier,
          }));
          multiSigGroup && dispatch(setCurrentOperation(OperationType.IDLE));
        }
      }
    } catch (e) {
      showError("Unable to create identifier", e, dispatch);
    }
  };

  const handleContinue = async () => {
    setBlur && setBlur(true);
    setTimeout(async () => {
      await handleCreateIdentifier();
      if (state.selectedAidType !== 0 || multiSigGroup) {
        setBlur && setBlur(false);
      } else {
        resetModal && resetModal();
      }
      dispatch(
        setToastMsg(
          state.selectedAidType === 1 || multiSigGroup
            ? ToastMsgType.MULTI_SIGN_IDENTIFIER_CREATED
            : state.selectedAidType === 2
              ? ToastMsgType.DELEGATED_IDENTIFIER_CREATED
              : ToastMsgType.IDENTIFIER_CREATED
        )
      );
    }, CREATE_IDENTIFIER_BLUR_TIMEOUT);
  };

  const handleCancel = async () => {
    multiSigGroup && dispatch(setCurrentOperation(OperationType.IDLE));
    resetModal && resetModal();
  };

  const openAIDTypeInfoModal = () => {
    setOpenAIDInfo(true);
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        activeStatus={isModalOpen}
        customClass={keyboardIsOpen ? "keyboard-is-open" : ""}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={handleCancel}
            closeButtonLabel={`${i18n.t(
              multiSigGroup
                ? "createidentifier.back"
                : "createidentifier.cancel"
            )}`}
            title={`${i18n.t(
              multiSigGroup
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
        {!multiSigGroup && (
          <div className="aid-type">
            <div className="type-input-title">
              {`${i18n.t("createidentifier.aidtype.title")}`}
              <IonIcon
                data-testid="type-input-title"
                onClick={openAIDTypeInfoModal}
                slot="icon-only"
                src={informationCircleOutline}
              />
            </div>
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
                  <div
                    data-testid="identifier-delegated-container"
                    onClick={openAIDTypeInfoModal}
                  >
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
                      disabled
                      selectedType={state.selectedAidType}
                    />
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        )}
        <div className="identifier-theme">
          <div className="theme-input-title">{`${i18n.t(
            "createidentifier.color.title"
          )}`}</div>
          <IdentifierColorSelector
            value={state.color}
            onColorChange={(color) => {
              setState((prevState: IdentifierStageStateProps) => ({
                ...prevState,
                color,
              }));
            }}
          />
        </div>
        <div className="identifier-theme">
          <div className="theme-input-title">{`${i18n.t(
            "createidentifier.theme.title"
          )}`}</div>
          <IdentifierThemeSelector
            color={state.color}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
          />
        </div>
      </ScrollablePageLayout>
      <PageFooter
        pageId={componentId}
        customClass={keyboardIsOpen ? "ion-hide" : ""}
        primaryButtonText={`${i18n.t(
          multiSigGroup
            ? "createidentifier.receive.confirmbutton"
            : "createidentifier.add.confirmbutton"
        )}`}
        primaryButtonAction={handleContinue}
        primaryButtonDisabled={!displayNameValueIsValid}
      />
      <IADTypeInfoModal
        isOpen={openAIDInfo}
        setOpen={setOpenAIDInfo}
      />
    </>
  );
};

export { IdentifierStage0 };
