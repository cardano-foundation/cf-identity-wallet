import { IonSpinner } from "@ionic/react";
import { i18n } from "../../../i18n";
import { ResponsivePageLayout } from "../layout/ResponsivePageLayout";
import "./AppOffline.scss";

const AppOffline = () => {
  return (
    <ResponsivePageLayout
      activeStatus
      pageId="offline"
      customClass="offline-page max-zindex"
    >
      <div className="page-content-container">
        <div className="page-content">
          <h1>{i18n.t("offline.title")}</h1>
          <p>{i18n.t("offline.description")}</p>
        </div>
        <IonSpinner name="circular" />
      </div>
    </ResponsivePageLayout>
  );
};

export { AppOffline };
