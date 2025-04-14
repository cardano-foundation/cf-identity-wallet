import React from "react";
import { t } from "i18next";
import { openOutline } from "ionicons/icons";
import { i18n } from "../../../../../i18n";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { NotificationDetailsProps } from "../../NotificationDetails.types";
import "./RemoteSignConfirmation.scss";
import { openBrowserLink } from "../../../../utils/openBrowserLink";

function RemoteSignConfirmation({
  pageId,
  activeStatus,
  notificationDetails,
  handleBack,
}: NotificationDetailsProps) {
  const formatNewLines = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };
  return (
    <ScrollablePageLayout
      activeStatus={activeStatus}
      pageId={pageId}
      customClass="custom-sign-confirmation"
      header={
        <PageHeader
          closeButton={true}
          closeButtonAction={handleBack}
          closeButtonLabel={`${i18n.t(
            "tabs.notifications.details.buttons.close"
          )}`}
          title={`${i18n.t(
            "tabs.notifications.details.signconfirmation.title"
          )}`}
        />
      }
      footer={
        <PageFooter
          customClass="sign-confirmation-footer"
          primaryButtonIcon={openOutline}
          primaryButtonText={`${t(
            "tabs.notifications.details.signconfirmation.button.label",
            {
              certificate: "certificate", // TODO: change hardcoded value to dynamic
            }
          )}`}
          primaryButtonAction={
            () => openBrowserLink("https://www.veridian.id/") // TODO: change hardcoded value to dynamic
          }
        />
      }
    >
      <div className="sign-confirmation-body">
        <h3>
          {t("tabs.notifications.details.signconfirmation.subtitle", {
            certificate: "Certificate", // TODO: change hardcoded value to dynamic
            connection: "Connection Name", // TODO: change hardcoded value to dynamic
          })}
        </h3>
        <p>
          {formatNewLines(
            t("tabs.notifications.details.signconfirmation.description", {
              certificate: "Certificate", // TODO: change hardcoded value to dynamic
              connection: "Connection Name", // TODO: change hardcoded value to dynamic
            })
          )}
        </p>
      </div>
    </ScrollablePageLayout>
  );
}

export { RemoteSignConfirmation };
