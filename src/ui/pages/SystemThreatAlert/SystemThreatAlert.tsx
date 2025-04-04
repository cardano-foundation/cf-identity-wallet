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
import { SUPPORT_EMAIL } from "../../globals/constants";

const SystemThreatAlert: React.FC<SystemThreatAlertProps> = ({ error }) => {
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
          primaryButtonAction={SUPPORT_EMAIL}
        />
      </div>
    </ScrollablePageLayout>
  );
};

export default SystemThreatAlert;
