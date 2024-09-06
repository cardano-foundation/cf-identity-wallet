import React from "react";
import { Browser } from "@capacitor/browser";
import { IonModal } from "@ionic/react";
import i18next from "i18next";
import { i18n } from "../../../i18n";
import { TermsModalProps, TermsObject, TermsSection } from "./TermsModal.types";
import "./TermsModal.scss";
import { ScrollablePageLayout } from "../layout/ScrollablePageLayout";
import { PageHeader } from "../PageHeader";
import { PrivacyPolicyLinks, TermsOfUseLinks } from "../../globals/constants";

const TermsModal = ({ name, isOpen, setIsOpen, children }: TermsModalProps) => {
  const nameNoDash = name.replace(/-/g, "");
  const componentId = name + "-modal";
  const termsObject: TermsObject = i18next.t(nameNoDash, {
    returnObjects: true,
  });
  const introText = `${i18n.t(`${nameNoDash}.intro.text`)}`;
  const sections = termsObject.sections;

  const handleOpenUrl = (url: string) => {
    Browser.open({ url: url });
  };

  const DynamicLink = ({ text, index }: { text: string; index: number }) => {
    return (
      <u
        className="terms-modal-link"
        data-testid={`${componentId}-link-${index}`}
        onClick={() =>
          handleOpenUrl(
            name === "terms-of-use"
              ? TermsOfUseLinks[index]
              : PrivacyPolicyLinks[index]
          )
        }
      >
        {text}
      </u>
    );
  };

  const Section = ({ title, content }: TermsSection) => (
    <div>
      <h3
        data-testid={`${componentId}-section-${title
          .replace(/[^aA-zZ]/gim, "")
          .toLowerCase()}`}
      >
        {title}
      </h3>
      {content.map((item: any, index: number) => (
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
              {(() => {
                const textWithLinks = i18next.t(item.text);
                const regex = /<(\d+)>(.*?)<\/\1>/g;
                const parts: (string | React.JSX.Element)[] = [];
                let lastIndex = 0;
                const matches = textWithLinks.matchAll(regex);
                for (const match of matches) {
                  const linkIndex = parseInt(match[1], 10);
                  const content = match[2];
                  const offset = match.index || 0;
                  if (lastIndex < offset) {
                    parts.push(textWithLinks.substring(lastIndex, offset));
                  }
                  const linkText = content;
                  parts.push(
                    <DynamicLink
                      key={`link-${linkIndex}`}
                      text={linkText}
                      index={linkIndex}
                    />
                  );
                  lastIndex = offset + match[0].length;
                }
                if (lastIndex < textWithLinks.length) {
                  parts.push(textWithLinks.substring(lastIndex));
                }
                return parts;
              })()}
            </span>
          )}
        </p>
      ))}
    </div>
  );
  return (
    <IonModal
      isOpen={isOpen}
      className="terms-modal"
      data-testid={componentId}
      onDidDismiss={() => setIsOpen(false)}
    >
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        header={
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${i18n.t(`${nameNoDash}.done`)}`}
            closeButtonAction={() => setIsOpen(false)}
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
          />
        ))}
        {children}
      </ScrollablePageLayout>
    </IonModal>
  );
};

export { TermsModal };
