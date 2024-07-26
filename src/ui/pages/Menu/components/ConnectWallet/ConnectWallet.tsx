import { IonCheckbox, IonChip, IonIcon, IonItemOption } from "@ionic/react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import { hourglassOutline } from "ionicons/icons";
import { i18n } from "../../../../../i18n";
import { TabsRoutePath } from "../../../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import { getIdentifiersCache } from "../../../../../store/reducers/identifiersCache";
import {
  getCurrentOperation,
  getStateCache,
  getToastMsg,
  setCurrentOperation,
  setToastMsg,
} from "../../../../../store/reducers/stateCache";
import {
  ConnectionData,
  getConnectedWallet,
  getPendingConnection,
  getWalletConnectionsCache,
  setConnectedWallet,
  setPendingConnection,
  setWalletConnectionsCache,
} from "../../../../../store/reducers/walletConnectionsCache";
import { Alert } from "../../../../components/Alert";
import { CardItem, CardList } from "../../../../components/CardList";
import { CardsPlaceholder } from "../../../../components/CardsPlaceholder";
import { VerifyPasscode } from "../../../../components/VerifyPasscode";
import { VerifyPassword } from "../../../../components/VerifyPassword";
import { OperationType, ToastMsgType } from "../../../../globals/types";
import { ConfirmConnectModal } from "../ConfirmConnectModal";
import "./ConnectWallet.scss";
import {
  ActionInfo,
  ActionType,
  ConnectWalletOptionRef,
} from "./ConnectWallet.types";
import { Agent } from "../../../../../core/agent/agent";
import { PeerConnection } from "../../../../../core/cardano/walletConnect/peerConnection";
import { ANIMATION_DURATION } from "../../../../components/SideSlider/SideSlider.types";

const ConnectWallet = forwardRef<ConnectWalletOptionRef, object>(
  (props, ref) => {
    const history = useHistory();
    const dispatch = useAppDispatch();

    const toastMsg = useAppSelector(getToastMsg);
    const pendingConnection = useAppSelector(getPendingConnection);
    const defaultIdentifierCache = useAppSelector(getIdentifiersCache).filter(
      (identifier) => !identifier.multisigManageAid && !identifier.groupMetadata
    );
    const connections = useAppSelector(getWalletConnectionsCache);
    const connectedWallet = useAppSelector(getConnectedWallet);
    const currentOperation = useAppSelector(getCurrentOperation);
    const pageId = "connect-wallet-placeholder";
    const stateCache = useAppSelector(getStateCache);
    const [actionInfo, setActionInfo] = useState<ActionInfo>({
      type: ActionType.None,
    });

    const [openExistConenctedWalletAlert, setOpenExistConnectedWalletAlert] =
      useState<boolean>(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [openConfirmConnectModal, setOpenConfirmConnectModal] =
      useState<boolean>(false);
    const [openIdentifierMissingAlert, setOpenIdentifierMissingAlert] =
      useState<boolean>(false);

    const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
    const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);

    const displayConnection = useMemo((): CardItem<ConnectionData>[] => {
      return connections.map((connection) => {
        const dAppName = connection.name ? connection.name : connection.id;

        return {
          id: connection.id,
          title: dAppName,
          url: connection.url,
          subtitle: connection.url,
          image: connection.iconB64,
          data: connection,
        };
      });
    }, [connections]);

    useImperativeHandle(ref, () => ({
      openConnectWallet: handleScanQR,
    }));

    const handleOpenVerify = () => {
      if (
        !stateCache?.authentication.passwordIsSkipped &&
        stateCache?.authentication.passwordIsSet
      ) {
        setVerifyPasswordIsOpen(true);
      } else {
        setVerifyPasscodeIsOpen(true);
      }
    };

    const handleOpenDeleteAlert = (data: ConnectionData) => {
      setActionInfo({
        type: ActionType.Delete,
        data,
      });

      setOpenDeleteAlert(true);
    };

    const handleOpenConfirmConnectModal = (data: ConnectionData) => {
      setActionInfo({
        type: ActionType.Connect,
        data,
      });
      setOpenConfirmConnectModal(true);
    };

    const closeDeleteAlert = () => {
      setActionInfo({
        type: ActionType.None,
      });

      setOpenDeleteAlert(false);
    };

    const verifyPassCodeBeforeDelete = () => {
      setOpenDeleteAlert(false);
      handleOpenVerify();
    };

    const handleDeleteConnection = async (data: ConnectionData) => {
      setActionInfo({
        type: ActionType.None,
      });
      if (connectedWallet) {
        PeerConnection.peerConnection.disconnectDApp(connectedWallet?.id);
        dispatch(setConnectedWallet(null));
      }
      await Agent.agent.peerConnectionMetadataStorage.deletePeerConnectionMetadataRecord(
        data.id
      );

      dispatch(
        setWalletConnectionsCache(
          connections.filter((connection) => connection.id !== data.id)
        )
      );

      if (data.id === pendingConnection?.id) {
        dispatch(setPendingConnection(null));
      }

      dispatch(setToastMsg(ToastMsgType.WALLET_CONNECTION_DELETED));
    };

    const disconnectWallet = () => {
      if (!connectedWallet) return;
      PeerConnection.peerConnection.disconnectDApp(connectedWallet?.id);
      dispatch(setConnectedWallet(null));
    };

    const toggleConnected = () => {
      if (defaultIdentifierCache.length === 0) {
        setOpenIdentifierMissingAlert(true);
        return;
      }

      if (!actionInfo.data) return;
      const isConnectedItem = actionInfo.data.id === connectedWallet?.id;
      if (isConnectedItem) {
        disconnectWallet();
        return;
      }

      if (connectedWallet) {
        setOpenExistConnectedWalletAlert(true);
        return;
      }

      dispatch(setPendingConnection(actionInfo.data));
    };

    const handleAfterVerify = () => {
      setVerifyPasscodeIsOpen(false);
      setVerifyPasswordIsOpen(false);

      if (actionInfo.type === ActionType.Delete && actionInfo.data) {
        handleDeleteConnection(actionInfo.data);
      }
    };

    const handleScanQR = () => {
      if (defaultIdentifierCache.length === 0) {
        setOpenIdentifierMissingAlert(true);
        return;
      }

      if (connectedWallet) {
        setActionInfo({
          type: ActionType.Add,
        });
        setOpenExistConnectedWalletAlert(true);
        return;
      }

      dispatch(setCurrentOperation(OperationType.SCAN_WALLET_CONNECTION));
    };

    const handleCloseExistConnectedWallet = () => {
      setOpenExistConnectedWalletAlert(false);
      setActionInfo({
        type: ActionType.None,
      });
    };

    const handleContinueScanQRWithExistedConnection = () => {
      disconnectWallet();
      if (actionInfo.type === ActionType.Connect && actionInfo.data) {
        dispatch(setPendingConnection(actionInfo.data));
      } else {
        dispatch(setCurrentOperation(OperationType.SCAN_WALLET_CONNECTION));
      }
      handleCloseExistConnectedWallet();
    };

    const closeIdentifierMissingAlert = () => {
      setOpenIdentifierMissingAlert(false);
    };

    const handleNavToCreateKeri = () => {
      setOpenIdentifierMissingAlert(false);
      dispatch(
        setCurrentOperation(OperationType.CREATE_IDENTIFIER_CONNECT_WALLET)
      );
      history.push(TabsRoutePath.IDENTIFIERS);
    };

    // NOTE: Reload connection data after connect success
    useEffect(() => {
      if (
        toastMsg === ToastMsgType.CONNECT_WALLET_SUCCESS &&
        !pendingConnection &&
        connectedWallet &&
        openConfirmConnectModal
      ) {
        setActionInfo({
          type: ActionType.Connect,
          data: connectedWallet,
        });
      }
    }, [connectedWallet, toastMsg, pendingConnection]);

    useEffect(() => {
      if (!pendingConnection) return;

      if (
        OperationType.OPEN_WALLET_CONNECTION_DETAIL === currentOperation &&
        pendingConnection
      ) {
        dispatch(setCurrentOperation(OperationType.IDLE));
        setTimeout(() => {
          handleOpenConfirmConnectModal(pendingConnection);
        }, ANIMATION_DURATION);
      }
    }, [currentOperation, pendingConnection]);

    return (
      <>
        <div className="connect-wallet-container">
          {connections.length > 0 ? (
            <>
              <h2 className="connect-wallet-title">
                {i18n.t("menu.tab.items.connectwallet.connectionhistory.title")}
              </h2>
              <CardList
                data={displayConnection}
                onCardClick={handleOpenConfirmConnectModal}
                onRenderCardAction={(data) => {
                  return (
                    <IonItemOption
                      color="danger"
                      data-testid={`delete-connections-${data.id}`}
                      onClick={() => {
                        handleOpenDeleteAlert(data);
                      }}
                    >
                      {i18n.t(
                        "menu.tab.items.connectwallet.connectionhistory.action.delete"
                      )}
                    </IonItemOption>
                  );
                }}
                onRenderEndSlot={(data) => {
                  if (data.id === pendingConnection?.id) {
                    return (
                      <IonChip className="connection-pending">
                        <IonIcon
                          icon={hourglassOutline}
                          color="primary"
                        ></IonIcon>
                      </IonChip>
                    );
                  }

                  if (data.id !== connectedWallet?.id) return null;

                  return (
                    <IonCheckbox
                      checked={true}
                      aria-label=""
                      className="checkbox"
                      data-testid="connected-wallet-check-mark"
                    />
                  );
                }}
              />
            </>
          ) : (
            <div className="placeholder-container">
              <CardsPlaceholder
                buttonLabel={i18n.t("menu.tab.items.connectwallet.connectbtn")}
                buttonAction={handleScanQR}
                testId={pageId}
              />
            </div>
          )}
        </div>
        <ConfirmConnectModal
          isConnectModal={actionInfo.data?.id !== connectedWallet?.id}
          openModal={openConfirmConnectModal}
          closeModal={() => setOpenConfirmConnectModal(false)}
          onConfirm={toggleConnected}
          connectionData={actionInfo.data}
          onDeleteConnection={handleOpenDeleteAlert}
        />
        <Alert
          isOpen={openDeleteAlert}
          setIsOpen={setOpenDeleteAlert}
          dataTestId="alert-delete"
          headerText={i18n.t(
            "menu.tab.items.connectwallet.connectionhistory.deletealert.message"
          )}
          confirmButtonText={`${i18n.t(
            "menu.tab.items.connectwallet.connectionhistory.deletealert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "menu.tab.items.connectwallet.connectionhistory.deletealert.cancel"
          )}`}
          actionConfirm={verifyPassCodeBeforeDelete}
          actionCancel={closeDeleteAlert}
          actionDismiss={closeDeleteAlert}
        />
        <Alert
          isOpen={openExistConenctedWalletAlert}
          setIsOpen={setOpenExistConnectedWalletAlert}
          dataTestId="alert-disconnect-wallet"
          headerText={i18n.t(
            "menu.tab.items.connectwallet.disconnectbeforecreatealert.message"
          )}
          confirmButtonText={`${i18n.t(
            "menu.tab.items.connectwallet.disconnectbeforecreatealert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "menu.tab.items.connectwallet.disconnectbeforecreatealert.cancel"
          )}`}
          actionConfirm={handleContinueScanQRWithExistedConnection}
          actionCancel={handleCloseExistConnectedWallet}
          actionDismiss={handleCloseExistConnectedWallet}
        />
        <Alert
          isOpen={openIdentifierMissingAlert}
          setIsOpen={setOpenIdentifierMissingAlert}
          dataTestId="alert-create-keri"
          headerText={i18n.t(
            "menu.tab.items.connectwallet.connectionhistory.missingidentifieralert.message"
          )}
          confirmButtonText={`${i18n.t(
            "menu.tab.items.connectwallet.connectionhistory.missingidentifieralert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "menu.tab.items.connectwallet.connectionhistory.missingidentifieralert.cancel"
          )}`}
          actionConfirm={handleNavToCreateKeri}
          actionCancel={closeIdentifierMissingAlert}
          actionDismiss={closeIdentifierMissingAlert}
        />
        <VerifyPassword
          isOpen={verifyPasswordIsOpen}
          setIsOpen={setVerifyPasswordIsOpen}
          onVerify={handleAfterVerify}
        />
        <VerifyPasscode
          isOpen={verifyPasscodeIsOpen}
          setIsOpen={setVerifyPasscodeIsOpen}
          onVerify={handleAfterVerify}
        />
      </>
    );
  }
);

export { ConnectWallet };
