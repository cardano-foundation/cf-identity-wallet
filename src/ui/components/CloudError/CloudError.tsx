import { IonCard, IonIcon } from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import { ResponsivePageLayout } from "../layout/ResponsivePageLayout";
import { CloudErrorProps } from "./CloudError.types";
import "./CloudError.scss";
import { i18n } from "../../../i18n";

const CloudError = ({ pageId, header, children }: CloudErrorProps) => {
  const getMessage = (pageId: string) => {
    switch (pageId) {
    case "identifier-card-details":
      return i18n.t("identifiers.details.clouderror");
    case "credential-card-details":
      return i18n.t("credentials.details.clouderror");
    case "connection-details":
      return i18n.t("connections.details.clouderror");
    default:
      return "";
    }
  };

  return (
    <ResponsivePageLayout
      pageId={`${pageId}-cloud-error`}
      header={header}
      activeStatus={true}
      customClass={"cloud-error"}
    >
      <IonCard>
        <p>{getMessage(pageId)}</p>
        <div className="alert-icon">
          <IonIcon
            icon={informationCircleOutline}
            slot="icon-only"
          />
        </div>
      </IonCard>
      {children}
    </ResponsivePageLayout>
  );
};

export { CloudError };
