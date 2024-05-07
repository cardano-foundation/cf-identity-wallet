import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { i18n } from "../../../../../i18n";
import { CardsPlaceholder } from "../../../../components/CardsPlaceholder";
import "./ConnectWallet.scss";
import { ConnectWalletActions } from "../ConnectWalletActions";
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
  getStateCache,
  setToastMsg,
} from "../../../../../store/reducers/stateCache";
import { VerifyPassword } from "../../../../components/VerifyPassword";
import { VerifyPasscode } from "../../../../components/VerifyPasscode";
import { ConfirmConnectModal } from "../ConfirmConnectModal";
import { ToastMsgType } from "../../../../globals/types";
import {
  ConnectionData,
  getConnectedWallet,
  getWalletConnectionsCache,
  setConnectedWallet,
} from "../../../../../store/reducers/walletConnectionsCache";

const ConnectWallet = forwardRef<ConnectWalletOptionRef, object>(
  (props, ref) => {
    const dispatch = useAppDispatch();
    const connections = useAppSelector(getWalletConnectionsCache);
    const connectedWallet = useAppSelector(getConnectedWallet);
    const pageId = "connect-wallet-placeholder";
    const stateCache = useAppSelector(getStateCache);
    const actionInfo = useRef<ActionInfo>({
      type: ActionType.None,
    });

    const [openConnectWallet, setOpenConnectWallet] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [openConfirmConnectModal, setOpenConfirmConnectModal] =
      useState<boolean>(false);

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

    useImperativeHandle(ref, () => ({
      openConnectWallet: handleAddConnect,
    }));

    const handleAddConnect = () => {
      setOpenConnectWallet(true);
    };

    const handleInputPid = () => {
      setOpenConnectWallet(false);
    };

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

    const handleDelete = () => {
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

      if (ActionType.Connect === actionInfo.current.type) {
        handleConnectWallet();
      }
    };

    const handleConfirmConnect = () => {
      handleOpenVerify();
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
                buttonAction={handleAddConnect}
                testId={pageId}
              />
            </div>
          )}
        </div>
        <ConnectWalletActions
          openModal={openConnectWallet}
          closeModal={() => setOpenConnectWallet(false)}
          onInputPid={handleInputPid}
        />
        <ConfirmConnectModal
          isConnectModal={actionInfo.current.data?.id !== connectedWallet?.id}
          openModal={openConfirmConnectModal}
          closeModal={() => setOpenConfirmConnectModal(false)}
          onConfirm={handleConfirmConnect}
          connectionData={actionInfo.current.data}
          onDeleteConnection={handleOpenDeleteAlert}
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
          actionConfirm={handleDelete}
          actionCancel={closeDeleteAlert}
          actionDismiss={closeDeleteAlert}
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
