import { IonModal } from "@ionic/react";
import { t } from "i18next";
import { i18n } from "../../../i18n";
import {
  TermContent,
  TermsModalProps,
  TermsObject,
  TermsSection,
} from "./TermsModal.types";
import "./TermsModal.scss";
import { ScrollablePageLayout } from "../layout/ScrollablePageLayout";
import { PageHeader } from "../PageHeader";

const Section = ({ title, content, componentId }: TermsSection) => {
  return (
    <div>
      <h3
        data-testid={`${componentId}-section-${title
          .replace(/[^aA-zZ]/gim, "")
          .toLowerCase()}`}
      >
        {title}
      </h3>
      {content.map((item: TermContent, index: number) => (
        <p key={index}>
          {!!item.subtitle.length && (
            <b
              data-testid={`${componentId}-section-${title
                .replace(/[^aA-zZ]/gim, "")
                .toLowerCase()}-subtitle-${index + 1}`}
            >
              {item.subtitle}
            </b>
          )}
          {!!item.text.length && (
            <span
              data-testid={`${componentId}-section-${title
                .replace(/[^aA-zZ]/gim, "")
                .toLowerCase()}-content-${index + 1}`}
            >
              {item.text}
            </span>
          )}
        </p>
      ))}
    </div>
  );
};

const TermsModal = ({ name, isOpen, setIsOpen, children }: TermsModalProps) => {
  const nameNoDash = name.replace(/-/g, "");
  const componentId = name + "-modal";
  const termsObject: TermsObject = t(nameNoDash, {
    returnObjects: true,
  });
  const introText = `${i18n.t(`${nameNoDash}.intro.text`)}`;
  const sections = termsObject.sections;

  const closeModal = () => setIsOpen(false);

  return (
    <IonModal
      isOpen={isOpen}
      className="terms-modal"
      data-testid={componentId}
      onDidDismiss={closeModal}
    >
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        header={
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${i18n.t(`${nameNoDash}.done`)}`}
            closeButtonAction={closeModal}
            title={`${i18n.t(`${nameNoDash}.intro.title`)}`}
          />
        }
      >
        {!!introText.length && (
          <p>
            <b data-testid={`${componentId}-intro-text`}>{introText}</b>
          </p>
        )}
        {sections.map((section: TermsSection, index: number) => (
          <Section
            key={index}
            title={section.title}
            content={section.content}
            componentId={componentId}
          />
        ))}
        {children}
      </ScrollablePageLayout>
    </IonModal>
  );
};

export { TermsModal };
