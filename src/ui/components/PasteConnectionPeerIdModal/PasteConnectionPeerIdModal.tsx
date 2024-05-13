import { IonInput } from "@ionic/react";
import { useState } from "react";
import "./PasteConnectionPeerIdModal.scss";
import { PasteConnectionPeerIdModalProps } from "./PasteConnectionPeerIdModal.types";
import { OptionModal } from "../OptionsModal";
import { i18n } from "../../../i18n";

const PasteConnectionPeerIdModal = ({
  openModal,
  onCloseModal,
  onConfirm,
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

  return (
    <OptionModal
      modalIsOpen={openModal}
      componentId="input-pid-modal"
      onDismiss={handleClose}
      customClasses="input-pid-modal"
      header={{
        closeButton: true,
        closeButtonAction: handleClose,
        closeButtonLabel: `${i18n.t(
          "menu.tab.items.connectwallet.inputpidmodal.cancel"
        )}`,
        actionButton: true,
        actionButtonLabel: `${i18n.t(
          "menu.tab.items.connectwallet.inputpidmodal.confirm"
        )}`,
        actionButtonAction: confirm,
        actionButtonDisabled: pid.length === 0,
        title: `${i18n.t("menu.tab.items.connectwallet.inputpidmodal.header")}`,
      }}
    >
      <IonInput
        data-testid="pid-input"
        value={pid}
        onIonInput={(event) => setPid(event.target.value as string)}
      />
    </OptionModal>
  );
};

export { PasteConnectionPeerIdModal };
