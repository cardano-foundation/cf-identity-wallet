import { IonIcon, IonText } from "@ionic/react";
import { alertCircleOutline } from "ionicons/icons";
import { CardDetailsBlock } from "../../../../components/CardDetails";
import { i18n } from "../../../../../i18n";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { NotificationDetailsProps } from "../../NotificationDetails.types";
import { PageHeader } from "../../../../components/PageHeader";
import { PageFooter } from "../../../../components/PageFooter";
import "./ErrorPage.scss";
import { useAppDispatch } from "../../../../../store/hooks";
import { setCurrentOperation } from "../../../../../store/reducers/stateCache";
import { OperationType } from "../../../../globals/types";
const ErrorPage = ({
  pageId,
  activeStatus,
  handleBack,
}: Omit<NotificationDetailsProps, "notificationDetails">) => {
  const dispatch = useAppDispatch();

  const actionAccept = () => {
    dispatch(setCurrentOperation(OperationType.MULTI_SIG_RECEIVER_SCAN));
  };

  return (
    <ScrollablePageLayout
      pageId={`${pageId}-multi-sig-feedback`}
      customClass={`${pageId}-multi-sig-feedback setup-identifier`}
      activeStatus={activeStatus}
      header={
        <PageHeader
          closeButton={true}
          closeButtonAction={handleBack}
          closeButtonLabel={`${i18n.t("notifications.details.buttons.close")}`}
          title={`${i18n.t(
            "notifications.details.identifier.errorpage.title"
          )}`}
        />
      }
      footer={
        <PageFooter
          pageId={pageId}
          customClass="multisig-feedback-footer"
          primaryButtonText={`${i18n.t(
            "notifications.details.buttons.scannow"
          )}`}
          primaryButtonAction={() => actionAccept()}
        />
      }
    >
      <CardDetailsBlock className="alert">
        <IonText className="alert-text">
          {i18n.t("notifications.details.identifier.errorpage.alerttext")}
        </IonText>
        <div className="alert-icon">
          <IonIcon
            icon={alertCircleOutline}
            slot="icon-only"
          />
        </div>
      </CardDetailsBlock>
      <div className="instructions">
        <h2 className="title">
          {i18n.t(
            "notifications.details.identifier.errorpage.instructions.title"
          )}
        </h2>
        <IonText className="detail-text">
          {i18n.t(
            "notifications.details.identifier.errorpage.instructions.detailtext"
          )}
        </IonText>
        <CardDetailsBlock className="content">
          <ol className="instruction-list">
            <li>
              {i18n.t(
                "notifications.details.identifier.errorpage.instructions.stepone"
              )}
            </li>
            <li>
              {i18n.t(
                "notifications.details.identifier.errorpage.instructions.steptwo"
              )}
            </li>
          </ol>
        </CardDetailsBlock>
      </div>
      <div className="help">
        <h2 className="title">
          {i18n.t("notifications.details.identifier.errorpage.help.title")}
        </h2>
        <IonText className="detail-text">
          {i18n.t("notifications.details.identifier.errorpage.help.detailtext")}
        </IonText>
      </div>
    </ScrollablePageLayout>
  );
};

export { ErrorPage };
