import { scanCircleOutline, clipboardOutline } from "ionicons/icons";
import { ConnectWalletActionsProps } from "./ConnectWalletActions.types";
import { OptionItem, OptionModal } from "../../../../components/OptionsModal";
import { i18n } from "../../../../../i18n";
import { setCurrentOperation } from "../../../../../store/reducers/stateCache";
import { useAppDispatch } from "../../../../../store/hooks";
import { OperationType } from "../../../../globals/types";

const ConnectWalletActions = ({
  openModal,
  closeModal,
  onInputPid,
}: ConnectWalletActionsProps) => {
  const dispatch = useAppDispatch();

  const options: OptionItem[] = [
    {
      icon: scanCircleOutline,
      label: i18n.t("connectwallet.connectwalletmodal.scanqr"),
      onClick: () => {
        closeModal();
        dispatch(setCurrentOperation(OperationType.SCAN_CONNECTION));
      },
      testId: "connect-wallet-modal-scan-qr-code",
    },
    {
      icon: clipboardOutline,
      label: i18n.t("connectwallet.connectwalletmodal.pastePID"),
      onClick: () => {
        closeModal();
        onInputPid();
      },
      testId: "connect-wallet-modal-input-pid",
    },
  ];

  return (
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
  );
};

export { ConnectWalletActions };
