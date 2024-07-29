import { IonModal, IonSpinner } from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import { useAppDispatch } from "../../../store/hooks";
import { setMultiSigGroupCache } from "../../../store/reducers/identifiersCache";
import { MultiSigGroup } from "../../../store/reducers/identifiersCache/identifiersCache.types";
import "./CreateIdentifier.scss";
import {
  CreateIdentifierProps,
  IdentifierStageStateProps,
} from "./CreateIdentifier.types";
import { IdentifierStage0 } from "./components/IdentifierStage0";
import { IdentifierStage1 } from "./components/IdentifierStage1";
import { IdentifierStage2 } from "./components/IdentifierStage2";
import { IdentifierStage3 } from "./components/IdentifierStage3";
import { IdentifierStage4 } from "./components/IdentifierStage4";
import { IdentifierColor } from "./components/IdentifierColorSelector";
import { useOnlineStatusEffect } from "../../hooks";

const stages = [
  IdentifierStage0,
  IdentifierStage1,
  IdentifierStage2,
  IdentifierStage3,
  IdentifierStage4,
];

const CreateIdentifier = ({
  modalIsOpen,
  setModalIsOpen,
  resumeMultiSig,
  setResumeMultiSig,
  groupId: groupIdProp,
  preventRedirect,
}: CreateIdentifierProps) => {
  const componentId = "create-identifier-modal";
  const dispatch = useAppDispatch();
  const initialState = {
    identifierCreationStage: 0,
    displayNameValue: "",
    selectedAidType: 0,
    selectedTheme: 0,
    threshold: 1,
    scannedConections: [],
    selectedConnections: [],
    ourIdentifier: "",
    newIdentifier: {
      id: "",
      displayName: "",
      createdAtUTC: "",
      theme: 0,
      isPending: false,
      signifyName: "",
    },
    color: IdentifierColor.Green,
  };
  const [state, setState] = useState<IdentifierStageStateProps>(initialState);
  const [blur, setBlur] = useState(false);
  const groupId = groupIdProp || resumeMultiSig?.groupMetadata?.groupId;
  const [multiSigGroup, setMultiSigGroup] = useState<
    MultiSigGroup | undefined
  >();

  useEffect(() => {
    if (blur) {
      document?.querySelector("ion-router-outlet")?.classList.add("blur");
    } else {
      document?.querySelector("ion-router-outlet")?.classList.remove("blur");
    }
  }, [blur]);

  const updateMultiSigGroup = useCallback(async () => {
    if (!groupId) return;

    const connections = await Agent.agent.connections.getMultisigLinkedContacts(
      groupId
    );
    const multiSigGroup: MultiSigGroup = {
      groupId,
      connections,
    };
    setMultiSigGroup(multiSigGroup);
    dispatch(setMultiSigGroupCache(multiSigGroup));
  }, [dispatch, groupId]);

  useOnlineStatusEffect(updateMultiSigGroup);

  const resetModal = () => {
    setBlur(false);
    setModalIsOpen(false);
    setState(initialState);
    setResumeMultiSig && setResumeMultiSig(null);
    setMultiSigGroup && setMultiSigGroup(undefined);
    dispatch(setMultiSigGroupCache(undefined));
  };

  const CurrentStage =
    resumeMultiSig && state.identifierCreationStage === 0
      ? IdentifierStage1
      : stages[state.identifierCreationStage];

  return (
    <IonModal
      isOpen={modalIsOpen}
      className={`${componentId} full-page-modal ${blur ? "blur" : ""}`}
      data-testid={componentId}
    >
      {blur && (
        <div
          className="spinner-container"
          data-testid="spinner-container"
        >
          <IonSpinner name="circular" />
        </div>
      )}
      {modalIsOpen && (
        <CurrentStage
          state={state}
          setState={setState}
          componentId={componentId}
          resetModal={resetModal}
          setBlur={setBlur}
          resumeMultiSig={resumeMultiSig}
          multiSigGroup={multiSigGroup}
          setMultiSigGroup={setMultiSigGroup}
          preventRedirect={preventRedirect}
        />
      )}
    </IonModal>
  );
};

export { CreateIdentifier };
