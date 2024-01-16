import { IonModal } from "@ionic/react";
import i18next from "i18next";
import { i18n } from "../../../i18n";
import {
  TermsOfUseModalProps,
  TermsOfUseObject,
  TermsOfUseSection,
} from "./TermsOfUseModal.types";
import "./TermsOfUseModal.scss";
import { ScrollablePageLayout } from "../layout/ScrollablePageLayout";
import { PageHeader } from "../PageHeader";

const TermsOfUseModal = ({ isOpen, setIsOpen }: TermsOfUseModalProps) => {
  const componentId = "terms-of-use-modal";
  const termsOfUseObject: TermsOfUseObject = i18next.t("termsofusedata", {
    returnObjects: true,
  });
  const sections = termsOfUseObject.sections;
  const Section = ({ title, content }: TermsOfUseSection) => (
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
            closeButtonLabel={`${i18n.t("termsofusedata.done")}`}
            closeButtonAction={() => setIsOpen(false)}
            title={`${i18n.t("termsofusedata.intro.title")}`}
          />
        }
      >
        <p>
          <b>{`${i18n.t("termsofusedata.intro.text")}`}</b>
        </p>
        {sections.map((section: TermsOfUseSection, index: number) => (
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
