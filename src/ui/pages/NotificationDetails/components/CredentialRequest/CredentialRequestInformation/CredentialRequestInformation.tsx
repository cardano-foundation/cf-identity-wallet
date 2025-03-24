import { IonIcon, IonSpinner, IonText } from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import { useCallback, useMemo, useState } from "react";
import { Agent } from "../../../../../../core/agent/agent";
import { NotificationRoute } from "../../../../../../core/agent/agent.types";
import { i18n } from "../../../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import { getConnectionsCache } from "../../../../../../store/reducers/connectionsCache";
import {
  getNotificationsCache,
  setNotificationsCache,
} from "../../../../../../store/reducers/notificationsCache";
import { setToastMsg } from "../../../../../../store/reducers/stateCache";
import KeriLogo from "../../../../../assets/images/KeriGeneric.jpg";
import { Alert as AlertDecline } from "../../../../../components/Alert";
import {
  CardDetailsAttributes,
  CardDetailsBlock,
} from "../../../../../components/CardDetails";
import {
  MemberAcceptStatus,
  MultisigMember,
} from "../../../../../components/CredentialDetailModule/components";
import { InfoCard } from "../../../../../components/InfoCard";
import { ScrollablePageLayout } from "../../../../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../../../../components/PageFooter";
import { PageHeader } from "../../../../../components/PageHeader";
import { ToastMsgType } from "../../../../../globals/types";
import { useOnlineStatusEffect } from "../../../../../hooks";
import { showError } from "../../../../../utils/error";
import { CredentialRequestProps, MemberInfo } from "../CredentialRequest.types";
import { LightCredentialDetailModal } from "../LightCredentialDetailModal";
import "./CredentialRequestInformation.scss";
import { Verification } from "../../../../../components/Verification";

const CredentialRequestInformation = ({
  pageId,
  activeStatus,
  notificationDetails,
  credentialRequest,
  linkedGroup,
  userAID,
  onBack,
  onAccept,
  onReloadData,
}: CredentialRequestProps) => {
  const dispatch = useAppDispatch();
  const notificationsCache = useAppSelector(getNotificationsCache);
  const connectionsCache = useAppSelector(getConnectionsCache);
  const [notifications, setNotifications] = useState(notificationsCache);
  const [alertDeclineIsOpen, setAlertDeclineIsOpen] = useState(false);
  const [viewCredId, setViewCredId] = useState<string>();
  const [chooseCredId, setChooseCredId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);

  const connection = connectionsCache?.[notificationDetails.connectionId];

  const isGroup = !!linkedGroup;
  const isGroupInitiator = linkedGroup?.members[0] === userAID;
  const isJoinGroup = linkedGroup?.memberInfos.some(
    (item) => item.aid === userAID && item.joined
  );
  const groupInitiatorJoined = !!linkedGroup?.memberInfos.at(0)?.joined;

  const getCred = useCallback(async () => {
    if (!groupInitiatorJoined || !linkedGroup?.linkedRequest.current) return;

    try {
      const id = await Agent.agent.ipexCommunications.getOfferedCredentialSaid(
        linkedGroup.linkedRequest.current
      );
      setChooseCredId(id);
    } catch (error) {
      showError("Unable to get choosen cred", error, dispatch);
    }
  }, [dispatch, groupInitiatorJoined, linkedGroup?.linkedRequest]);

  useOnlineStatusEffect(getCred);

  const handleNotificationUpdate = async () => {
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== notificationDetails.id
    );
    setNotifications(updatedNotifications);
    dispatch(setNotificationsCache(updatedNotifications));
  };

  const handleDecline = async () => {
    const isRejectGroupRequest =
      isGroup &&
      !(
        isGroupInitiator ||
        (!isGroupInitiator && !groupInitiatorJoined) ||
        isJoinGroup
      );
    try {
      await Agent.agent.keriaNotifications.deleteNotificationRecordById(
        notificationDetails.id,
        notificationDetails.a.r as NotificationRoute
      );

      if (isRejectGroupRequest) {
        dispatch(setToastMsg(ToastMsgType.PROPOSAL_CRED_REJECT));
      }

      handleNotificationUpdate();
      onBack();
    } catch (e) {
      const toastMessage = isRejectGroupRequest
        ? ToastMsgType.PROPOSAL_CRED_FAIL
        : undefined;
      showError(
        "Unable to decline credential request",
        e,
        dispatch,
        toastMessage
      );
    }
  };

  const getStatus = useCallback(
    (member: MemberInfo): MemberAcceptStatus => {
      if (member.joined) {
        return MemberAcceptStatus.Accepted;
      }

      if (!groupInitiatorJoined) {
        return MemberAcceptStatus.None;
      }

      return MemberAcceptStatus.Waiting;
    },
    [groupInitiatorJoined]
  );

  const reachedThreshold =
    linkedGroup &&
    linkedGroup.othersJoined.length +
      (linkedGroup.linkedRequest.accepted ? 1 : 0) >=
      Number(linkedGroup.threshold);

  const showProvidedCred = () => {
    setViewCredId(chooseCredId);
  };

  const handleClose = () => setViewCredId(undefined);

  const headerAlertMessage = useMemo(() => {
    if (!isGroup) return null;

    if (reachedThreshold) {
      return i18n.t(
        "tabs.notifications.details.credential.request.information.reachthreshold"
      );
    }

    if (isGroupInitiator && !isJoinGroup) {
      return i18n.t(
        "tabs.notifications.details.credential.request.information.initiatorselectcred"
      );
    }

    if (isGroupInitiator && isJoinGroup) {
      return i18n.t(
        "tabs.notifications.details.credential.request.information.initiatorselectedcred"
      );
    }

    if (!isGroupInitiator && !isJoinGroup && !groupInitiatorJoined) {
      return i18n.t(
        "tabs.notifications.details.credential.request.information.memberwaitingproposal"
      );
    }

    if (!isGroupInitiator && !isJoinGroup) {
      return i18n.t(
        "tabs.notifications.details.credential.request.information.memberreviewcred"
      );
    }

    if (!isGroupInitiator && isJoinGroup) {
      return i18n.t(
        "tabs.notifications.details.credential.request.information.memberjoined"
      );
    }

    return null;
  }, [
    isGroup,
    reachedThreshold,
    isGroupInitiator,
    isJoinGroup,
    groupInitiatorJoined,
  ]);

  const primaryButtonText = useMemo(() => {
    if (isGroupInitiator) {
      return groupInitiatorJoined ?
        i18n.t("tabs.notifications.details.buttons.ok") :
        i18n.t("tabs.notifications.details.buttons.choosecredential");
    }

    if (groupInitiatorJoined && !isJoinGroup && !reachedThreshold) {
      return i18n.t("tabs.notifications.details.buttons.accept");
    }

    return i18n.t("tabs.notifications.details.buttons.ok");
  }, [isGroupInitiator, groupInitiatorJoined, isJoinGroup, reachedThreshold]);

  const deleteButtonText = useMemo(() => {
    return isGroupInitiator ||
      (!isGroupInitiator && !groupInitiatorJoined) ||
      isJoinGroup ||
      reachedThreshold
      ? undefined
      : `${i18n.t("tabs.notifications.details.buttons.decline")}`;
  }, [isGroupInitiator, groupInitiatorJoined, isJoinGroup, reachedThreshold]);

  const decline = () => setAlertDeclineIsOpen(true);

  const acceptRequest = async () => {
    try {
      setLoading(true);
      await Agent.agent.ipexCommunications.joinMultisigOffer(
        notificationDetails.id
      );
      dispatch(setToastMsg(ToastMsgType.PROPOSAL_CRED_ACCEPTED));
      await onReloadData?.();
    } catch (e) {
      showError(
        "Unable to proposal cred",
        e,
        dispatch,
        ToastMsgType.PROPOSAL_CRED_FAIL
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClick = async () => {
    if ((isGroupInitiator && !isJoinGroup) || !isGroup) {
      onAccept();
      return;
    }

    if (isJoinGroup || !groupInitiatorJoined || reachedThreshold) {
      onBack();
      return;
    }

    setVerifyIsOpen(true);
  };

  const closeAlert = () => setAlertDeclineIsOpen(false);

  const title = `${i18n.t(
    isGroup && !isGroupInitiator && groupInitiatorJoined
      ? "tabs.notifications.details.credential.request.information.proposedcred"
      : "tabs.notifications.details.credential.request.information.title"
  )}`;

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
            title={title}
          />
        }
        footer={
          <PageFooter
            pageId={pageId}
            customClass="credential-request-footer"
            primaryButtonText={primaryButtonText}
            primaryButtonAction={handleAcceptClick}
            secondaryButtonText={
              reachedThreshold || groupInitiatorJoined || !isGroupInitiator
                ? undefined
                : `${i18n.t("tabs.notifications.details.buttons.decline")}`
            }
            secondaryButtonAction={decline}
            deleteButtonAction={decline}
            deleteButtonText={deleteButtonText}
            deleteButtonIcon={false}
          />
        }
      >
        <div className="credential-content">
          {headerAlertMessage && (
            <InfoCard
              className="alert"
              content={headerAlertMessage}
            />
          )}
          {!isGroupInitiator && groupInitiatorJoined && (
            <CardDetailsBlock
              className="request-from"
              title={`${i18n.t(
                "tabs.notifications.details.credential.request.information.proposalfrom"
              )}`}
            >
              <div className="request-from-content">
                <img src={KeriLogo} />
                <p>
                  {linkedGroup?.memberInfos.at(0)?.name ||
                    i18n.t("connections.unknown")}
                </p>
              </div>
            </CardDetailsBlock>
          )}
          {linkedGroup?.linkedRequest.current && (
            <CardDetailsBlock
              onClick={showProvidedCred}
              className="proposed-cred"
              title={`${i18n.t(
                "tabs.notifications.details.credential.request.information.proposedcred"
              )}`}
            >
              <div className="request-from-content">
                <img src={KeriLogo} />
                <p>
                  {credentialRequest.schema.name ||
                    i18n.t("connections.unknown")}
                </p>
              </div>
              <IonIcon icon={informationCircleOutline} />
            </CardDetailsBlock>
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
        joinedCredRequestMembers={linkedGroup?.memberInfos}
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
        actionConfirm={handleDecline}
        actionCancel={closeAlert}
        actionDismiss={closeAlert}
      />
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={acceptRequest}
      />
      {loading && (
        <div
          className="cre-request-spinner-container"
          data-testid="cre-request-spinner-container"
        >
          <IonSpinner name="circular" />
        </div>
      )}
    </>
  );
};

export { CredentialRequestInformation };
