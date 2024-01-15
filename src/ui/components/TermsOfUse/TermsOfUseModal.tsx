import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { TermsOfUseModalProps } from "./TermsOfUseModal.types";
import { termsOfUseData } from "./TermsOfUseData";
import "./TermsOfUseModal.scss";
import { ScrollablePageLayout } from "../layout/ScrollablePageLayout";
import { PageHeader } from "../PageHeader";
import { i18n } from "../../../i18n";

const TermsOfUseModal = ({ isOpen, setIsOpen }: TermsOfUseModalProps) => {
  const componentId = "terms-of-use-modal";
  const Section = ({ title, content }: { title: string; content: any }) => (
    <div>
      <h3>{title}</h3>
      {content.map((item: any, index: number) => (
        <p key={index}>
          {item.subtitle && <b>{item.subtitle}</b>}
          {item.text && <span>{item.text}</span>}
        </p>
      ))}
    </div>
  );
  return (
    <IonModal
      isOpen={isOpen}
      className={componentId}
      data-testid={componentId}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      onDidDismiss={() => setIsOpen(false)}
    >
      <ScrollablePageLayout
        pageId={componentId}
        header={
          <PageHeader
            closeButton={true}
            // closeButtonLabel={i18n.t("termsOfUseData.intro.title")}
            closeButtonLabel="Done"
            closeButtonAction={() => setIsOpen(false)}
            title={termsOfUseData.intro.title}
          />
        }
      >
        <p>
          <b>{termsOfUseData.intro.text}</b>
        </p>
        {termsOfUseData.sections.map((section, index) => (
          <Section
            key={index}
            title={section.title}
            content={section.content}
          />
        ))}
      </ScrollablePageLayout>
    </IonModal>
  );
};

export { TermsOfUseModal };
