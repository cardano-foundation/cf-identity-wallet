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
import { useCallback, useEffect, useState } from "react";
import { Alert as AlertDecline } from "../../../components/Alert";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../../store/reducers/identifiersCache";
import { Agent } from "../../../../core/agent/agent";
import {
  IdentifierShortDetails,
  MultiSigIcpRequestDetails,
} from "../../../../core/agent/services/identifier.types";
import { ToastMsgType } from "../../../globals/types";
import { ScrollablePageLayout } from "../../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../../components/PageHeader";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../../components/PageFooter";
import "./MultiSigRequest.scss";
import {
  CreateIdentifierResult,
  KeriaNotification,
} from "../../../../core/agent/agent.types";

const MultiSigRequest = ({
  notificationDetails,
  handleBack,
}: {
  notificationDetails: KeriaNotification;
  handleBack: () => void;
}) => {
  const pageId = "notification-details";
  const dispatch = useAppDispatch();
  const [activeStatus, setActiveStatus] = useState(true);
  const blur = false;
  const identifiersData = useAppSelector(getIdentifiersCache);
  const [alertDeclineIsOpen, setAlertDeclineIsOpen] = useState(false);
  const [multisigIcpDetails, setMultisigIcpDetails] =
    useState<MultiSigIcpRequestDetails | null>(null);

  const getDetails = async () => {
    const details = await Agent.agent.multiSigs.getMultisigIcpDetails(
      notificationDetails.a.d as string
    );
    setMultisigIcpDetails(details);
  };

  useEffect(() => {
    getDetails();
  }, []);

  const actionAccept = async () => {
    // setBlur && setBlur(true);
    if (!(notificationDetails && multisigIcpDetails)) {
      return;
    } else {
      const { identifier, signifyName, isPending } =
        (await Agent.agent.multiSigs.joinMultisig(
          notificationDetails.id,
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
    handleBack();
  };

  const actionDecline = () => {
    setAlertDeclineIsOpen(false);
    handleBack();
  };

  const handleDeclineClick = useCallback(() => setAlertDeclineIsOpen(true), []);

  return (
    <>
      {blur && (
        <div
          className="multisig-spinner-container"
          data-testid="multisig-spinner-container"
        >
          <IonSpinner name="circular" />
        </div>
      )}
      <ScrollablePageLayout
        pageId={`${pageId}-multi-sig-request`}
        customClass={`${pageId}-multi-sig-request setup-identifier ${
          blur ? "blur" : ""
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
        <PageFooter
          pageId={pageId}
          customClass="multisig-request-footer"
          primaryButtonText={`${i18n.t(
            "notifications.details.buttons.accept"
          )}`}
          primaryButtonAction={() => actionAccept()}
          secondaryButtonText={`${i18n.t(
            "notifications.details.buttons.decline"
          )}`}
          secondaryButtonAction={handleDeclineClick}
        />
      </ScrollablePageLayout>
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
    </>
  );
};

export { MultiSigRequest };
