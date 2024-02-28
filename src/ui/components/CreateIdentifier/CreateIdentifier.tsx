import { IonModal, IonSpinner } from "@ionic/react";
import { useEffect, useState } from "react";
import { CreateIdentifierProps } from "./CreateIdentifier.types";
import "./CreateIdentifier.scss";
import { IdentifierStage0 } from "./components/IdentifierStage0";
import { IdentifierStage1 } from "./components/IdentifierStage1";
import { IdentifierStage2 } from "./components/IdentifierStage2";
import { IdentifierStage3 } from "./components/IdentifierStage3";

const CreateIdentifier = ({
  modalIsOpen,
  setModalIsOpen,
}: CreateIdentifierProps) => {
  const componentId = "create-identifier-modal";
  const initialState = {
    multiSigStage: 0,
    displayNameValue: "",
    selectedIdentifierType: 0,
    selectedAidType: 0,
    selectedTheme: 0,
    threshold: 1,
    sortedConnections: [],
    selectedConnections: [],
  };
  const [state, setState] = useState(initialState);
  const [blur, setBlur] = useState(false);

  useEffect(() => {
    blur
      ? document?.querySelector("ion-router-outlet")?.classList.add("blur")
      : document?.querySelector("ion-router-outlet")?.classList.remove("blur");
  }, [blur]);

  const resetModal = () => {
    setBlur(false);
    setModalIsOpen(false);
    setState((prevState) => ({
      ...prevState,
      initialState,
    }));
  };

  return (
    <>
      <IonModal
        isOpen={modalIsOpen}
        className={`${componentId} full-page-modal ${blur ? "blur" : ""}`}
        data-testid={componentId}
        onDidDismiss={() => resetModal()}
      >
        {blur && (
          <div
            className="spinner-container"
            data-testid="spinner-container"
          >
            <IonSpinner name="circular" />
          </div>
        )}
        {state.multiSigStage === 0 && (
          <IdentifierStage0
            state={state}
            setState={setState}
            componentId={componentId}
            resetModal={resetModal}
            setBlur={setBlur}
          />
        )}
        {state.multiSigStage === 1 && (
          <IdentifierStage1
            state={state}
            setState={setState}
            componentId={componentId}
            resetModal={resetModal}
          />
        )}
        {state.multiSigStage === 2 && (
          <IdentifierStage2
            state={state}
            setState={setState}
            componentId={componentId}
            resetModal={resetModal}
          />
        )}
        {state.multiSigStage === 3 && (
          <IdentifierStage3
            state={state}
            setState={setState}
            componentId={componentId}
            resetModal={resetModal}
          />
        )}
      </IonModal>
    </>
  );
};

export { CreateIdentifier };
