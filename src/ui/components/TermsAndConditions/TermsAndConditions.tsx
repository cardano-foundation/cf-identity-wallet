import { IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { Trans } from "react-i18next";
import { i18n } from "../../../i18n";
import "./TermsAndConditions.scss";
import { TermsAndConditionsProps } from "./TermsAndConditions.types";
import { PageLayout } from "../layout/PageLayout";

const TermsAndConditions = ({ isOpen, setIsOpen }: TermsAndConditionsProps) => {
  return (
    <IonModal
      isOpen={isOpen}
      initialBreakpoint={1}
      breakpoints={[0, 0.25, 0.5, 0.75]}
      className="page-layout"
      onDidDismiss={() => setIsOpen(false)}
    >
      <div className="terms-and-conditions">
        <PageLayout
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
                <Trans
                  i18nKey="termsandconditions.body"
                  components={{ p: <p /> }}
                />
              </IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { TermsAndConditions };
