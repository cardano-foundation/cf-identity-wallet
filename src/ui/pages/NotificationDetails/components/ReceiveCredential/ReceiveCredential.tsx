import { IonCol, IonIcon } from "@ionic/react";
import {
  checkmark,
  personCircleOutline,
  swapHorizontalOutline,
} from "ionicons/icons";
import { useState } from "react";
import { Agent } from "../../../../../core/agent/agent";
import { i18n } from "../../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import { getConnectionsCache } from "../../../../../store/reducers/connectionsCache";
import {
  getNotificationsCache,
  setNotificationsCache,
} from "../../../../../store/reducers/notificationsCache";
import { Alert as AlertDecline } from "../../../../components/Alert";
import { ResponsivePageLayout } from "../../../../components/layout/ResponsivePageLayout";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { BackEventPriorityType } from "../../../../globals/types";
import { useIonHardwareBackButton } from "../../../../hooks";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";
import { NotificationDetailsProps } from "../../NotificationDetails.types";
import "./ReceiveCredential.scss";
import { NotificationRoute } from "../../../../../core/agent/agent.types";

const ReceiveCredential = ({
  pageId,
  activeStatus,
  notificationDetails,
  handleBack,
  multisigExn,
}: NotificationDetailsProps) => {
  const dispatch = useAppDispatch();
  const notificationsCache = useAppSelector(getNotificationsCache);
  const [notifications, setNotifications] = useState(notificationsCache);
  const connectionsCache = useAppSelector(getConnectionsCache);
  const fallbackLogo = KeriLogo;
  const [alertDeclineIsOpen, setAlertDeclineIsOpen] = useState(false);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const connection =
    connectionsCache?.[notificationDetails.connectionId]?.label;
  const ANIMATION_DELAY = 2000;

  useIonHardwareBackButton(
    BackEventPriorityType.Page,
    handleBack,
    !activeStatus
  );

  const handleNotificationUpdate = async () => {
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== notificationDetails.id
    );
    setNotifications(updatedNotifications);
    dispatch(setNotificationsCache(updatedNotifications));
  };

  const handleAccept = async () => {
    setInitiateAnimation(true);
    if (multisigExn) {
      await Agent.agent.ipexCommunications.acceptAcdcFromMultisigExn(
        notificationDetails.id
      );
    } else {
      await Agent.agent.ipexCommunications.acceptAcdc(notificationDetails.id);
    }
    handleNotificationUpdate();
    setTimeout(() => {
      handleNotificationUpdate();
      handleBack();
    }, ANIMATION_DELAY);
  };

  const handleDecline = async () => {
    await Agent.agent.signifyNotifications.deleteNotificationRecordById(
      notificationDetails.id,
      notificationDetails.a.r as NotificationRoute
    );
    handleNotificationUpdate();
    handleBack();
  };

  return (
    <>
      <ResponsivePageLayout
        pageId={`${pageId}-receive-credential`}
        customClass={`${pageId}-receive-credential${
          initiateAnimation ? " animation-on" : " animation-off"
        }`}
        activeStatus={activeStatus}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={handleBack}
            closeButtonLabel={`${i18n.t(
              "notifications.details.buttons.close"
            )}`}
            title={`${i18n.t(
              "notifications.details.credential.receive.title"
            )}`}
          />
        }
      >
        <div className="request-animation-center">
          <div className="request-icons-row">
            <div className="request-user-logo">
              <IonIcon
                icon={personCircleOutline}
                color="light"
              />
            </div>
            <div className="request-swap-logo">
              <span>
                <IonIcon icon={swapHorizontalOutline} />
              </span>
            </div>
            <div className="request-checkmark-logo">
              <span>
                <IonIcon icon={checkmark} />
              </span>
            </div>
            <div className="request-provider-logo">
              <img
                data-testid="credential-request-provider-logo"
                src={fallbackLogo}
                alt="request-provider-logo"
              />
            </div>
          </div>
          <div className="request-info-row">
            <IonCol size="12">
              <span>
                {i18n.t("notifications.details.credential.receive.receivefrom")}
              </span>
              <strong>{connection}</strong>
            </IonCol>
          </div>
          <div className="request-status">
            <IonCol size="12">
              <strong>
                {i18n.t(
                  "notifications.details.credential.receive.credentialpending"
                )}
              </strong>
            </IonCol>
          </div>
        </div>
        <PageFooter
          pageId={pageId}
          primaryButtonText={`${i18n.t(
            "notifications.details.buttons.accept"
          )}`}
          primaryButtonAction={handleAccept}
          secondaryButtonText={`${i18n.t(
            "notifications.details.buttons.decline"
          )}`}
          secondaryButtonAction={() => setAlertDeclineIsOpen(true)}
        />
      </ResponsivePageLayout>
      <AlertDecline
        isOpen={alertDeclineIsOpen}
        setIsOpen={setAlertDeclineIsOpen}
        dataTestId="multisig-request-alert-decline"
        headerText={i18n.t(
          "notifications.details.identifier.alert.textdecline"
        )}
        confirmButtonText={`${i18n.t("notifications.details.buttons.decline")}`}
        cancelButtonText={`${i18n.t("notifications.details.buttons.cancel")}`}
        actionConfirm={() => handleDecline()}
        actionCancel={() => setAlertDeclineIsOpen(false)}
        actionDismiss={() => setAlertDeclineIsOpen(false)}
      />
    </>
  );
};

export { ReceiveCredential };
