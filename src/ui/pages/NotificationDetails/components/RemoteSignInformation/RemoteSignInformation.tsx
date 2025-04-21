import { t } from "i18next";
import React from "react";
import { i18n } from "../../../../../i18n";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../../../components/PageHeader";
import { NotificationDetailsProps } from "../../NotificationDetails.types";
import "./RemoteSignInformation.scss";

function RemoteSignInformation({
  pageId,
  activeStatus,
  notificationDetails,
  handleBack,
}: NotificationDetailsProps) {
  const certificate = "Certificate"; // TODO: change hardcoded value to dynamic

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
            "tabs.notifications.details.signinformation.title"
          )}`}
        />
      }
    >
      <div className="sign-confirmation-body">
        <h3>{t("tabs.notifications.details.signinformation.subtitle")}</h3>
        <div>
          {formatNewLines(
            t("tabs.notifications.details.signinformation.description", {
              certificate: certificate,
            })
          )}
        </div>
      </div>
    </ScrollablePageLayout>
  );
}

export { RemoteSignInformation };
