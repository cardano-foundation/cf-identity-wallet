import { IonModal } from "@ionic/react";
import { t } from "i18next";
import { i18n } from "../../../../../i18n";
import { InfoCard } from "../../../InfoCard";
import { ScrollablePageLayout } from "../../../layout/ScrollablePageLayout";
import { PageHeader } from "../../../PageHeader";
import "./CredentialAttributeDetailModal.scss";
import { CredentialAttributeDetailModalProps } from "./CredentialAttributeDetailModal.types";

const CredentialAttributeDetailModal = ({
  isOpen,
  setOpen,
  title,
  description,
  children,
}: CredentialAttributeDetailModalProps) => {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IonModal
        isOpen={isOpen}
        className="credential-attribute-details-modal"
        data-testid="credential-attribute-details-modal"
      >
        <ScrollablePageLayout
          pageId={`credential-details-${title.toLowerCase()}`}
          header={
            <PageHeader
              title={title}
              closeButton
              closeButtonLabel={`${i18n.t("tabs.credentials.details.done")}`}
              closeButtonAction={handleClose}
            />
          }
        >
          <div className="attribute-description">
            <h3>
              {t("tabs.credentials.details.modal.about", {
                type: title,
              })}
            </h3>
          </div>
          <InfoCard
            className="attribute-description-content"
            content={description}
          />
          {children}
        </ScrollablePageLayout>
      </IonModal>
    </>
  );
};

export { CredentialAttributeDetailModal };
