import { IonCheckbox, IonChip, IonIcon, IonItemOption } from "@ionic/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
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
  getPendingDAppMeerkat,
  getWalletConnectionsCache,
  setConnectedWallet,
  setPendingDAppMeerKat,
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
import { ellipsisText } from "../../../../utils/formatters";

const ConnectWallet = forwardRef<ConnectWalletOptionRef, object>(
  (props, ref) => {
    const history = useHistory();
    const dispatch = useAppDispatch();

    const toastMsg = useAppSelector(getToastMsg);
    const pendingDAppMeerkat = useAppSelector(getPendingDAppMeerkat);
    const identifierCache = useAppSelector(getIdentifiersCache);
    const connections = useAppSelector(getWalletConnectionsCache);
    const connectedWallet = useAppSelector(getConnectedWallet);
    const currentOperation = useAppSelector(getCurrentOperation);
    const pageId = "connect-wallet-placeholder";
    const stateCache = useAppSelector(getStateCache);
    const [actionInfo, setActionInfo] = useState<ActionInfo>({
      type: ActionType.None,
    });

    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [openConfirmConnectModal, setOpenConfirmConnectModal] =
      useState<boolean>(false);
    const [openIdentifierMissingAlert, setOpenIdentifierMissingAlert] =
      useState<boolean>(false);

    const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
    const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);

    const getIdentifierName = useCallback(
      (id?: string) =>
        identifierCache.find((item) => item.id === id)?.displayName,
      [identifierCache]
    );

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
      await Agent.agent.peerConnectionMetadataStorage.deletePeerConnectionMetadataRecord(
        data.id
      );

      dispatch(
        setWalletConnectionsCache(
          connections.filter((connection) => connection.id !== data.id)
        )
      );
      dispatch(setPendingDAppMeerKat(null));
      dispatch(setToastMsg(ToastMsgType.WALLET_CONNECTION_DELETED));
    };

    const handleConnectWallet = () => {
      if (identifierCache.length === 0) {
        setOpenIdentifierMissingAlert(true);
        return;
      }
      if (!actionInfo.data) return;
      const isConnectedItem = actionInfo.data.id === connectedWallet;
      if (isConnectedItem) {
        PeerConnection.peerConnection.disconnectDApp(connectedWallet);
        dispatch(setConnectedWallet(null));
      } else {
        dispatch(setPendingDAppMeerKat(actionInfo.data.id));
      }
    };

    const handleAfterVerify = () => {
      setVerifyPasscodeIsOpen(false);
      setVerifyPasswordIsOpen(false);

      if (actionInfo.type === ActionType.Delete && actionInfo.data) {
        handleDeleteConnection(actionInfo.data);
      }
    };

    const handleScanQR = () => {
      if (identifierCache.length === 0) {
        setOpenIdentifierMissingAlert(true);
        return;
      }

      dispatch(setCurrentOperation(OperationType.SCAN_WALLET_CONNECTION));
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

    const getDisplayConnection = useCallback(
      (id?: string | null) => {
        const connectionData = connections.find((data) => data.id === id);

        if (!connectionData) return;

        const identifierName = getIdentifierName(connectionData.selectedAid);

        return {
          ...connectionData,
          identifierName,
        };
      },
      [connections, getIdentifierName]
    );

    // NOTE: Reload connection data after connect success
    useEffect(() => {
      const connectConnection = getDisplayConnection(actionInfo.data?.id);

      if (
        toastMsg === ToastMsgType.CONNECT_WALLET_SUCCESS &&
        !pendingDAppMeerkat &&
        connectConnection
      ) {
        handleOpenConfirmConnectModal(connectConnection);
      }
    }, [getDisplayConnection, toastMsg, pendingDAppMeerkat]);

    useEffect(() => {
      const pendingConnection = getDisplayConnection(pendingDAppMeerkat);

      if (!pendingConnection) return;

      if (
        OperationType.OPEN_WALLET_CONNECTION_DETAIL === currentOperation &&
        pendingDAppMeerkat
      ) {
        dispatch(setCurrentOperation(OperationType.IDLE));
        setTimeout(() => {
          handleOpenConfirmConnectModal(pendingConnection);
        }, 500);
      }
    }, [currentOperation, pendingDAppMeerkat]);

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
                  if (data.id === pendingDAppMeerkat) {
                    return (
                      <IonChip className="connection-pending">
                        <IonIcon
                          icon={hourglassOutline}
                          color="primary"
                        ></IonIcon>
                      </IonChip>
                    );
                  }

                  if (data.id !== connectedWallet) return null;

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
          isConnectModal={actionInfo.data?.id !== connectedWallet}
          openModal={openConfirmConnectModal}
          closeModal={() => setOpenConfirmConnectModal(false)}
          onConfirm={handleConnectWallet}
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
