import { IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { i18n } from "../../../i18n";
import { TermsAndConditionsProps } from "./TermsAndConditions.types";
import { PageLayout } from "../layout/PageLayout";

const TermsAndConditions = ({ isOpen, setIsOpen }: TermsAndConditionsProps) => {
  const paragraphs: string[] = i18n.t("termsandconditions.body", {
    returnObjects: true,
  });
  return (
    <IonModal
      isOpen={isOpen}
      initialBreakpoint={1}
      breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      className="page-layout"
      data-testid="terms-and-conditions"
      onDidDismiss={() => setIsOpen(false)}
    >
      <div className="terms-and-conditions modal">
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonAction={() => setIsOpen(false)}
          title={`${i18n.t("termsandconditions.title")}`}
        >
          <IonGrid>
            <IonRow>
              <IonCol
                size="12"
                className="terms-and-conditions-body"
              >
                {paragraphs.map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { TermsAndConditions };
