import { IonButton, IonCol, IonIcon, IonItem, IonText } from "@ionic/react";
import {
  alertCircleOutline,
  checkmark,
  informationCircleOutline,
  personCircleOutline,
  swapHorizontalOutline,
} from "ionicons/icons";
import { useCallback, useMemo, useState } from "react";
import { Agent } from "../../../../../core/agent/agent";
import { NotificationRoute } from "../../../../../core/agent/agent.types";
import {
  ACDCDetails
} from "../../../../../core/agent/services/credentialService.types";
import { IdentifierType } from "../../../../../core/agent/services/identifier.types";
import { i18n } from "../../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getConnectionsCache,
  getMultisigConnectionsCache,
} from "../../../../../store/reducers/connectionsCache";
import { getIdentifiersCache } from "../../../../../store/reducers/identifiersCache";
import {
  deleteNotification,
  getNotificationsCache,
  setNotificationsCache,
} from "../../../../../store/reducers/notificationsCache";
import { getAuthentication } from "../../../../../store/reducers/stateCache";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";
import { Alert as AlertDecline } from "../../../../components/Alert";
import { CardDetailsBlock } from "../../../../components/CardDetails";
import { CredentialDetailModal } from "../../../../components/CredentialDetailModule";
import {
  MemberAcceptStatus,
  MultisigMember,
} from "../../../../components/CredentialDetailModule/components";
import { InfoCard } from "../../../../components/InfoCard";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { Spinner } from "../../../../components/Spinner";
import { Verification } from "../../../../components/Verification";
import { BackEventPriorityType, IDENTIFIER_BG_MAPPING } from "../../../../globals/types";
import {
  useIonHardwareBackButton,
  useOnlineStatusEffect,
} from "../../../../hooks";
import { showError } from "../../../../utils/error";
import { combineClassNames } from "../../../../utils/style";
import { NotificationDetailsProps } from "../../NotificationDetails.types";
import "./ReceiveCredential.scss";
import { IdentifierDetailModal } from "../../../../components/IdentifierDetailModule";
import { LinkedGroupInfoGrant } from "../../../../../core/agent/services/ipexCommunicationService.types";

const ANIMATION_DELAY = 2600;

const ReceiveCredential = ({
  pageId,
  activeStatus,
  notificationDetails,
  handleBack,
}: NotificationDetailsProps) => {
  const dispatch = useAppDispatch();
  const notificationsCache = useAppSelector(getNotificationsCache);
  const [notifications, setNotifications] = useState(notificationsCache);
  const userName = useAppSelector(getAuthentication)?.userName;
  const connectionsCache = useAppSelector(getConnectionsCache);
  const multisignConnectionsCache = useAppSelector(getMultisigConnectionsCache);
  const fallbackLogo = KeriLogo;
  const [alertDeclineIsOpen, setAlertDeclineIsOpen] = useState(false);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [showCommonError, setShowCommonError] = useState(false);
  const [credDetail, setCredDetail] = useState<ACDCDetails>();
  const [multisigMemberStatus, setMultisigMemberStatus] =
    useState<LinkedGroupInfoGrant>({
      threshold: "0",
      members: [],
      othersJoined: [],
      linkedGroupRequest: {
        accepted: false,
      }
    });
  const [isLoading, setIsLoading] = useState(false);
  const identifiersData = useAppSelector(getIdentifiersCache);

  const isMultisig = credDetail?.identifierType === IdentifierType.Group;
  const [isRevoked, setIsRevoked] = useState(false);
  const [openIdentifierDetail, setOpenIdentifierDetail] = useState(false);

  const connection =
    connectionsCache?.[notificationDetails.connectionId]?.label || i18n.t("connections.unknown");

  const userAccepted = multisigMemberStatus.linkedGroupRequest.accepted;
  const maxThreshold =
    isMultisig &&
    (multisigMemberStatus.othersJoined.length + (multisigMemberStatus.linkedGroupRequest.accepted ? 1 : 0)) >=
      Number(multisigMemberStatus.threshold);

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

  const getMultiSigMemberStatus = useCallback(async () => {
    try {
      const result =
        await Agent.agent.ipexCommunications.getLinkedGroupFromIpexGrant(
          notificationDetails.id
        );

      setMultisigMemberStatus(result);
    } catch (e) {
      setInitiateAnimation(false);
      showError("Unable to get group members", e, dispatch);
    }
  }, [dispatch, notificationDetails.id]);

  const getAcdc = useCallback(async () => {
    try {
      setIsLoading(true);
      const credential =
        await Agent.agent.ipexCommunications.getAcdcFromIpexGrant(
          notificationDetails.a.d as string
        );

      const identifier = identifiersData.find(
        (identifier) => identifier.id === credential.identifierId
      );

      // @TODO: identifierType is not needed to render the component so this could be optimised. If it's needed, it should be fetched in the core for simplicity.
      const identifierType =
        identifier?.groupMetadata || identifier?.multisigManageAid
          ? IdentifierType.Group
          : IdentifierType.Individual;

      setCredDetail({ ...credential, identifierType });

      if(credential.lastStatus.s === "1") {
        setIsRevoked(true);
      }

      if (identifierType === IdentifierType.Group) {
        await getMultiSigMemberStatus();
      }
    } catch (e) {
      setShowCommonError(true);
      setTimeout(handleBack);
      setInitiateAnimation(false);
      showError("Unable to get acdc", e, dispatch);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, getMultiSigMemberStatus, handleBack, identifiersData, notificationDetails.a.d]);

  useOnlineStatusEffect(getAcdc);

  const handleDelete = async () => {
    try {
      await Agent.agent.keriaNotifications.deleteNotificationRecordById(
        notificationDetails.id,
        notificationDetails.a.r as NotificationRoute
      );
      dispatch(deleteNotification(notificationDetails));
      handleBack();
    } catch (e) {
      showError("Unable to remove notification", e, dispatch);
    }
  };

  const handleAccept = async () => {
    try {
      const startTime = Date.now();
      setInitiateAnimation(true);

      // @TODO - foconnor: Should be refined in the upcoming UI ticket
      //   If multisigMemberStatus.members.length && multisigMemberStatus.members[0] === identifier?.multisigManageAid, we can call admitAcdc
      //   Otherwise, can call joinMultisigAdmit IF multisigMemberStatus.linkedGroupRequest.current !== undefined
      if (multisigMemberStatus.linkedGroupRequest.current) {
        await Agent.agent.ipexCommunications.joinMultisigAdmit(notificationDetails.id);
      } else {
        await Agent.agent.ipexCommunications.admitAcdc(notificationDetails.id);
      }
      const finishTime = Date.now();

      setTimeout(() => {
        if (!isMultisig) {
          handleNotificationUpdate();
        }

        handleBack();
        setOpenInfo(false);
      }, ANIMATION_DELAY - (finishTime - startTime));
    } catch (e) {
      setInitiateAnimation(false);
      showError("Unable to accept acdc", e, dispatch);
    }
  };

  const handleDecline = async () => {
    try {
      await Agent.agent.keriaNotifications.deleteNotificationRecordById(
        notificationDetails.id,
        notificationDetails.a.r as NotificationRoute
      );
      handleNotificationUpdate();
      handleBack();
    } catch (e) {
      showError("Unable to decline acdc", e, dispatch);
    }
  };

  const classes = combineClassNames(`${pageId}-receive-credential`, {
    "animation-on": initiateAnimation,
    "animation-off": !initiateAnimation,
    "pending-multisig": userAccepted && isMultisig,
    "ion-hide": isLoading || showCommonError,
    revoked: isRevoked,
  });

  const identifier = useMemo(() => {
    return identifiersData.find(item => item.id === credDetail?.identifierId)
  }, [credDetail?.identifierId, identifiersData]);

  const getStatus = useCallback(
    (member: string): MemberAcceptStatus => {
      if (multisigMemberStatus.othersJoined.includes(member)) {
        return MemberAcceptStatus.Accepted;
      }

      if (multisigMemberStatus.linkedGroupRequest.accepted && identifier?.multisigManageAid === member) {
        return MemberAcceptStatus.Accepted;
      }

      return MemberAcceptStatus.Waiting;
    },
    [multisigMemberStatus.othersJoined, multisigMemberStatus.linkedGroupRequest, identifier]
  );

  const members = useMemo(() => {
    return multisigMemberStatus.members.map((member) => {
      const memberConnection = multisignConnectionsCache[member];

      let name = memberConnection?.label || member;

      if (!memberConnection?.label) {
        name = userName;
      }

      return {
        id: member,
        name,
      };
    });
  }, [multisigMemberStatus.members, multisignConnectionsCache, userName]);

  const handleConfirm = () => {
    setVerifyIsOpen(true);
  };

  return (
    <>
      <Spinner data-testid="spinner" show={isLoading} />
      <ScrollablePageLayout
        pageId={`${pageId}-receive-credential`}
        customClass={classes}
        activeStatus={activeStatus}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={handleBack}
            closeButtonLabel={`${i18n.t(
              "tabs.notifications.details.buttons.close"
            )}`}
            title={`${i18n.t(
              "tabs.notifications.details.credential.receive.title"
            )}`}
          />
        }
        footer={
          !userAccepted && (
            <PageFooter
              pageId={pageId}
              primaryButtonText={isRevoked ? undefined : `${i18n.t(
                maxThreshold
                  ? "tabs.notifications.details.buttons.addcred"
                  : "tabs.notifications.details.buttons.accept"
              )}`}
              primaryButtonAction={handleConfirm}
              secondaryButtonText={
                maxThreshold || isRevoked
                  ? undefined
                  : `${i18n.t("tabs.notifications.details.buttons.decline")}`
              }
              secondaryButtonAction={
                maxThreshold ? undefined : () => setAlertDeclineIsOpen(true)
              }
              deleteButtonText={
                isRevoked
                  ? `${i18n.t("tabs.notifications.details.buttons.delete")}`
                  : undefined
              }
              deleteButtonAction={handleConfirm}
            />
          )
        }
      >
        {isRevoked && (
          <InfoCard className="alert" content={i18n.t("tabs.notifications.details.credential.receive.revokedalert")} icon={alertCircleOutline}/>
        )}
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
                {i18n.t(
                  "tabs.notifications.details.credential.receive.receivefrom"
                )}
              </span>
              <strong className="credential-type">
                {credDetail?.s?.title}
              </strong>
              <span className="break-text">
                {i18n.t("tabs.notifications.details.credential.receive.from")}
              </span>
              <strong>{connection}</strong>
            </IonCol>
          </div>
          <div className="request-status">
            <IonCol size="12">
              <strong>
                {i18n.t(
                  "tabs.notifications.details.credential.receive.credentialpending"
                )}
              </strong>
            </IonCol>
          </div>
          <div className="credential-detail">
            <IonButton
              fill="outline"
              className="credential-button secondary-button"
              onClick={() => setOpenInfo(true)}
              data-testid="cred-detail-btn"
            >
              <IonIcon
                slot="start"
                icon={informationCircleOutline}
              />
              {i18n.t(
                "tabs.notifications.details.credential.receive.credentialdetailbutton"
              )}
            </IonButton>
          </div>
          {isMultisig && (
            <CardDetailsBlock
              className="group-members"
              title={i18n.t(
                "tabs.notifications.details.credential.receive.members"
              )}
            >
              {members.map(({ id, name }) => (
                <MultisigMember
                  key={id}
                  name={name}
                  status={getStatus(id)}
                />
              ))}
            </CardDetailsBlock>
          )}
          {identifier && 
          <CardDetailsBlock
            className="related-identifiers"
            title={i18n.t(
              "tabs.notifications.details.credential.receive.relatedidentifier"
            )}
          >
            <IonItem
              lines="none"
              className="related-identifier"
              onClick={() => setOpenIdentifierDetail(true)}
              data-testid="related-identifier-detail"
            >
              <img
                className="theme"
                slot="start"
                src={IDENTIFIER_BG_MAPPING[identifier.theme] as string}
                alt="theme"
              />
              <IonText
                slot="start"
                className="identifier-name"
              >
                {identifier.displayName}
              </IonText>
              <IonIcon
                slot="end"
                icon={informationCircleOutline}
              />
            </IonItem>
          </CardDetailsBlock>}
        </div>
      </ScrollablePageLayout>
      <AlertDecline
        isOpen={alertDeclineIsOpen}
        setIsOpen={setAlertDeclineIsOpen}
        dataTestId="multisig-request-alert-decline"
        headerText={i18n.t(
          "tabs.notifications.details.identifier.alert.textdecline"
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
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={isRevoked ? handleDelete : handleAccept}
      />
      <CredentialDetailModal
        pageId="receive-credential-detail"
        isOpen={openInfo}
        setIsOpen={setOpenInfo}
        onClose={() => setOpenInfo(false)}
        id={credDetail?.id || ""}
        credDetail={credDetail}
        viewOnly
      />
      {
        credDetail && <IdentifierDetailModal 
          isOpen={openIdentifierDetail} 
          setIsOpen={setOpenIdentifierDetail}
          pageId="identifier-detail"
          identifierDetailId={credDetail.identifierId}
        />
      }
    </>
  );
};

export { ReceiveCredential };
