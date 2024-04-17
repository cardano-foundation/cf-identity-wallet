import { useEffect, useState } from "react";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { useAppSelector } from "../../../../store/hooks";
import { getStateCache } from "../../../../store/reducers/stateCache";
import { Agent } from "../../../../core/agent/agent";
import { IdentifierStage1BodyInit } from "./IdentifierStage1BodyInit";
import { IdentifierStage1BodyResume } from "./IdentifierStage1BodyResume";

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

  const handleScanButton = () => {
    // TODO: scan button functionality
  };

  return (
    <>
      {!resumeMultiSig?.signifyName.length ? (
        <IdentifierStage1BodyInit
          componentId={componentId}
          handleDone={handleDone}
          oobi={oobi}
          handleScanButton={handleScanButton}
        />
      ) : (
        <IdentifierStage1BodyResume
          componentId={componentId}
          handleDone={handleDone}
          oobi={oobi}
          handleScanButton={handleScanButton}
        />
      )}
    </>
  );
};

export { IdentifierStage1 };
