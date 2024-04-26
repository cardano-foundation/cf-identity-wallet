import { IonModal, IonSpinner } from "@ionic/react";
import { useEffect, useState } from "react";
import { CreateIdentifierProps } from "./CreateIdentifier.types";
import "./CreateIdentifier.scss";
import { IdentifierStage0 } from "./components/IdentifierStage0";
import { IdentifierStage1 } from "./components/IdentifierStage1";
import { IdentifierStage2 } from "./components/IdentifierStage2";
import { IdentifierStage3 } from "./components/IdentifierStage3";
import { IdentifierStage4 } from "./components/IdentifierStage4";
import { IdentifierReceiveInvitation } from "./components/IdentifierReceiveInvitation";

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
  groupId,
  setGroupId,
}: CreateIdentifierProps) => {
  const componentId = "create-identifier-modal";
  const initialState = {
    identifierCreationStage: 0,
    displayNameValue: "",
    selectedAidType: 0,
    selectedTheme: 0,
    threshold: 1,
    selectedConnections: [],
    initialised: false,
    newIdentifier: {
      id: "",
      displayName: "",
      createdAtUTC: "",
      theme: 0,
      isPending: false,
      signifyName: "",
    },
  };
  const [state, setState] = useState(initialState);
  const [blur, setBlur] = useState(false);

  useEffect(() => {
    if (blur) {
      document?.querySelector("ion-router-outlet")?.classList.add("blur");
    } else {
      document?.querySelector("ion-router-outlet")?.classList.remove("blur");
    }
  }, [blur]);

  const resetModal = () => {
    setBlur(false);
    setModalIsOpen(false);
    setState(initialState);
    setResumeMultiSig && setResumeMultiSig(null);
    setGroupId && setGroupId("");
  };

  const handleResetInvitationReceived = () => {
    resetModal();
    setInvitationReceived && setInvitationReceived(false);
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
          groupId={groupId}
          setGroupId={setGroupId}
        />
      )}
    </IonModal>
  );
};

export { CreateIdentifier };
