import { IonModal } from "@ionic/react";
import i18next from "i18next";
import { i18n } from "../../../i18n";
import { TermsModalProps, TermsObject, TermsSection } from "./TermsModal.types";
import "./TermsModal.scss";
import { ScrollablePageLayout } from "../layout/ScrollablePageLayout";
import { PageHeader } from "../PageHeader";

const TermsModal = ({ name, isOpen, setIsOpen }: TermsModalProps) => {
  const nameNoDash = name.replace(/-/g, "");
  const componentId = name + "-modal";
  const termsObject: TermsObject = i18next.t(nameNoDash, {
    returnObjects: true,
  });
  const sections = termsObject.sections;
  const Section = ({ title, content }: TermsSection) => (
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
      className="terms-modal"
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
            closeButtonLabel={`${i18n.t(`${nameNoDash}.done`)}`}
            closeButtonAction={() => setIsOpen(false)}
            title={`${i18n.t(`${nameNoDash}.intro.title`)}`}
          />
        }
      >
        <p>
          <b>{`${i18n.t(`${nameNoDash}.intro.text`)}`}</b>
        </p>
        {sections.map((section: TermsSection, index: number) => (
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

export { TermsModal };
