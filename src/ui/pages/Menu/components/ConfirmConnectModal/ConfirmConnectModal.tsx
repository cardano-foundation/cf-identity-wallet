import { IonButton, IonIcon } from "@ionic/react";
import { copyOutline, personCircleOutline, trashOutline } from "ionicons/icons";
import { i18n } from "../../../../../i18n";
import { useAppDispatch } from "../../../../../store/hooks";
import { setToastMsg } from "../../../../../store/reducers/stateCache";
import { OptionModal } from "../../../../components/OptionsModal";
import { ToastMsgType } from "../../../../globals/types";
import { writeToClipboard } from "../../../../utils/clipboard";
import { combineClassNames } from "../../../../utils/style";
import "./ConfirmConnectModal.scss";
import { ConfirmConnectModalProps } from "./ConfirmConnectModal.types";

const ConfirmConnectModal = ({
  openModal,
  isConnectModal,
  closeModal,
  onConfirm,
  connectionData,
  onDeleteConnection,
}: ConfirmConnectModalProps) => {
  const dispatch = useAppDispatch();

  const cardImg = connectionData?.iconB64 ? (
    <img
      src={connectionData.iconB64}
      alt={connectionData.name}
      className="wallet-connect-logo"
      data-testid="wallet-connection-logo"
    />
  ) : (
    <div
      data-testid="wallet-connection-fallback-logo"
      className="wallet-connect-fallback-logo wallet-connect-logo"
    >
      <IonIcon
        icon={personCircleOutline}
        color="light"
      />
    </div>
  );

  const buttonTitle = i18n.t(
    isConnectModal
      ? "menu.tab.items.connectwallet.connectionhistory.confirmconnect.connectbtn"
      : "menu.tab.items.connectwallet.connectionhistory.confirmconnect.disconnectbtn"
  );

  const displayUrl = connectionData
    ? (connectionData.url as string).substring(0, 5) +
      "..." +
      (connectionData.url as string).slice(-5)
    : "";

  const deleteConnection = () => {
    if (!connectionData) return;

    onDeleteConnection(connectionData);
    closeModal();
  };

  const confirm = () => {
    closeModal();
    onConfirm();
  };

  const confirmClass = combineClassNames("confirm-connect-submit", {
    "primary-button": isConnectModal,
    "secondary-button": !isConnectModal,
  });

  return (
    <OptionModal
      modalIsOpen={openModal}
      componentId="add-connection-modal"
      onDismiss={closeModal}
      customClasses="confirm-connect-modal"
      header={{
        closeButton: true,
        closeButtonAction: closeModal,
        closeButtonLabel: `${i18n.t(
          "menu.tab.items.connectwallet.connectionhistory.confirmconnect.done"
        )}`,
        actionButton: true,
        actionButtonIcon: trashOutline,
        actionButtonAction: deleteConnection,
      }}
    >
      {cardImg}
      <h3 className="confirm-modal-name-title">{connectionData?.name}</h3>
      <p className="confirm-modal-name">{connectionData?.selectedAid}</p>
      <div
        onClick={() => {
          if (!connectionData) return;
          writeToClipboard(connectionData.url as string);
          dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
        }}
        className="confirm-modal-id"
        data-testid="connection-id"
      >
        <span>{displayUrl}</span>
        <IonIcon icon={copyOutline} />
      </div>
      <IonButton
        className={confirmClass}
        data-testid="confirm-connect-btn"
        onClick={confirm}
      >
        {buttonTitle}
      </IonButton>
    </OptionModal>
  );
};

export { ConfirmConnectModal };
