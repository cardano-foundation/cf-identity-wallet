import { IonCol, IonIcon } from "@ionic/react";
import {
  checkmark,
  personCircleOutline,
  swapHorizontalOutline,
} from "ionicons/icons";
import i18next from "i18next";
import { i18n } from "../../../../i18n";
import CardanoLogo from "../../../../ui/assets/images/CardanoLogo.jpg";
import { DIDCommRequestType } from "../../../globals/types";
import { PageFooter } from "../../../components/PageFooter";
import { RequestProps } from "../IncomingRequest.types";
import { ResponsivePageLayout } from "../../../components/layout/ResponsivePageLayout";

const ConnectionRequest = ({
  pageId,
  activeStatus,
  requestData,
  initiateAnimation,
  handleAccept,
  handleCancel,
}: RequestProps) => {
  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={activeStatus}
      customClass={`${activeStatus ? "show" : "hide"} ${
        initiateAnimation ? "animation-on" : "animation-off"
      }`}
    >
      <h2>{i18n.t("request.connection.title")}</h2>
      <div className="request-animation-center">
        <div className="request-icons-row">
          <div className="request-user-logo">
            <IonIcon
              icon={personCircleOutline}
              color="light"
            />
          </div>
          <div className="request-swap-logo">
            <span>
              <IonIcon icon={swapHorizontalOutline} />
            </span>
          </div>
          <div className="request-checkmark-logo">
            <span>
              <IonIcon icon={checkmark} />
            </span>
          </div>
          <div className="request-provider-logo">
            <img
              data-testid="request-provider-logo"
              src={requestData?.logo || CardanoLogo}
              alt="request-provider-logo"
            />
          </div>
        </div>
        <div className="request-info-row">
          <IonCol size="12">
            <span>
              {DIDCommRequestType.CONNECTION +
                i18n.t("request.connection.requestconnection")}
            </span>
            <strong>{requestData?.label}</strong>
          </IonCol>
        </div>
        <div className="request-status">
          <IonCol size="12">
            <strong>
              {i18next.t("request.pending", {
                action: DIDCommRequestType.CONNECTION,
              })}
            </strong>
          </IonCol>
        </div>
      </div>
      <PageFooter
        pageId={pageId}
        primaryButtonText={`${i18n.t("request.button.connect")}`}
        primaryButtonAction={() => handleAccept()}
        secondaryButtonText={`${i18n.t("request.button.cancel")}`}
        secondaryButtonAction={() => handleCancel()}
      />
    </ResponsivePageLayout>
  );
};

export { ConnectionRequest };
