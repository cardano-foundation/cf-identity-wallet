import { IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { PageLayout } from "../layout/PageLayout";
import { ArchivedCredentialsProps } from "./ArchivedCredentials.types";
import { i18n } from "../../../i18n";
import "./ArchivedCredentials.scss";

const ArchivedCredentials = ({
  archivedCredentialsIsOpen,
  setArchivedCredentialsIsOpen,
}: ArchivedCredentialsProps) => {
  return (
    <IonModal
      isOpen={archivedCredentialsIsOpen}
      className={""}
      data-testid="archived-credentials"
      onDidDismiss={() => setArchivedCredentialsIsOpen(false)}
    >
      <div className="archived-credentials modal">
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonAction={() => setArchivedCredentialsIsOpen(false)}
          closeButtonLabel={`${i18n.t("creds.archived.done")}`}
          actionButton={true}
          actionButtonAction={() => setArchivedCredentialsIsOpen(false)}
          actionButtonLabel={`${i18n.t("creds.archived.select")}`}
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
