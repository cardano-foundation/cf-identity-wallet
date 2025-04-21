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
          <p>
            {t(
              "tabs.notifications.details.signinformation.description.paragraphone",
              {
                certificate: certificate,
              }
            )}
          </p>
          <p>
            {t(
              "tabs.notifications.details.signinformation.description.paragraphtwo",
              {
                certificate: certificate,
              }
            )}
          </p>
          <p>
            {t(
              "tabs.notifications.details.signinformation.description.paragraphthree",
              {
                certificate: certificate,
              }
            )}
          </p>
        </div>
      </div>
    </ScrollablePageLayout>
  );
}

export { RemoteSignInformation };
