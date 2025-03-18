import { IonModal } from "@ionic/react";
import { Trans } from "react-i18next";
import { Browser } from "@capacitor/browser";
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
import { SUPPORT_LINK } from "../../globals/constants";

const Section = ({ title, content, componentId, altIsOpen }: TermsSection) => {
  const HandlePrivacy = () => {
    return (
      <u
        data-testid="privacy-policy-modal-switch"
        onClick={() => altIsOpen && altIsOpen(true)}
      >
        {i18n.t("generateseedphrase.termsandconditions.privacy")}
      </u>
    );
  };
  const HandleSupport = () => {
    return (
      <u
        data-testid="support-link-handler"
        onClick={() => Browser.open({ url: SUPPORT_LINK })}
      >
        {i18n.t("generateseedphrase.termsandconditions.support")}
      </u>
    );
  };
  return (
    <div>
      {title && (
        <h3
          data-testid={`${componentId}-section-${title
            .replace(/[^aA-zZ]/gim, "")
            .toLowerCase()}`}
        >
          {title}
        </h3>
      )}
      {content.map((item: TermContent, index: number) => (
        <div
          key={index}
          className="terms-of-use-section"
        >
          {!!item.subtitle.length && (
            <>
              <span
                data-testid={`${componentId}-section-${title
                  ?.replace(/[^aA-zZ]/gim, "")
                  .toLowerCase()}-subtitle-${index + 1}`}
              >
                {item.subtitle}
              </span>
              <br />
            </>
          )}
          {!!item.text.length && (
            <>
              <span
                className="terms-of-use-section-bottom"
                data-testid={`${componentId}-section-${title
                  ?.replace(/[^aA-zZ]/gim, "")
                  .toLowerCase()}-content-${index + 1}`}
              >
                <Trans
                  i18nKey={item.text}
                  components={[
                    <HandlePrivacy key="" />,
                    <HandleSupport key="" />,
                  ]}
                />
              </span>
              <br />
            </>
          )}
          {item.nested && item.nested.length > 0 && (
            <ul>
              {item.nested.map((nestedItem, nestedIndex) => (
                <li key={nestedIndex}>{nestedItem}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

const TermsModal = ({
  name,
  isOpen,
  setIsOpen,
  altIsOpen,
  children,
}: TermsModalProps) => {
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
            altIsOpen={altIsOpen}
          />
        ))}
        {children}
      </ScrollablePageLayout>
    </IonModal>
  );
};

export { TermsModal };
