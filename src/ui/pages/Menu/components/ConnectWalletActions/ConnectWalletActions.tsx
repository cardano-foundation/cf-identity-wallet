import { clipboardOutline, scanCircleOutline } from "ionicons/icons";
import { useRef, useState } from "react";
import { i18n } from "../../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getConnectedWallet,
  setConnectedWallet,
} from "../../../../../store/reducers/walletConnectionsCache";
import { Alert } from "../../../../components/Alert";
import { OptionItem, OptionModal } from "../../../../components/OptionsModal";
import {
  ConnectWalletActionsProps,
  CreateConnectMethod,
} from "./ConnectWalletActions.types";

const ConnectWalletActions = ({
  openModal,
  closeModal,
  onQRScan,
  onInputPid,
}: ConnectWalletActionsProps) => {
  const dispatch = useAppDispatch();
  const connectedWallet = useAppSelector(getConnectedWallet);
  const [openDisconnectAlert, setOpenDisconnectAlert] =
    useState<boolean>(false);
  const createConnectMethod = useRef(CreateConnectMethod.None);

  const handleCloseAlert = () => {
    createConnectMethod.current = CreateConnectMethod.None;
    setOpenDisconnectAlert(false);
  };

  const handleCreateNewConnect = () => {
    dispatch(setConnectedWallet(null));

    if (createConnectMethod.current === CreateConnectMethod.ScanQR) {
      onQRScan();
      return;
    }

    onInputPid();
  };

  const options: OptionItem[] = [
    {
      icon: scanCircleOutline,
      label: i18n.t("connectwallet.connectwalletmodal.scanqr"),
      onClick: () => {
        closeModal();
        if (connectedWallet) {
          createConnectMethod.current = CreateConnectMethod.ScanQR;
          setOpenDisconnectAlert(true);
          return;
        }

        onQRScan();
      },
      testId: "connect-wallet-modal-scan-qr-code",
    },
    {
      icon: clipboardOutline,
      label: i18n.t("connectwallet.connectwalletmodal.pastePID"),
      onClick: () => {
        closeModal();

        if (connectedWallet) {
          createConnectMethod.current = CreateConnectMethod.InputPID;
          setOpenDisconnectAlert(true);
          return;
        }

        onInputPid();
      },
      testId: "connect-wallet-modal-input-pid",
    },
  ];

  return (
    <>
      <OptionModal
        modalIsOpen={openModal}
        componentId="add-connection-modal"
        onDismiss={closeModal}
        header={{
          closeButton: true,
          closeButtonAction: closeModal,
          closeButtonLabel: `${i18n.t(
            "connectwallet.connectwalletmodal.cancel"
          )}`,
          title: `${i18n.t("connectwallet.connectwalletmodal.header")}`,
        }}
        items={options}
      />
      <Alert
        isOpen={openDisconnectAlert}
        setIsOpen={setOpenDisconnectAlert}
        dataTestId="alert-disconnect-before-creat-new"
        headerText={i18n.t(
          "connectwallet.connectwalletmodal.disconnectbeforecreatealert.message"
        )}
        confirmButtonText={`${i18n.t(
          "connectwallet.connectwalletmodal.disconnectbeforecreatealert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "connectwallet.connectwalletmodal.disconnectbeforecreatealert.cancel"
        )}`}
        actionConfirm={handleCreateNewConnect}
        actionCancel={handleCloseAlert}
        actionDismiss={handleCloseAlert}
      />
    </>
  );
};

export { ConnectWalletActions };
