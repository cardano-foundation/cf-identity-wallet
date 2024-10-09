import { scanCircleOutline, qrCodeOutline } from "ionicons/icons";
import { ConnectionsOptionModalProps } from "./ConnectionsOptionModal.types";
import { useAppDispatch } from "../../../../../store/hooks";
import { setCurrentOperation } from "../../../../../store/reducers/stateCache";
import { OperationType } from "../../../../globals/types";
import { OptionItem, OptionModal } from "../../../../components/OptionsModal";
import { i18n } from "../../../../../i18n";

const ConnectionsOptionModal = ({
  type,
  connectModalIsOpen,
  setConnectModalIsOpen,
  handleProvideQr,
}: ConnectionsOptionModalProps) => {
  const dispatch = useAppDispatch();

  const options: OptionItem[] = [
    {
      icon: scanCircleOutline,
      label: i18n.t("connectmodal.scan"),
      onClick: () => {
        setConnectModalIsOpen(false);
        dispatch(setCurrentOperation(OperationType.SCAN_CONNECTION));
      },
      testId: "add-connection-modal-scan-qr-code",
    },
    {
      icon: qrCodeOutline,
      label: i18n.t("connectmodal.provide"),
      onClick: () => {
        setConnectModalIsOpen(false);
        handleProvideQr();
      },
      testId: "add-connection-modal-provide-qr-code",
    },
  ];

  const handleClose = () => setConnectModalIsOpen(false);

  return (
    <OptionModal
      modalIsOpen={connectModalIsOpen}
      componentId="add-connection-modal"
      onDismiss={handleClose}
      header={{
        closeButton: true,
        closeButtonAction: handleClose,
        closeButtonLabel: `${i18n.t("connectmodal.close")}`,
        title: `${i18n.t("connectmodal.title")} ${type.toLowerCase()}`,
      }}
      items={options}
    />
  );
};

export { ConnectionsOptionModal };
