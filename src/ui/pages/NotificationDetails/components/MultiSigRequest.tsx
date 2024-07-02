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
import {
  Alert as AlertAccept,
  Alert as AlertDecline,
} from "../../../components/Alert";
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
  handleCancel,
}: {
  notificationDetails: KeriaNotification;
  handleCancel: () => void;
}) => {
  const pageId = "notification-details";
  const dispatch = useAppDispatch();
  const [activeStatus, setActiveStatus] = useState(true);
  const blur = false;
  const identifiersData = useAppSelector(getIdentifiersCache);
  const [alertAcceptIsOpen, setAlertAcceptIsOpen] = useState(false);
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
    setAlertAcceptIsOpen(false);
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
    // handleAccept();
  };

  const actionDecline = () => {
    setAlertDeclineIsOpen(false);
    handleCancel();
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
        pageId={pageId}
        activeStatus={activeStatus}
        customClass={`setup-identifier ${blur ? "blur" : ""}`}
        header={
          <PageHeader
            onBack={handleCancel}
            title={`${i18n.t("request.multisig.title")}`}
          />
        }
      >
        <p className="multisig-request-subtitle">
          {i18n.t("request.multisig.subtitle")}
        </p>
        <div className="multisig-request-section">
          <h4>{i18n.t("request.multisig.requestfrom")}</h4>
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
                          className="request-user-logo"
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
            <h4>{i18n.t("request.multisig.othermembers")}</h4>
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
          <h4>{i18n.t("request.multisig.threshold")}</h4>
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
          primaryButtonText={`${i18n.t("request.button.accept")}`}
          primaryButtonAction={() => setAlertAcceptIsOpen(true)}
          secondaryButtonText={`${i18n.t("request.button.decline")}`}
          secondaryButtonAction={handleDeclineClick}
        />
      </ScrollablePageLayout>
      <AlertAccept
        isOpen={alertAcceptIsOpen}
        setIsOpen={setAlertAcceptIsOpen}
        dataTestId="multisig-request-alert-accept"
        headerText={i18n.t("request.multisig.alert.textaccept")}
        confirmButtonText={`${i18n.t("request.multisig.alert.accept")}`}
        cancelButtonText={`${i18n.t("request.multisig.alert.cancel")}`}
        actionConfirm={() => actionAccept()}
        actionCancel={() => setAlertAcceptIsOpen(false)}
        actionDismiss={() => setAlertAcceptIsOpen(false)}
      />
      <AlertDecline
        isOpen={alertDeclineIsOpen}
        setIsOpen={setAlertDeclineIsOpen}
        dataTestId="multisig-request-alert-decline"
        headerText={i18n.t("request.multisig.alert.textdecline")}
        confirmButtonText={`${i18n.t("request.multisig.alert.decline")}`}
        cancelButtonText={`${i18n.t("request.multisig.alert.cancel")}`}
        actionConfirm={() => actionDecline()}
        actionCancel={() => setAlertDeclineIsOpen(false)}
        actionDismiss={() => setAlertDeclineIsOpen(false)}
      />
    </>
  );
};

export { MultiSigRequest };
