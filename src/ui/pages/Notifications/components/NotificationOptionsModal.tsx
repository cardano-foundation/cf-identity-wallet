import {
  mailOpenOutline,
  mailUnreadOutline,
  readerOutline,
  trashOutline,
} from "ionicons/icons";
import { i18n } from "../../../../i18n";
import { OptionItem, OptionModal } from "../../../components/OptionsModal";
import { NotificationOptionModalProps } from "./NotificationOptionsModal.types";

const NotificationOptionsModal = ({
  optionsIsOpen,
  setCloseModal,
  notification,
  onShowDetail,
  onDeleteNotification,
  onToggleNotification
}: NotificationOptionModalProps) => {
  const closeModal = () => {
    setCloseModal();
  };

  const options: OptionItem[] = [
    {
      icon: readerOutline,
      label: i18n.t("tabs.notifications.tab.optionmodal.showdetail"),
      onClick: () => {
        onShowDetail(notification);
        closeModal();
      },
      testId: "show-notification-detail",
    },
    {
      icon: notification.read ? mailUnreadOutline : mailOpenOutline,
      label: i18n.t(
        notification.read
          ? "tabs.notifications.tab.optionmodal.markasunread"
          : "tabs.notifications.tab.optionmodal.markasread"
      ),
      onClick: () => onToggleNotification(notification),
      testId: "toogle-read-notification",
    },
    {
      icon: trashOutline,
      label: i18n.t("tabs.notifications.tab.optionmodal.delete"),
      onClick: () => onDeleteNotification(notification),
      testId: "delete-notification",
    },
  ];

  return (
    <>
      <OptionModal
        modalIsOpen={optionsIsOpen}
        componentId="notification-options-modal"
        onDismiss={closeModal}
        header={{
          closeButton: true,
          closeButtonLabel: `${i18n.t(
            "tabs.notifications.tab.optionmodal.done"
          )}`,
          closeButtonAction: closeModal,
          title: `${i18n.t("tabs.notifications.tab.optionmodal.title")}`,
        }}
        items={options}
      />
    </>
  );
};

export { NotificationOptionsModal };
