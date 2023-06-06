import { IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { VerifyPasswordProps } from "./VerifyPassword.types";

const VerifyPassword = ({ isOpen, setIsOpen }: VerifyPasswordProps) => {
  return (
    <IonModal
      isOpen={isOpen}
      initialBreakpoint={1}
      breakpoints={[0, 0.5, 1]}
      className="page-layout"
      onDidDismiss={() => setIsOpen(false)}
    >
      <div className="verify-password">
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonAction={() => setIsOpen(false)}
          title={`${i18n.t("verifypassword.title")}`}
        >
          <IonGrid>
            <IonRow>
              <IonCol
                size="12"
                className="verify-password-body"
              ></IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { VerifyPassword };
