import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { i18n } from "../../../../../i18n";
import { CardsPlaceholder } from "../../../../components/CardsPlaceholder";
import "./ConnectWallet.scss";
import {
  ActionInfo,
  ActionType,
  ConnectWalletOptionRef,
} from "./ConnectWallet.types";
import { CardItem, CardList } from "../../../../components/CardList";
import { IonCheckbox, IonItemOption } from "@ionic/react";
import { Alert } from "../../../../components/Alert";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getCurrentOperation,
  getStateCache,
  setCurrentOperation,
  setQueueIncomingRequest,
  setToastMsg,
} from "../../../../../store/reducers/stateCache";
import { VerifyPassword } from "../../../../components/VerifyPassword";
import { VerifyPasscode } from "../../../../components/VerifyPasscode";
import { ConfirmConnectModal } from "../ConfirmConnectModal";
import { OperationType, ToastMsgType } from "../../../../globals/types";
import {
  ConnectionData,
  getConnectedWallet,
  getWalletConnectionsCache,
  setConnectedWallet,
} from "../../../../../store/reducers/walletConnectionsCache";
import { PasteConnectionPeerIdModal } from "../PasteConnectionPeerIdModal";
import { useHistory } from "react-router-dom";
import { TabsRoutePath } from "../../../../../routes/paths";
import { getIdentifiersCache } from "../../../../../store/reducers/identifiersCache";

const ConnectWallet = forwardRef<ConnectWalletOptionRef, object>(
  (props, ref) => {
    const history = useHistory();
    const dispatch = useAppDispatch();

    const identifierCache = useAppSelector(getIdentifiersCache);
    const connections = useAppSelector(getWalletConnectionsCache);
    const connectedWallet = useAppSelector(getConnectedWallet);
    const currentOperation = useAppSelector(getCurrentOperation);
    const pageId = "connect-wallet-placeholder";
    const stateCache = useAppSelector(getStateCache);
    const actionInfo = useRef<ActionInfo>({
      type: ActionType.None,
    });

    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [openConfirmConnectModal, setOpenConfirmConnectModal] =
      useState<boolean>(false);
    const [openIdentifierMissingAlert, setOpenIdentifierMissingAlert] =
      useState<boolean>(false);
    const [openPidModal, setOpenPidModal] = useState<boolean>(false);

    const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
    const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);

    const displayConnection = useMemo((): CardItem<ConnectionData>[] => {
      return connections.map((connection) => ({
        id: connection.id,
        title: connection.name,
        subtitle: connection.owner,
        image: connection.image,
        data: connection,
      }));
    }, []);

    useEffect(() => {
      if (currentOperation === OperationType.PASTE_MKID_CONNECT_WALLET)
        setOpenPidModal(true);
    }, [currentOperation]);

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
      actionInfo.current = {
        type: ActionType.Delete,
        data,
      };

      setOpenDeleteAlert(true);
    };

    const handleOpenConfirmConnectModal = (data: ConnectionData) => {
      actionInfo.current = {
        type: ActionType.Connect,
        data,
      };
      setOpenConfirmConnectModal(true);
    };

    const closeDeleteAlert = () => {
      actionInfo.current = {
        type: ActionType.None,
      };
      setOpenDeleteAlert(false);
    };

    const verifyPassCodeBeforeDelete = () => {
      setOpenDeleteAlert(false);
      handleOpenVerify();
    };

    const handleDeleteConnection = (data: ConnectionData) => {
      actionInfo.current = {
        type: ActionType.None,
      };

      // TODO: Implement delete wallet connection logic

      dispatch(setToastMsg(ToastMsgType.WALLET_CONNECTION_DELETED));
    };

    const handleConnectWallet = () => {
      if (!actionInfo.current.data) return;

      // TODO: Implement logic connect/disconnect wallet

      const isConnectedItem =
        actionInfo.current.data.id === connectedWallet?.id;
      dispatch(
        setConnectedWallet(!isConnectedItem ? actionInfo.current.data : null)
      );

      const toast = !isConnectedItem
        ? ToastMsgType.CONNECT_WALLET_SUCCESS
        : ToastMsgType.DISCONNECT_WALLET_SUCCESS;
      dispatch(setToastMsg(toast));
    };

    const handleAfterVerify = () => {
      setVerifyPasscodeIsOpen(false);
      setVerifyPasswordIsOpen(false);

      if (
        actionInfo.current.type === ActionType.Delete &&
        actionInfo.current.data
      ) {
        handleDeleteConnection(actionInfo.current.data);
      }
    };

    const handleScanQR = () => {
      if (identifierCache.length === 0) {
        setOpenIdentifierMissingAlert(true);
        return;
      }

      dispatch(setCurrentOperation(OperationType.SCAN_WALLET_CONNECTION));
    };

    const handleSubmitPid = (pid: string) => {
      // TODO: handle connect wallet. Using fake request to start create connection flow
      dispatch(setToastMsg(ToastMsgType.PEER_ID_SUCCESS));
      dispatch(
        setQueueIncomingRequest({
          id: "1",
          type: "wallet-connect-recieved" as any,
        })
      );
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

    return (
      <>
        <div className="connect-wallet-container">
          {connections.length > 0 ? (
            <>
              <h2 className="connect-wallet-title">
                {i18n.t("connectwallet.connectionhistory.title")}
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
                      {i18n.t("connectwallet.connectionhistory.action.delete")}
                    </IonItemOption>
                  );
                }}
                onRenderEndSlot={(data) => {
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
                buttonLabel={i18n.t("connectwallet.sections.connectbtn")}
                buttonAction={handleScanQR}
                testId={pageId}
              />
            </div>
          )}
        </div>
        <ConfirmConnectModal
          isConnectModal={actionInfo.current.data?.id !== connectedWallet?.id}
          openModal={openConfirmConnectModal}
          closeModal={() => setOpenConfirmConnectModal(false)}
          onConfirm={handleConnectWallet}
          connectionData={actionInfo.current.data}
          onDeleteConnection={handleOpenDeleteAlert}
        />
        <PasteConnectionPeerIdModal
          openModal={openPidModal}
          onCloseModal={() => setOpenPidModal(false)}
          onConfirm={handleSubmitPid}
          onScanQR={handleScanQR}
        />
        <Alert
          isOpen={openDeleteAlert}
          setIsOpen={setOpenDeleteAlert}
          dataTestId="alert-delete"
          headerText={i18n.t(
            "connectwallet.connectionhistory.deletealert.message"
          )}
          confirmButtonText={`${i18n.t(
            "connectwallet.connectionhistory.deletealert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "connectwallet.connectionhistory.deletealert.cancel"
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
            "connectwallet.connectionhistory.missingidentifieralert.message"
          )}
          confirmButtonText={`${i18n.t(
            "connectwallet.connectionhistory.missingidentifieralert.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "connectwallet.connectionhistory.missingidentifieralert.cancel"
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
