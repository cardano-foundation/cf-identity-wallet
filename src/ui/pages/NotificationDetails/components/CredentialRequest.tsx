import { IonCol, IonIcon } from "@ionic/react";
import {
  checkmark,
  personCircleOutline,
  swapHorizontalOutline,
} from "ionicons/icons";
import i18next from "i18next";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { ResponsivePageLayout } from "../../../components/layout/ResponsivePageLayout";
import { i18n } from "../../../../i18n";
import { PageFooter } from "../../../components/PageFooter";
import { useAppIonRouter, useIonHardwareBackButton } from "../../../hooks";
import { BackEventPriorityType, RequestType } from "../../../globals/types";
import { KeriaNotification } from "../../../../core/agent/agent.types";
import { DataProps } from "../../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { getStateCache } from "../../../../store/reducers/stateCache";
import { getBackRoute } from "../../../../routes/backRoute";
import { RoutePath } from "../../../../routes";
import { updateReduxState } from "../../../../store/utils";

const CredentialRequest = ({
  notificationDetails,
  handleCancel,
}: {
  notificationDetails: KeriaNotification;
  handleCancel: () => void;
}) => {
  const pageId = "notification-details";
  const fallbackLogo = KeriLogo;
  const [activeStatus, setActiveStatus] = useState(true);
  const requestData = {
    logo: fallbackLogo,
    label: i18n.t("request.credential.label"),
  };

  const handleChoose = () => {
    //
  };

  useIonHardwareBackButton(
    BackEventPriorityType.Page,
    handleCancel,
    !activeStatus
  );

  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={activeStatus}
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
        primaryButtonAction={handleChoose}
        secondaryButtonText={`${i18n.t("request.button.cancel")}`}
        secondaryButtonAction={() => handleCancel()}
      />
    </ResponsivePageLayout>
  );
};

export { CredentialRequest };
