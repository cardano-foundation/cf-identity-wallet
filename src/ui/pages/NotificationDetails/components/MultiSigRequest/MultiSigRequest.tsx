import {
  IonCard,
  IonList,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import { personCircleOutline } from "ionicons/icons";
import { useCallback, useState } from "react";
import { Alert as AlertDecline } from "../../../../components/Alert";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../../../store/reducers/identifiersCache";
import { Agent } from "../../../../../core/agent/agent";
import {
  IdentifierShortDetails,
  MultiSigIcpRequestDetails,
} from "../../../../../core/agent/services/identifier.types";
import { BackEventPriorityType, ToastMsgType } from "../../../../globals/types";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../../../components/PageHeader";
import { i18n } from "../../../../../i18n";
import { PageFooter } from "../../../../components/PageFooter";
import "./MultiSigRequest.scss";
import {
  CreateIdentifierResult,
  NotificationRoute,
} from "../../../../../core/agent/agent.types";
import { NotificationDetailsProps } from "../../NotificationDetails.types";
import {
  getNotificationsCache,
  setNotificationsCache,
} from "../../../../../store/reducers/notificationsCache";
import {
  useIonHardwareBackButton,
  useOnlineStatusEffect,
} from "../../../../hooks";
import { MultiSigService } from "../../../../../core/agent/services/multiSigService";
import { ErrorPage } from "./ErrorPage";

const MultiSigRequest = ({
  pageId,
  activeStatus,
  notificationDetails,
  handleBack,
}: NotificationDetailsProps) => {
  const dispatch = useAppDispatch();
  const notificationsCache = useAppSelector(getNotificationsCache);
  const [notifications, setNotifications] = useState(notificationsCache);
  const [spinner, setSpinner] = useState(false);
  const identifiersData = useAppSelector(getIdentifiersCache);
  const [alertDeclineIsOpen, setAlertDeclineIsOpen] = useState(false);
  const [multisigIcpDetails, setMultisigIcpDetails] =
    useState<MultiSigIcpRequestDetails | null>(null);
  const [showErrorPage, setShowErrorPage] = useState(false);

  useIonHardwareBackButton(
    BackEventPriorityType.Page,
    handleBack,
    !activeStatus
  );

  const getDetails = useCallback(async () => {
    try {
      const details = await Agent.agent.multiSigs.getMultisigIcpDetails(
        notificationDetails.a.d as string
      );
      setMultisigIcpDetails(details);
      setShowErrorPage(false);
    } catch (e) {
      if (
        (e as Error).message === MultiSigService.UNKNOWN_AIDS_IN_MULTISIG_ICP
      ) {
        setShowErrorPage(true);
      }
    }
  }, [notificationDetails.a.d]);

  useOnlineStatusEffect(getDetails);

  const handleNotificationUpdate = async () => {
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== notificationDetails.id
    );
    setNotifications(updatedNotifications);
    dispatch(setNotificationsCache(updatedNotifications));
  };

  const actionAccept = async () => {
    document?.querySelector("ion-router-outlet")?.classList.add("blur");
    setSpinner(true);
    if (!multisigIcpDetails) {
      throw new Error(
        "Cannot accept a multi-sig inception event before details are loaded from core"
      );
    } else {
      const { identifier, signifyName, isPending } =
        (await Agent.agent.multiSigs.joinMultisig(
          notificationDetails.id,
          notificationDetails.a.r as NotificationRoute,
          notificationDetails.a.d as string,
          {
            theme: multisigIcpDetails.ourIdentifier.theme,
            displayName: multisigIcpDetails.ourIdentifier.displayName,
          }
        )) as CreateIdentifierResult;

      if (identifier) {
        const newIdentifier: IdentifierShortDetails = {
          id: identifier,
          displayName: multisigIcpDetails.ourIdentifier.displayName,
          createdAtUTC: `${notificationDetails?.createdAt}`,
          theme: multisigIcpDetails.ourIdentifier.theme,
          isPending: !!isPending,
          signifyName,
        };
        const filteredIdentifiersData = identifiersData.filter(
          (item) => item.id !== multisigIcpDetails?.ourIdentifier.id
        );
        dispatch(
          setIdentifiersCache([...filteredIdentifiersData, newIdentifier])
        );
        multisigIcpDetails.threshold === 1
          ? ToastMsgType.IDENTIFIER_CREATED
          : ToastMsgType.IDENTIFIER_REQUESTED;
      }
    }
    handleNotificationUpdate();
    document?.querySelector("ion-router-outlet")?.classList.remove("blur");
    setSpinner(false);
    handleBack();
  };

  const actionDecline = async () => {
    setAlertDeclineIsOpen(false);
    await Agent.agent.signifyNotifications.deleteNotificationRecordById(
      notificationDetails.id,
      notificationDetails.a.r as NotificationRoute
    );
    handleNotificationUpdate();
    handleBack();
  };

  const handleDeclineClick = useCallback(() => setAlertDeclineIsOpen(true), []);

  if (showErrorPage) {
    return (
      <ErrorPage
        pageId={pageId}
        handleBack={handleBack}
        activeStatus={activeStatus}
        notificationDetails={notificationDetails}
        onFinishSetup={() => {
          setShowErrorPage(false);
          setMultisigIcpDetails(null);
          getDetails();
        }}
      />
    );
  }

  if (!multisigIcpDetails) {
    return (
      <div
        className="multisig-request-spinner-container"
        data-testid="multisig-request-spinner-container"
      >
        <IonSpinner name="circular" />
      </div>
    );
  }

  return (
    <>
      <ScrollablePageLayout
        pageId={`${pageId}-multi-sig-request`}
        customClass={`${pageId}-multi-sig-request setup-identifier ${
          spinner ? "blur" : ""
        }`}
        activeStatus={activeStatus}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={handleBack}
            closeButtonLabel={`${i18n.t(
              "notifications.details.buttons.close"
            )}`}
            title={`${i18n.t("notifications.details.identifier.title")}`}
          />
        }
      >
        <p className="multisig-request-subtitle">
          {i18n.t("notifications.details.identifier.subtitle")}
        </p>
        <div className="multisig-request-section">
          <h4>{i18n.t("notifications.details.identifier.requestfrom")}</h4>
          <IonCard className="multisig-request-details">
            <IonList lines="none">
              <IonItem className="multisig-request-item">
                <IonGrid>
                  <IonRow>
                    <IonCol
                      size="1.25"
                      className="multisig-connection-logo"
                    >
                      {multisigIcpDetails?.sender.logo ? (
                        <img
                          data-testid="multisig-connection-logo"
                          src={multisigIcpDetails?.sender.logo}
                          alt="multisig-connection-logo"
                        />
                      ) : (
                        <div
                          data-testid="multisig-connection-fallback-logo"
                          className="multisig-request-user-logo"
                        >
                          <IonIcon
                            icon={personCircleOutline}
                            color="light"
                          />
                        </div>
                      )}
                    </IonCol>
                    <IonCol
                      size="10.35"
                      className="multisig-connection-info"
                    >
                      <IonLabel>{multisigIcpDetails?.sender.label}</IonLabel>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            </IonList>
          </IonCard>
        </div>
        {!!multisigIcpDetails?.otherConnections.length && (
          <div className="multisig-request-section">
            <h4>{i18n.t("notifications.details.identifier.othermembers")}</h4>
            <IonCard className="multisig-request-details">
              <IonList lines="none">
                {multisigIcpDetails?.otherConnections.map(
                  (connection, index) => {
                    return (
                      <IonItem
                        key={index}
                        className="multisig-request-item"
                        data-testid={`multisig-connection-${index}`}
                      >
                        <IonGrid>
                          <IonRow>
                            <IonCol
                              size="1.25"
                              className="multisig-connection-logo"
                            >
                              <img
                                data-testid={`other-multisig-connection-logo-${index}`}
                                src={connection.logo || KeriLogo}
                                alt="multisig-connection-logo"
                              />
                            </IonCol>
                            <IonCol
                              size="10.35"
                              className="multisig-connection-info"
                            >
                              <IonLabel>{connection.label}</IonLabel>
                            </IonCol>
                          </IonRow>
                        </IonGrid>
                      </IonItem>
                    );
                  }
                )}
              </IonList>
            </IonCard>
          </div>
        )}
        <div className="multisig-request-section">
          <h4>{i18n.t("notifications.details.identifier.threshold")}</h4>
          <IonCard className="multisig-request-details">
            <IonList lines="none">
              <IonItem className="multisig-request-item">
                <IonLabel>{multisigIcpDetails?.threshold}</IonLabel>
              </IonItem>
            </IonList>
          </IonCard>
        </div>
      </ScrollablePageLayout>
      <PageFooter
        pageId={pageId}
        customClass="multisig-request-footer"
        primaryButtonText={`${i18n.t("notifications.details.buttons.accept")}`}
        primaryButtonAction={() => actionAccept()}
        secondaryButtonText={`${i18n.t(
          "notifications.details.buttons.decline"
        )}`}
        secondaryButtonAction={handleDeclineClick}
      />
      <AlertDecline
        isOpen={alertDeclineIsOpen}
        setIsOpen={setAlertDeclineIsOpen}
        dataTestId="multisig-request-alert-decline"
        headerText={i18n.t(
          "notifications.details.identifier.alert.textdecline"
        )}
        confirmButtonText={`${i18n.t("notifications.details.buttons.decline")}`}
        cancelButtonText={`${i18n.t("notifications.details.buttons.cancel")}`}
        actionConfirm={() => actionDecline()}
        actionCancel={() => setAlertDeclineIsOpen(false)}
        actionDismiss={() => setAlertDeclineIsOpen(false)}
      />
      {spinner && (
        <div
          className="multisig-spinner-container"
          data-testid="multisig-spinner-container"
        >
          <IonSpinner name="circular" />
        </div>
      )}
    </>
  );
};

export { MultiSigRequest };
