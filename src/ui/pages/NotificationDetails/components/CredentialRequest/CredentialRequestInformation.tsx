import { IonText } from "@ionic/react";
import { useState } from "react";
import { Agent } from "../../../../../core/agent/agent";
import { i18n } from "../../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getNotificationsCache,
  setNotificationsCache,
} from "../../../../../store/reducers/notificationsCache";
import { Alert as AlertDecline } from "../../../../components/Alert";
import {
  CardDetailsAttributes,
  CardDetailsBlock,
} from "../../../../components/CardDetails";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { CredentialRequestProps } from "./CredentialRequest.types";
import "./CredentialRequestInformation.scss";
import { getConnectionsCache } from "../../../../../store/reducers/connectionsCache";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";
import { NotificationRoute } from "../../../../../core/agent/agent.types";

const CredentialRequestInformation = ({
  pageId,
  activeStatus,
  notificationDetails,
  credentialRequest,
  onBack,
  onAccept,
}: CredentialRequestProps) => {
  const dispatch = useAppDispatch();
  const notificationsCache = useAppSelector(getNotificationsCache);
  const connectionsCache = useAppSelector(getConnectionsCache);
  const [notifications, setNotifications] = useState(notificationsCache);
  const [alertDeclineIsOpen, setAlertDeclineIsOpen] = useState(false);

  const connection = connectionsCache?.[notificationDetails.connectionId];

  const handleNotificationUpdate = async () => {
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== notificationDetails.id
    );
    setNotifications(updatedNotifications);
    dispatch(setNotificationsCache(updatedNotifications));
  };

  const handleDecline = async () => {
    await Agent.agent.keriaNotifications.deleteNotificationRecordById(
      notificationDetails.id,
      notificationDetails.a.r as NotificationRoute
    );
    handleNotificationUpdate();
    onBack();
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={`${pageId}-credential-request-info`}
        customClass={`${pageId}-credential-request-info`}
        activeStatus={activeStatus}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={onBack}
            closeButtonLabel={`${i18n.t(
              "notifications.details.buttons.close"
            )}`}
            title={`${i18n.t(
              "notifications.details.credential.request.information.title"
            )}`}
          />
        }
        footer={
          <PageFooter
            pageId={pageId}
            customClass="credential-request-footer"
            primaryButtonText={`${i18n.t(
              "notifications.details.buttons.accept"
            )}`}
            primaryButtonAction={onAccept}
            secondaryButtonText={`${i18n.t(
              "notifications.details.buttons.decline"
            )}`}
            secondaryButtonAction={() => setAlertDeclineIsOpen(true)}
          />
        }
      >
        <div className="credential-content">
          <CardDetailsBlock
            className="request-from"
            title={`${i18n.t(
              "notifications.details.credential.request.information.requestfrom"
            )}`}
          >
            <div className="request-from-content">
              <img src={connection?.logo || KeriLogo} />
              <p>{connection?.label}</p>
            </div>
          </CardDetailsBlock>
          <CardDetailsBlock
            className="credential-request"
            title={`${i18n.t(
              "notifications.details.credential.request.information.requestedcredential"
            )}`}
          >
            <IonText className="requested-credential">
              {credentialRequest.schema.name}
            </IonText>
          </CardDetailsBlock>
          {JSON.stringify(credentialRequest.attributes) !== "{}" && (
            <CardDetailsBlock
              className="request-data"
              title={i18n.t(
                "notifications.details.credential.request.information.informationrequired"
              )}
            >
              <CardDetailsAttributes
                data={credentialRequest.attributes as Record<string, string>}
                itemProps={{
                  mask: false,
                  fullText: true,
                  copyButton: false,
                  className: "credential-info-item",
                }}
              />
            </CardDetailsBlock>
          )}
        </div>
      </ScrollablePageLayout>
      <AlertDecline
        isOpen={alertDeclineIsOpen}
        setIsOpen={setAlertDeclineIsOpen}
        dataTestId="multisig-request-alert-decline"
        headerText={i18n.t(
          "notifications.details.credential.request.information.alert.textdecline"
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

export { CredentialRequestInformation };
