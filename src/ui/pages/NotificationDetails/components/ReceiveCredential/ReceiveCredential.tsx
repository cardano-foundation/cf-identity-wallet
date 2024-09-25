import { IonButton, IonCol, IonIcon } from "@ionic/react";
import {
  checkmark,
  informationCircleOutline,
  personCircleOutline,
  swapHorizontalOutline,
} from "ionicons/icons";
import { useCallback, useState } from "react";
import { Agent } from "../../../../../core/agent/agent";
import { NotificationRoute } from "../../../../../core/agent/agent.types";
import { i18n } from "../../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import { getConnectionsCache } from "../../../../../store/reducers/connectionsCache";
import {
  getNotificationsCache,
  setNotificationsCache,
} from "../../../../../store/reducers/notificationsCache";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";
import { Alert as AlertDecline } from "../../../../components/Alert";
import { ResponsivePageLayout } from "../../../../components/layout/ResponsivePageLayout";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { Verification } from "../../../../components/Verification";
import { BackEventPriorityType } from "../../../../globals/types";
import {
  useIonHardwareBackButton,
  useOnlineStatusEffect,
} from "../../../../hooks";
import { showError } from "../../../../utils/error";
import { combineClassNames } from "../../../../utils/style";
import { NotificationDetailsProps } from "../../NotificationDetails.types";
import "./ReceiveCredential.scss";
import {
  ACDCDetails,
  CredentialStatus,
} from "../../../../../core/agent/services/credentialService.types";
import { CredentialDetailModal } from "../../../../components/CredentialDetailModule";
import { Spinner } from "../../../../components/Spinner";

const ANIMATION_DELAY = 2000;

const ReceiveCredential = ({
  pageId,
  activeStatus,
  notificationDetails,
  handleBack,
}: NotificationDetailsProps) => {
  const dispatch = useAppDispatch();
  const notificationsCache = useAppSelector(getNotificationsCache);
  const [notifications, setNotifications] = useState(notificationsCache);
  const connectionsCache = useAppSelector(getConnectionsCache);
  const fallbackLogo = KeriLogo;
  const [alertDeclineIsOpen, setAlertDeclineIsOpen] = useState(false);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [credDetail, setCreDetail] = useState<ACDCDetails>();
  const [isLoading, setIsLoading] = useState(false);

  const connection =
    connectionsCache?.[notificationDetails.connectionId]?.label;

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

  const getAcdc = useCallback(async () => {
    try {
      setIsLoading(true);
      const credential =
        await Agent.agent.ipexCommunications.getAcdcFromIpexGrant(
          notificationDetails.a.d as string
        );

      setCreDetail({
        ...credential,
        status: CredentialStatus.CONFIRMED,
        credentialType: credential.s.title,
        issuanceDate: credential.a.dt,
      });
    } catch (e) {
      setInitiateAnimation(false);
      showError("Unable to get acdc", e, dispatch);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, notificationDetails.a.d]);

  useOnlineStatusEffect(getAcdc);

  const handleAccept = async () => {
    try {
      const startTime = Date.now();
      setInitiateAnimation(true);
      await Agent.agent.ipexCommunications.acceptAcdc(notificationDetails.id);
      const finishTime = Date.now();

      setTimeout(() => {
        handleNotificationUpdate();
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
  });

  return (
    <>
      <ResponsivePageLayout
        pageId={`${pageId}-receive-credential`}
        customClass={classes}
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
              <strong className="credential-type">
                {credDetail?.credentialType}
              </strong>
              <span className="break-text">
                {i18n.t("notifications.details.credential.receive.from")}
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
                "notifications.details.credential.receive.credentialdetailbutton"
              )}
            </IonButton>
          </div>
        </div>
        <PageFooter
          pageId={pageId}
          primaryButtonText={`${i18n.t(
            "notifications.details.buttons.accept"
          )}`}
          primaryButtonAction={() => setVerifyIsOpen(true)}
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
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={handleAccept}
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
      <Spinner show={isLoading} />
    </>
  );
};

export { ReceiveCredential };
