import { IonModal } from "@ionic/react";
import { RecoverySeedPhraseDocumentModalProps } from "./RecoverySeedPhraseDocumentModal.types";
import { ScrollablePageLayout } from "../../../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../../../components/PageHeader";
import { i18n } from "../../../../../i18n";
import { InfoCard } from "../../../../components/InfoCard";
import { DocumentSection } from "./DocumentSection";
import Image from "../../../../assets/images/SeedPhraseDocs.png";
import "./RecoverySeedPhraseDocumentModal.scss";

const RecoverySeedPhraseDocumentModal = ({
  isOpen,
  setIsOpen,
}: RecoverySeedPhraseDocumentModalProps) => {
  return (
    <IonModal
      isOpen={isOpen}
      className="recovery-seedphrase-docs-modal"
      data-testid="recovery-seedphrase-docs-modal"
      onDidDismiss={() => setIsOpen(false)}
    >
      <ScrollablePageLayout
        pageId="recovery-seedphrase-docs-modal-content"
        header={
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${i18n.t(
              "generateseedphrase.onboarding.recoveryseedphrasedocs.button.done"
            )}`}
            closeButtonAction={() => setIsOpen(false)}
            title={`${i18n.t(
              "generateseedphrase.onboarding.recoveryseedphrasedocs.title"
            )}`}
          />
        }
      >
        <InfoCard
          danger
          content={i18n.t(
            "generateseedphrase.onboarding.recoveryseedphrasedocs.alert"
          )}
        />
        <DocumentSection
          sectionKey="what"
          image={Image}
        />
        <DocumentSection sectionKey="why" />
        <DocumentSection sectionKey="how" />
      </ScrollablePageLayout>
    </IonModal>
  );
};

export { RecoverySeedPhraseDocumentModal };
