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
import { useState } from "react";
import {
  Alert as AlertAccept,
  Alert as AlertDecline,
} from "../../../../../components/Alert";
import KeriLogo from "../../../../../assets/images/KeriGeneric.jpg";
import { RequestProps } from "../IncomingRequest.types";
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import {
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../../../../store/reducers/identifiersCache";
import { Agent } from "../../../../../../core/agent/agent";
import { IdentifierShortDetails } from "../../../../../../core/agent/services/identifier.types";
import { ToastMsgType } from "../../../../../globals/types";
import { ScrollablePageLayout } from "../../../../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../../../../components/PageHeader";
import { i18n } from "../../../../../../i18n";
import { PageFooter } from "../../../../../components/PageFooter";
import "./MultiSigRequest.scss";

const MultiSigRequest = ({
  blur,
  setBlur,
  pageId,
  activeStatus,
  requestData,
  handleAccept,
  handleCancel,
  handleIgnore,
}: RequestProps) => {
  const dispatch = useAppDispatch();
  const identifiersData = useAppSelector(getIdentifiersCache);
  const [alertAcceptIsOpen, setAlertAcceptIsOpen] = useState(false);
  const [alertDeclineIsOpen, setAlertDeclineIsOpen] = useState(false);

  const actionAccept = async () => {
    setAlertAcceptIsOpen(false);
    setBlur && setBlur(true);
    if (!(requestData.event && requestData.multisigIcpDetails)) {
      // Do some error thing here... maybe it's just a TODO
    } else {
      const joinMultisigResult = await Agent.agent.multiSigs.joinMultisig(
        requestData.event.id,
        requestData.event.a.d as string,
        {
          theme: requestData.multisigIcpDetails.ourIdentifier.theme,
          displayName: requestData.multisigIcpDetails.ourIdentifier.displayName,
        }
      );

      if (joinMultisigResult) {
        const newIdentifier: IdentifierShortDetails = {
          id: joinMultisigResult.identifier,
          displayName: requestData.multisigIcpDetails.ourIdentifier.displayName,
          createdAtUTC: `${requestData.event?.createdAt}`,
          theme: requestData.multisigIcpDetails.ourIdentifier.theme,
          isPending: requestData.multisigIcpDetails.threshold >= 2,
          signifyName: joinMultisigResult.signifyName,
        };
        const filteredIdentifiersData = identifiersData.filter(
          (item) =>
            item.id !== requestData?.multisigIcpDetails?.ourIdentifier.id
        );
        dispatch(
          setIdentifiersCache([...filteredIdentifiersData, newIdentifier])
        );
        requestData.multisigIcpDetails.threshold === 1
          ? ToastMsgType.IDENTIFIER_CREATED
          : ToastMsgType.IDENTIFIER_REQUESTED;
      }
    }
    handleAccept();
  };

  const actionDecline = () => {
    setAlertDeclineIsOpen(false);
    handleCancel();
  };

  const actionIgnore = () => {
    handleIgnore && handleIgnore();
  };

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
            closeButton={true}
            closeButtonAction={() => actionIgnore()}
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
                      {requestData.multisigIcpDetails?.sender.logo ? (
                        <img
                          data-testid="multisig-connection-logo"
                          src={requestData.multisigIcpDetails?.sender.logo}
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
        {!!requestData.multisigIcpDetails?.otherConnections.length && (
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
                <IonLabel>{requestData.multisigIcpDetails?.threshold}</IonLabel>
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
          secondaryButtonAction={() => setAlertDeclineIsOpen(true)}
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
