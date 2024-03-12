import { personCircleOutline } from "ionicons/icons";
import i18next from "i18next";
import { useEffect, useState } from "react";
import { IonCard, IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../../components/PageFooter";
import { RequestProps } from "../IncomingRequest.types";
import {
  Alert as AlertAccept,
  Alert as AlertDecline,
} from "../../../components/Alert";
import { ScrollablePageLayout } from "../../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../../components/PageHeader";

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

  useEffect(() => {
    console.log(requestData);
  }, [requestData]);

  return (
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
      <p className="multi-sig-request-subtitle">
        {i18n.t("request.multisig.subtitle")}
      </p>
      <div className="multi-sig-request-section">
        <h4>{i18n.t("request.multisig.requestfrom")}</h4>
        <IonCard className="multi-sig-request-details">
          <IonList lines="none">
            <IonItem className="request-item">
              <IonIcon
                aria-hidden="true"
                icon={personCircleOutline}
                slot="start"
              />
              <IonLabel>John Smith</IonLabel>
            </IonItem>
          </IonList>
        </IonCard>
      </div>
      <div className="multi-sig-request-section">
        <h4>{i18n.t("request.multisig.othermembers")}</h4>
        <IonCard className="multi-sig-request-details">
          <IonList lines="none">
            {/* {requestData.map((item, index) => {
            return (
              <IonItem
                key={index}
                className="security-item"
                data-testid={`security-item-${index}`}
              >
                <IonIcon
                  aria-hidden="true"
                  icon={personCircleOutline}
                  slot="start"
                />
                <IonLabel>{item.label}</IonLabel>
              </IonItem>
            );
          })} */}
            <IonItem className="request-item">
              <IonIcon
                aria-hidden="true"
                icon={personCircleOutline}
                slot="start"
              />
              <IonLabel>Frank</IonLabel>
            </IonItem>
            <IonItem className="request-item">
              <IonIcon
                aria-hidden="true"
                icon={personCircleOutline}
                slot="start"
              />
              <IonLabel>Bob</IonLabel>
            </IonItem>
          </IonList>
        </IonCard>
      </div>
      <div className="multi-sig-request-section">
        <h4>{i18n.t("request.multisig.threshold")}</h4>
        <IonCard className="multi-sig-request-details">
          <IonList lines="none">
            <IonItem className="request-item">
              <IonLabel>1</IonLabel>
            </IonItem>
          </IonList>
        </IonCard>
      </div>
      <PageFooter
        pageId={pageId}
        primaryButtonText={`${i18n.t("request.button.accept")}`}
        primaryButtonAction={() => setAlertAcceptIsOpen(true)}
        secondaryButtonText={`${i18n.t("request.button.decline")}`}
        secondaryButtonAction={() => setAlertDeclineIsOpen(true)}
      />
      <AlertAccept
        isOpen={alertAcceptIsOpen}
        setIsOpen={setAlertAcceptIsOpen}
        dataTestId="multi-sig-request-alert"
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
        dataTestId="multi-sig-request-alert"
        headerText={i18n.t("request.multisig.alert.textdecline")}
        confirmButtonText={`${i18n.t("request.multisig.alert.decline")}`}
        cancelButtonText={`${i18n.t("request.multisig.alert.cancel")}`}
        actionConfirm={() => actionDecline()}
        actionCancel={() => setAlertDeclineIsOpen(false)}
        actionDismiss={() => setAlertDeclineIsOpen(false)}
      />
    </ScrollablePageLayout>
  );
};

export { MultiSigRequest };
