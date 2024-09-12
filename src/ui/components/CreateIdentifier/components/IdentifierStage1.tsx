import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Agent } from "../../../../core/agent/agent";
import { i18n } from "../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  getMultiSigGroupCache,
  setScanGroupId,
} from "../../../../store/reducers/identifiersCache";
import {
  getCurrentOperation,
  getStateCache,
  setCurrentOperation,
} from "../../../../store/reducers/stateCache";
import { OperationType } from "../../../globals/types";
import { useOnlineStatusEffect } from "../../../hooks";
import { ConnectionShortDetails } from "../../../pages/Connections/Connections.types";
import { getTheme } from "../../../utils/theme";
import { Alert } from "../../Alert";
import { TabsRoutePath } from "../../navigation/TabsMenu";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { IdentifierStage1BodyInit } from "./IdentifierStage1BodyInit";
import { IdentifierStage1BodyResume } from "./IdentifierStage1BodyResume";
import { showError } from "../../../utils/error";

const IdentifierStage1 = ({
  state,
  setState,
  componentId,
  resetModal,
  resumeMultiSig,
  multiSigGroup,
  preventRedirect,
  isModalOpen,
}: IdentifierStageProps) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const currentOperation = useAppSelector(getCurrentOperation);
  const multiSigGroupCache = useAppSelector(getMultiSigGroupCache);
  const userName = stateCache.authentication.userName;
  const [oobi, setOobi] = useState("");
  const identifierId = resumeMultiSig?.id || state.newIdentifier.id;
  const groupId =
    resumeMultiSig?.groupMetadata?.groupId ||
    state.newIdentifier.groupMetadata?.groupId;
  const groupMetadata =
    resumeMultiSig?.groupMetadata || state.newIdentifier.groupMetadata;
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [initiated, setInitiated] = useState(false);
  const [scannedConections, setScannedConnections] = useState<
    ConnectionShortDetails[]
  >([]);

  useEffect(() => {
    if (isModalOpen) {
      dispatch(setScanGroupId(groupId));
    } else {
      dispatch(setScanGroupId(undefined));
    }
  }, [isModalOpen, groupId, dispatch]);

  const fetchOobi = useCallback(async () => {
    try {
      const oobiValue = await Agent.agent.connections.getOobi(
        identifierId,
        userName,
        groupId
      );
      if (oobiValue) {
        setOobi(oobiValue);
      }
    } catch (e) {
      showError("Unable to fetch Oobi", e);
    }
  }, [groupId, identifierId, userName]);

  useOnlineStatusEffect(fetchOobi);

  useEffect(() => {
    if (groupId) {
      const updateConnections = async () => {
        const connections = multiSigGroupCache?.connections;
        connections && setScannedConnections(connections);
      };
      updateConnections();
    }

    currentOperation === OperationType.MULTI_SIG_INITIATOR_INIT &&
      handleInitiateMultiSig();
  }, [groupMetadata, currentOperation, groupId, multiSigGroupCache]);

  const handleDone = () => {
    resetModal && resetModal();
    dispatch(setScanGroupId(undefined));
    if (multiSigGroup?.groupId && !preventRedirect) {
      history.push({
        pathname: TabsRoutePath.IDENTIFIERS,
      });
    }
  };

  const handleScanButton = () => {
    scannedConections.length >= 1 ? handleInitiateScan() : setAlertIsOpen(true);
  };

  const handleInitiateScan = () => {
    dispatch(
      setCurrentOperation(
        groupMetadata?.groupInitiator
          ? OperationType.MULTI_SIG_INITIATOR_SCAN
          : OperationType.MULTI_SIG_RECEIVER_SCAN
      )
    );
    setInitiated(true);
  };

  const handleInitiateMultiSig = () => {
    const theme = getTheme(resumeMultiSig?.theme || 0);

    dispatch(setCurrentOperation(OperationType.IDLE));
    setState((prevState: IdentifierStageProps) => ({
      ...prevState,
      scannedConections,
      displayNameValue: state.displayNameValue || resumeMultiSig?.displayName,
      ourIdentifier: state.ourIdentifier || resumeMultiSig?.id,
      identifierCreationStage: 2,
      color: theme.color,
      selectedTheme: theme.layout,
    }));
  };

  return (
    <>
      {resumeMultiSig?.signifyName.length ||
      initiated ||
      scannedConections?.length ? (
          <IdentifierStage1BodyResume
            componentId={componentId}
            handleDone={handleDone}
            handleInitiateMultiSig={handleInitiateMultiSig}
            oobi={oobi}
            groupMetadata={groupMetadata}
            handleScanButton={handleScanButton}
            scannedConections={scannedConections}
          />
        ) : (
          <IdentifierStage1BodyInit
            componentId={componentId}
            handleDone={handleDone}
            oobi={oobi}
            groupMetadata={groupMetadata}
            handleScanButton={handleScanButton}
            scannedConections={scannedConections}
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
