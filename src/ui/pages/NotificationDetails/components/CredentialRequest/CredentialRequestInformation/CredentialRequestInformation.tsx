import { IonButton, IonCard, IonIcon, IonText } from "@ionic/react";
import { informationCircleOutline, idCardOutline } from "ionicons/icons";
import { useCallback, useState } from "react";
import { Agent } from "../../../../../../core/agent/agent";
import { NotificationRoute } from "../../../../../../core/agent/agent.types";
import { i18n } from "../../../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import { getConnectionsCache } from "../../../../../../store/reducers/connectionsCache";
import {
  getNotificationsCache,
  setNotificationsCache,
} from "../../../../../../store/reducers/notificationsCache";
import KeriLogo from "../../../../../assets/images/KeriGeneric.jpg";
import { Alert as AlertDecline } from "../../../../../components/Alert";
import {
  CardDetailsAttributes,
  CardDetailsBlock,
} from "../../../../../components/CardDetails";
import { ScrollablePageLayout } from "../../../../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../../../../components/PageFooter";
import { PageHeader } from "../../../../../components/PageHeader";
import { showError } from "../../../../../utils/error";
import {
  MemberAcceptStatus,
  MultisigMember,
} from "../../../../../components/CredentialDetailModule/components";
import { CredentialRequestProps, MemberInfo } from "../CredentialRequest.types";
import "./CredentialRequestInformation.scss";
import { LightCredentialDetailModal } from "../LightCredentialDetailModal";

const CredentialRequestInformation = ({
  pageId,
  activeStatus,
  notificationDetails,
  credentialRequest,
  linkedGroup,
  onBack,
  onAccept,
}: CredentialRequestProps) => {
  const dispatch = useAppDispatch();
  const notificationsCache = useAppSelector(getNotificationsCache);
  const connectionsCache = useAppSelector(getConnectionsCache);
  const [notifications, setNotifications] = useState(notificationsCache);
  const [alertDeclineIsOpen, setAlertDeclineIsOpen] = useState(false);
  const [viewCredId, setViewCredId] = useState<string>();

  const connection = connectionsCache?.[notificationDetails.connectionId];

  const handleNotificationUpdate = async () => {
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== notificationDetails.id
    );
    setNotifications(updatedNotifications);
    dispatch(setNotificationsCache(updatedNotifications));
  };

  const handleDecline = async () => {
    try {
      await Agent.agent.keriaNotifications.deleteNotificationRecordById(
        notificationDetails.id,
        notificationDetails.a.r as NotificationRoute
      );
      handleNotificationUpdate();
      onBack();
    } catch (e) {
      showError("Unable to decline credential request", e, dispatch);
    }
  };

  const getStatus = useCallback((member: MemberInfo): MemberAcceptStatus => {
    if (member.joinedCred) {
      return MemberAcceptStatus.Accepted;
    }

    return MemberAcceptStatus.Waiting;
  }, []);

  const reachThreshold =
    linkedGroup &&
    linkedGroup?.joinedMembers === Number(linkedGroup?.threshold);

  const showProvidedCred = () => {
    if (!linkedGroup) return;

    let credId = "";
    let maxJoinedMemebers = 0;

    Object.keys(linkedGroup.offer).forEach((key) => {
      const joinedMemebers = linkedGroup.offer[key].membersJoined.length;

      if (maxJoinedMemebers < joinedMemebers) {
        maxJoinedMemebers = joinedMemebers;
        credId = key;
      }
    });

    if (!credId) return;

    setViewCredId(credId);
  };

  const handleClose = () => setViewCredId(undefined);

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
              "tabs.notifications.details.buttons.close"
            )}`}
            title={`${i18n.t(
              "tabs.notifications.details.credential.request.information.title"
            )}`}
          />
        }
        footer={
          <PageFooter
            pageId={pageId}
            customClass="credential-request-footer"
            primaryButtonText={`${i18n.t(
              !reachThreshold
                ? "tabs.notifications.details.buttons.choosecredential"
                : "tabs.notifications.details.buttons.ok"
            )}`}
            primaryButtonAction={onAccept}
            secondaryButtonText={
              reachThreshold
                ? undefined
                : `${i18n.t("tabs.notifications.details.buttons.decline")}`
            }
            secondaryButtonAction={() => setAlertDeclineIsOpen(true)}
          />
        }
      >
        <div className="credential-content">
          {reachThreshold && (
            <IonCard className="reach-threshold">
              <div className="container">
                <p>
                  {i18n.t(
                    "tabs.notifications.details.credential.request.information.reachthreshold"
                  )}
                </p>
                <div className="alert-icon">
                  <IonIcon
                    icon={informationCircleOutline}
                    slot="icon-only"
                  />
                </div>
              </div>
              <IonButton
                fill="outline"
                className="view-provided-cred-btn secondary-button"
                data-testid="view-provided-credential"
                onClick={showProvidedCred}
              >
                <IonIcon
                  slot="start"
                  icon={idCardOutline}
                />
                {i18n.t(
                  "tabs.notifications.details.credential.request.information.providecredential"
                )}
              </IonButton>
            </IonCard>
          )}
          <CardDetailsBlock
            className="request-from"
            title={`${i18n.t(
              "tabs.notifications.details.credential.request.information.requestfrom"
            )}`}
          >
            <div className="request-from-content">
              <img src={connection?.logo || KeriLogo} />
              <p>{connection?.label || i18n.t("connections.unknown")}</p>
            </div>
          </CardDetailsBlock>
          <CardDetailsBlock
            className="credential-request"
            title={`${i18n.t(
              "tabs.notifications.details.credential.request.information.requestedcredential"
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
                "tabs.notifications.details.credential.request.information.informationrequired"
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
          {linkedGroup && (
            <>
              <CardDetailsBlock
                className="credential-request"
                title={`${i18n.t(
                  "tabs.notifications.details.credential.request.information.threshold"
                )}`}
              >
                <div className="threshold">
                  <IonText className="requested-credential">
                    {linkedGroup.threshold}
                  </IonText>
                  <IonText className="requested-credential">
                    {linkedGroup.joinedMembers}/{linkedGroup.threshold}
                  </IonText>
                </div>
              </CardDetailsBlock>
              <CardDetailsBlock
                className="group-members"
                title={i18n.t(
                  "tabs.notifications.details.credential.request.information.groupmember"
                )}
              >
                {linkedGroup.memberInfos.map((member) => (
                  <MultisigMember
                    key={member.aid}
                    name={member.name}
                    status={getStatus(member)}
                  />
                ))}
              </CardDetailsBlock>
            </>
          )}
        </div>
      </ScrollablePageLayout>
      <LightCredentialDetailModal
        credId={viewCredId || ""}
        isOpen={!!viewCredId}
        setIsOpen={() => setViewCredId(undefined)}
        onClose={handleClose}
        joinedCredRequestMembers={
          linkedGroup?.memberInfos.filter(
            (item) => item.joinedCred === viewCredId
          ) || []
        }
        viewOnly
      />
      <AlertDecline
        isOpen={alertDeclineIsOpen}
        setIsOpen={setAlertDeclineIsOpen}
        dataTestId="multisig-request-alert-decline"
        headerText={i18n.t(
          "tabs.notifications.details.credential.request.information.alert.textdecline"
        )}
        confirmButtonText={`${i18n.t(
          "tabs.notifications.details.buttons.decline"
        )}`}
        cancelButtonText={`${i18n.t(
          "tabs.notifications.details.buttons.cancel"
        )}`}
        actionConfirm={() => handleDecline()}
        actionCancel={() => setAlertDeclineIsOpen(false)}
        actionDismiss={() => setAlertDeclineIsOpen(false)}
      />
    </>
  );
};

export { CredentialRequestInformation };
