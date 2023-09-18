import { IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { PageLayout } from "../layout/PageLayout";
import { ArchivedCredentialsProps } from "./ArchivedCredentials.types";
import { i18n } from "../../../i18n";

const ArchivedCredentials = ({
  archivedCredentialsIsOpen,
  setArchivedCredentialsIsOpen,
}: ArchivedCredentialsProps) => {
  return (
    <IonModal
      isOpen={archivedCredentialsIsOpen}
      initialBreakpoint={0.35}
      breakpoints={[0, 0.35]}
      className={"page-layout"}
      data-testid="archived-credentials"
      onDidDismiss={() => setArchivedCredentialsIsOpen(false)}
    >
      <div className="archived-credentials modal">
        <PageLayout
          header={true}
          closeButton={false}
          title={`${i18n.t("creds.archived.title")}`}
        >
          <IonGrid>
            <IonRow>
              <IonCol
                size="12"
                className=""
              ></IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { ArchivedCredentials };
