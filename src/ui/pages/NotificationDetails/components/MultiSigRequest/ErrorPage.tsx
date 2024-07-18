import { IonIcon, IonText } from "@ionic/react";
import { alertCircleOutline } from "ionicons/icons";
import { useState } from "react";
import { IdentifierShortDetails } from "../../../../../core/agent/services/identifier.types";
import { i18n } from "../../../../../i18n";
import { useAppSelector } from "../../../../../store/hooks";
import { getMultisigConnectionsCache } from "../../../../../store/reducers/connectionsCache";
import { getIdentifiersCache } from "../../../../../store/reducers/identifiersCache";
import { CardDetailsBlock } from "../../../../components/CardDetails";
import { CreateIdentifier } from "../../../../components/CreateIdentifier";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import "./ErrorPage.scss";
import { ErrorPageProps } from "./ErrorPage.types";

const CANNOT_FIND_CONNECTION = "Cannot find multisign connection";
const CANNOT_FIND_IDENTIFIER = "Cannot find multisign connection";

const ErrorPage = ({
  pageId,
  activeStatus,
  handleBack,
  notificationDetails,
  onFinishSetup,
}: ErrorPageProps) => {
  const identifierCache = useAppSelector(getIdentifiersCache);
  const connectionsCache = useAppSelector(getMultisigConnectionsCache);
  const [resumeMultiSig, setResumeMultiSig] =
    useState<IdentifierShortDetails | null>(null);

  const [createIdentifierModalIsOpen, setCreateIdentifierModalIsOpen] =
    useState(false);

  const actionAccept = () => {
    try {
      const multiSignGroupId =
        connectionsCache[notificationDetails.connectionId].groupId;
      if (!multiSignGroupId) {
        throw new Error(CANNOT_FIND_CONNECTION);
      }

      const identifier = identifierCache.find(
        (item) => item.groupMetadata?.groupId === multiSignGroupId
      );

      if (!identifier) {
        throw new Error(CANNOT_FIND_IDENTIFIER);
      }

      setResumeMultiSig(identifier);
      setCreateIdentifierModalIsOpen(true);
    } catch (e) {
      // TODO: Handle error
    }
  };

  const handleCloseCreateIdentifier = () => {
    setCreateIdentifierModalIsOpen(false);
    onFinishSetup();
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={`${pageId}-multi-sig-feedback`}
        customClass={`${pageId}-multi-sig-feedback setup-identifier`}
        activeStatus={activeStatus}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={handleBack}
            closeButtonLabel={`${i18n.t(
              "notifications.details.buttons.close"
            )}`}
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
            {i18n.t(
              "notifications.details.identifier.errorpage.help.detailtext"
            )}
          </IonText>
        </div>
      </ScrollablePageLayout>
      <CreateIdentifier
        modalIsOpen={createIdentifierModalIsOpen}
        setModalIsOpen={handleCloseCreateIdentifier}
        resumeMultiSig={resumeMultiSig}
        setResumeMultiSig={setResumeMultiSig}
        preventRedirect
      />
    </>
  );
};

export { ErrorPage };
