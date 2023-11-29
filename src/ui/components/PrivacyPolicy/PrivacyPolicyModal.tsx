import { IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { PrivacyPolicyModalProps } from "./PrivacyPolicyModal.types";
import { PageLayout } from "../layout/PageLayout";
import { privacyPolicyData } from "./PrivacyPolicyData";

const PrivacyPolicyModal = ({ isOpen, setIsOpen }: PrivacyPolicyModalProps) => {
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
      initialBreakpoint={1}
      breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      className="page-layout"
      data-testid="terms-of-use-modal"
      onDidDismiss={() => setIsOpen(false)}
    >
      <div className="terms-and-conditions modal">
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonAction={() => setIsOpen(false)}
          title={privacyPolicyData.intro.title}
        >
          <IonGrid>
            <IonRow>
              <IonCol
                size="12"
                className="terms-and-conditions-body"
              >
                <p>
                  <b>{privacyPolicyData.intro.text}</b>
                </p>
                {privacyPolicyData.sections.map((section, index) => (
                  <Section
                    key={index}
                    title={section.title}
                    content={section.content}
                  />
                ))}
              </IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { PrivacyPolicyModal };
