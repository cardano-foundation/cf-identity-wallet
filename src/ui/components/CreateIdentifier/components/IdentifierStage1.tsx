import { useEffect, useState } from "react";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { useAppSelector } from "../../../../store/hooks";
import { getStateCache } from "../../../../store/reducers/stateCache";
import { Agent } from "../../../../core/agent/agent";
import { IdentifierStage1BodyInit } from "./IdentifierStage1BodyInit";
import { IdentifierStage1BodyResume } from "./IdentifierStage1BodyResume";
import { Alert } from "../../Alert";
import { i18n } from "../../../../i18n";

const IdentifierStage1 = ({
  state,
  setState,
  componentId,
  resetModal,
  resumeMultiSig,
}: IdentifierStageProps) => {
  const stateCache = useAppSelector(getStateCache);
  const userName = stateCache.authentication.userName;
  const [oobi, setOobi] = useState("");
  const signifyName =
    resumeMultiSig?.signifyName || state.newIdentifier.signifyName;
  const groupId =
    resumeMultiSig?.groupMetadata?.groupId ||
    state.newIdentifier.groupMetadata?.groupId;
  const groupInitiator =
    resumeMultiSig?.groupMetadata?.groupInitiator ||
    state.newIdentifier.groupMetadata?.groupInitiator;
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  useEffect(() => {
    async function fetchOobi() {
      try {
        const oobiValue = await Agent.agent.connections.getKeriOobi(
          signifyName,
          userName,
          groupId
        );
        if (oobiValue) {
          setOobi(oobiValue);
        }
      } catch (e) {
        // @TODO - Error handling.
      }
    }

    fetchOobi();
  }, [groupId, signifyName, userName]);

  const handleDone = () => {
    resetModal && resetModal();
  };

  const handleInitiateScan = () => {
    // TODO: scan button functionality
  };

  return (
    <>
      {!resumeMultiSig?.signifyName.length ? (
        <IdentifierStage1BodyInit
          componentId={componentId}
          handleDone={handleDone}
          oobi={oobi}
          handleScanButton={() => setAlertIsOpen(true)}
        />
      ) : (
        <IdentifierStage1BodyResume
          componentId={componentId}
          handleDone={handleDone}
          oobi={oobi}
          groupInitiator={groupInitiator}
          handleScanButton={() => setAlertIsOpen(true)}
        />
      )}
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="multisig-share-scan-alert"
        headerText={i18n.t("createidentifier.share.scanalert.text")}
        confirmButtonText={`${i18n.t(
          "createidentifier.share.scanalert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "createidentifier.share.scanalert.cancel"
        )}`}
        actionConfirm={handleInitiateScan}
        actionCancel={() => setAlertIsOpen(false)}
        actionDismiss={() => setAlertIsOpen(false)}
      />
    </>
  );
};

export { IdentifierStage1 };
