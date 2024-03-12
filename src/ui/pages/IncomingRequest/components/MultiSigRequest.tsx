import {
  personCircleOutline,
  hourglassOutline,
  checkmark,
} from "ionicons/icons";
import i18next from "i18next";
import { useEffect, useState } from "react";
import {
  IonCard,
  IonChip,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
} from "@ionic/react";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../../components/PageFooter";
import { RequestProps } from "../IncomingRequest.types";
import {
  Alert as AlertAccept,
  Alert as AlertDecline,
} from "../../../components/Alert";
import { ScrollablePageLayout } from "../../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../../components/PageHeader";
import { ConnectionStatus } from "../../../../core/agent/agent.types";
import CardanoLogo from "../../../../ui/assets/images/CardanoLogo.jpg";

const MultiSigRequest = ({
  pageId,
  requestData,
  initiateAnimation,
  handleAccept,
  handleCancel,
  handleIgnore,
}: RequestProps) => {
  const [alertAcceptIsOpen, setAlertAcceptIsOpen] = useState(false);
  const [alertDeclineIsOpen, setAlertDeclineIsOpen] = useState(false);

  const actionAccept = () => {
    setAlertAcceptIsOpen(false);
    handleAccept();
  };

  const actionDecline = () => {
    setAlertDeclineIsOpen(false);
    handleCancel();
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={pageId}
        activeStatus={!!requestData}
        customClass={`${requestData ? "show" : "hide"} ${
          initiateAnimation ? "animation-on" : "animation-off"
        }`}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={() => handleIgnore && handleIgnore()}
            closeButtonLabel={`${i18n.t("request.button.ignore")}`}
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
                      <img
                        src={
                          requestData.multisigIcpDetails?.sender.logo ??
                          CardanoLogo
                        }
                        alt="multisig-connection-logo"
                      />
                    </IonCol>
                    <IonCol
                      size="10.35"
                      className="multisig-connection-info"
                    >
                      <IonLabel>
                        {requestData.multisigIcpDetails?.sender.label}
                      </IonLabel>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            </IonList>
          </IonCard>
        </div>
        <div className="multisig-request-section">
          <h4>{i18n.t("request.multisig.othermembers")}</h4>
          <IonCard className="multisig-request-details">
            <IonList lines="none">
              {requestData.multisigIcpDetails?.otherConnections.map(
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
                              src={connection.logo ?? CardanoLogo}
                              alt="multisig-connection-logo"
                            />
                          </IonCol>
                          <IonCol
                            size="6.25"
                            className="multisig-connection-info"
                          >
                            <IonLabel>{connection.label}</IonLabel>
                          </IonCol>
                          <IonCol
                            size="3.75"
                            className="multisig-connection-status"
                          >
                            <IonChip
                              className={
                                connection.status === ConnectionStatus.ACCEPTED
                                  ? "accepted"
                                  : ""
                              }
                            >
                              <IonIcon
                                icon={
                                  connection.status === ConnectionStatus.PENDING
                                    ? hourglassOutline
                                    : checkmark
                                }
                                color="primary"
                              />
                              <span>{connection.status}</span>
                            </IonChip>
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
        <div className="multisig-request-section">
          <h4>{i18n.t("request.multisig.threshold")}</h4>
          <IonCard className="multisig-request-details">
            <IonList lines="none">
              <IonItem className="multisig-request-item">
                <IonLabel>{requestData.multisigIcpDetails?.threshold}</IonLabel>
              </IonItem>
            </IonList>
          </IonCard>
        </div>
      </ScrollablePageLayout>
      <PageFooter
        pageId={pageId}
        customClass="multisig-request-footer"
        primaryButtonText={`${i18n.t("request.button.accept")}`}
        primaryButtonAction={() => setAlertAcceptIsOpen(true)}
        secondaryButtonText={`${i18n.t("request.button.decline")}`}
        secondaryButtonAction={() => setAlertDeclineIsOpen(true)}
      />
      <AlertAccept
        isOpen={alertAcceptIsOpen}
        setIsOpen={setAlertAcceptIsOpen}
        dataTestId="multisig-request-alert"
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
        dataTestId="multisig-request-alert"
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
