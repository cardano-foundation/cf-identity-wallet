import { IonCol, IonIcon } from "@ionic/react";
import {
  checkmark,
  personCircleOutline,
  swapHorizontalOutline,
} from "ionicons/icons";
import i18next from "i18next";
import { i18n } from "../../../../../../i18n";
import KeriLogo from "../../../../../../ui/assets/images/KeriGeneric.jpg";
import { PageFooter } from "../../../../../components/PageFooter";
import { RequestProps } from "../IncomingRequest.types";
import { ResponsivePageLayout } from "../../../../../components/layout/ResponsivePageLayout";
import { RequestType } from "../../../../../globals/types";

const CredentialRequest = ({
  pageId,
  activeStatus,
  requestData,
  initiateAnimation,
  handleAccept,
  handleCancel,
}: RequestProps) => {
  const fallbackLogo = KeriLogo;

  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={activeStatus}
      customClass={initiateAnimation ? "animation-on" : "animation-off"}
    >
      <h2>{i18n.t("request.credential.title")}</h2>
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
              data-testid="credential-request-provider-logo"
              src={requestData?.logo || fallbackLogo}
              alt="request-provider-logo"
            />
          </div>
        </div>
        <div className="request-info-row">
          <IonCol size="12">
            <span>
              {RequestType.CREDENTIAL +
                i18n.t("request.credential.offercredential")}
            </span>
            <strong>{requestData?.label}</strong>
          </IonCol>
        </div>
        <div className="request-status">
          <IonCol size="12">
            <strong>
              {i18next.t("request.pending", {
                action: RequestType.CREDENTIAL,
              })}
            </strong>
          </IonCol>
        </div>
      </div>
      <PageFooter
        pageId={pageId}
        primaryButtonText={`${i18n.t("request.button.acceptoffer")}`}
        primaryButtonAction={() => handleAccept()}
        secondaryButtonText={`${i18n.t("request.button.cancel")}`}
        secondaryButtonAction={() => handleCancel()}
      />
    </ResponsivePageLayout>
  );
};

export { CredentialRequest };
