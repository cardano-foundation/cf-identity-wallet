import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Agent } from "../../../../core/agent/agent";
import { ConnectionShortDetails } from "../../../../core/agent/agent.types";
import { i18n } from "../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  getMultiSigGroupCache,
  removeIdentifierCache,
  setScanGroupId
} from "../../../../store/reducers/identifiersCache";
import {
  getCurrentOperation,
  getStateCache,
  setCurrentOperation,
  setToastMsg,
} from "../../../../store/reducers/stateCache";
import { OperationType, ToastMsgType } from "../../../globals/types";
import { useOnlineStatusEffect } from "../../../hooks";
import { showError } from "../../../utils/error";
import { getTheme } from "../../../utils/theme";
import { Alert } from "../../Alert";
import { TabsRoutePath } from "../../navigation/TabsMenu";
import { Verification } from "../../Verification";
import { IdentifierStageProps, Stage } from "../CreateGroupIdentifier.types";
import { SetupConnectionBodyInit } from "./SetupConnectionBodyInit";
import { SetupConnectionBodyResume } from "./SetupConnectionBodyResume";

const SetupConnections = ({
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
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [alertDeleteOpen, setAlertDeleteOpen] = useState(false);
  const [scannedConnections, setScannedConnections] = useState<
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
      showError("Unable to fetch Oobi", e, dispatch);
    }
  }, [identifierId, userName, groupId, dispatch]);

  useOnlineStatusEffect(fetchOobi);

  const handleInitiateMultiSig = useCallback(() => {
    const theme = getTheme(resumeMultiSig?.theme || 0);

    dispatch(setCurrentOperation(OperationType.IDLE));
    setState((prevState) => ({
      ...prevState,
      scannedConections: scannedConnections,
      displayNameValue: state.displayNameValue || resumeMultiSig?.displayName || "",
      ourIdentifier: state.ourIdentifier || resumeMultiSig?.id || "",
      identifierCreationStage: Stage.Members,
      color: theme.color,
      selectedTheme: theme.layout,
    }));
  }, [dispatch, resumeMultiSig?.displayName, resumeMultiSig?.id, resumeMultiSig?.theme, scannedConnections, setState, state.displayNameValue, state.ourIdentifier]);

  useEffect(() => {
    if(currentOperation === OperationType.MULTI_SIG_INITIATOR_INIT)
      handleInitiateMultiSig();
  }, [currentOperation, handleInitiateMultiSig])

  useEffect(() => {
    if (groupId) {
      const updateConnections = async () => {
        const connections = multiSigGroupCache?.connections;
        connections && setScannedConnections(connections);
      };
      updateConnections();
    }
  }, [groupMetadata, groupId, multiSigGroupCache]);

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
    scannedConnections.length >= 1 ? handleInitiateScan() : setAlertIsOpen(true);
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

  const openDeleteConfirm = () => {
    setAlertDeleteOpen(true);
  };

  const handleDelete = async () => {
    const identifierId = state.newIdentifier.id || resumeMultiSig?.id;
    if (!identifierId) return;

    try {
      setVerifyIsOpen(false);

      await Agent.agent.identifiers.markIdentifierPendingDelete(identifierId);

      dispatch(setToastMsg(ToastMsgType.IDENTIFIER_DELETED));
      dispatch(removeIdentifierCache(identifierId));
      handleDone();
    } catch (e) {
      showError(
        "Unable to delete identifier",
        e,
        dispatch,
        ToastMsgType.DELETE_IDENTIFIER_FAIL
      );
    }
  };

  const handleAuthentication = () => {
    setVerifyIsOpen(true);
  };

  return (
    <>
      {resumeMultiSig || initiated || scannedConnections?.length ? (
        <SetupConnectionBodyResume
          componentId={componentId}
          handleDone={handleDone}
          handleInitiateMultiSig={handleInitiateMultiSig}
          oobi={oobi}
          groupMetadata={groupMetadata}
          handleScanButton={handleScanButton}
          scannedConections={scannedConnections}
          handleDelete={openDeleteConfirm}
        />
      ) : (
        <SetupConnectionBodyInit
          componentId={componentId}
          handleDone={handleDone}
          oobi={oobi}
          groupMetadata={groupMetadata}
          handleScanButton={handleScanButton}
          scannedConections={scannedConnections}
          handleDelete={openDeleteConfirm}
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
      <Alert
        isOpen={alertDeleteOpen}
        setIsOpen={setAlertDeleteOpen}
        dataTestId="alert-confirm-identifier-delete-details"
        headerText={i18n.t("tabs.identifiers.details.delete.alert.title")}
        confirmButtonText={`${i18n.t(
          "tabs.identifiers.details.delete.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "tabs.identifiers.details.delete.alert.cancel"
        )}`}
        actionConfirm={() => handleAuthentication()}
        actionCancel={() => setAlertDeleteOpen(false)}
        actionDismiss={() => setAlertDeleteOpen(false)}
      />
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={handleDelete}
      />
    </>
  );
};

export { SetupConnections };
