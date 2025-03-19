import { Browser } from "@capacitor/browser";
import { IonIcon } from "@ionic/react";
import {
  alertCircleOutline,
  helpCircleOutline,
  warningOutline,
} from "ionicons/icons";
import React from "react";
import { i18n } from "../../../i18n";
import { CardDetailsBlock } from "../../components/CardDetails";
import { InfoCard } from "../../components/InfoCard";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../components/PageFooter";
import "./SystemThreatAlert.scss";
import { SystemThreatAlertProps } from "./SystemThreatAlert.types";

export const SUPPORT_LINK =
  "https://cardanofoundation.atlassian.net/servicedesk/customer/portal/14";

const SystemThreatAlert: React.FC<SystemThreatAlertProps> = ({ error }) => {
  const handleHelpButtonClick = () => {
    Browser.open({
      url: SUPPORT_LINK,
    });
  };

  const pageId = "system-threat-alert-page";
  return (
    <ScrollablePageLayout
      activeStatus
      pageId={pageId}
    >
      <div className="alert-container">
        <IonIcon
          icon={alertCircleOutline}
          className="warning-icon"
        />
        <h2 className="title">
          {i18n.t("systemthreats.title", {
            defaultValue: "Threats Detected",
          })}
        </h2>
        <p className="description">
          {i18n.t("systemthreats.description", {
            defaultValue:
              "The following security threats have been detected on your device:",
          })}
        </p>
        <CardDetailsBlock className="system-threats">
          <p className="init-error">
            {i18n.t("systemthreats.initerror", {
              defaultValue: error,
            })}
          </p>
        </CardDetailsBlock>
        <InfoCard
          content={i18n.t("systemthreats.alert")}
          icon={warningOutline}
        />
        <PageFooter
          primaryButtonText={`${i18n.t("systemthreats.help")}`}
          primaryButtonIcon={helpCircleOutline}
          primaryButtonAction={handleHelpButtonClick}
        />
      </div>
    </ScrollablePageLayout>
  );
};

export default SystemThreatAlert;
