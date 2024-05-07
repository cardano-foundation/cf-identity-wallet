import { IonButton, IonIcon } from "@ionic/react";
import { personCircleOutline, trashOutline, copyOutline } from "ionicons/icons";
import { i18n } from "../../../../../i18n";
import { OptionModal } from "../../../../components/OptionsModal";
import { ConfirmConnectModalProps } from "./ConfirmConnectModal.types";
import "./ConfirmConnectModal.scss";
import { ellipsisBetweenText } from "../../../../utils/text";
import { writeToClipboard } from "../../../../utils/clipboard";
import { setToastMsg } from "../../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../../globals/types";
import { useAppDispatch } from "../../../../../store/hooks";
import { combineClassNames } from "../../../../utils/style";

const ConfirmConnectModal = ({
  openModal,
  isConnectModal,
  closeModal,
  onConfirm,
  connectionData,
  onDeleteConnection,
}: ConfirmConnectModalProps) => {
  const dispatch = useAppDispatch();

  const cardImg = connectionData?.image ? (
    <img
      src={connectionData.image}
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
      ? "connectwallet.connectionhistory.confirmconnect.connectbtn"
      : "connectwallet.connectionhistory.confirmconnect.disconnectbtn"
  );

  const displayUrl = ellipsisBetweenText(connectionData?.url || "");

  const deleteConnection = () => {
    if (!connectionData) return;

    onDeleteConnection(connectionData);
    closeModal();
  };

  const confirm = () => {
    onConfirm();
    closeModal();
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
          "connectwallet.connectionhistory.confirmconnect.done"
        )}`,
        actionButton: true,
        actionButtonIcon: trashOutline,
        actionButtonAction: deleteConnection,
      }}
    >
      {cardImg}
      <h3 className="confirm-modal-name-title">{connectionData?.name}</h3>
      <p className="confirm-modal-name">{connectionData?.owner}</p>
      <div
        onClick={() => {
          if (!connectionData) return;
          writeToClipboard(connectionData.url);
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