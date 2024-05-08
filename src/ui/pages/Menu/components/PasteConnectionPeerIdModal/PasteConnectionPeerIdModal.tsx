import { IonButton, IonInput } from "@ionic/react";
import { useState } from "react";
import { i18n } from "../../../../../i18n";
import { OptionModal } from "../../../../components/OptionsModal";
import { PasteConnectionPeerIdModalProps } from "./PasteConnectionPeerIdModal.types";
import "./PasteConnectionPeerIdModal.scss";

const PasteConnectionPeerIdModal = ({
  openModal,
  onCloseModal,
  onConfirm,
  onScanQR,
}: PasteConnectionPeerIdModalProps) => {
  const [pid, setPid] = useState("");

  const handleClose = () => {
    setPid("");
    onCloseModal();
  };

  const confirm = () => {
    onConfirm(pid);
    handleClose();
  };

  const handleScanQR = () => {
    onScanQR();
    handleClose();
  };

  return (
    <OptionModal
      modalIsOpen={openModal}
      componentId="input-pid-modal"
      onDismiss={handleClose}
      customClasses="input-pid-modal"
      header={{
        closeButton: true,
        closeButtonAction: handleClose,
        closeButtonLabel: `${i18n.t("connectwallet.inputpidmodal.cancel")}`,
        actionButton: true,
        actionButtonLabel: `${i18n.t("connectwallet.inputpidmodal.confirm")}`,
        actionButtonAction: confirm,
        title: `${i18n.t("connectwallet.inputpidmodal.header")}`,
      }}
    >
      <IonInput
        data-testid="input-pid"
        value={pid}
        onIonInput={(event) => setPid(event.target.value as string)}
      />
      <IonButton
        className="secondary-button"
        data-testid="scanqr-btn"
        onClick={handleScanQR}
      >
        {i18n.t("connectwallet.inputpidmodal.scanQR")}
      </IonButton>
    </OptionModal>
  );
};

export { PasteConnectionPeerIdModal };
