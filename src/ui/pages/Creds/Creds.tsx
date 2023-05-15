import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";

const Creds = () => {
  return (
    <IonPage className="page-layout creds-page">
      <PageLayout
        header={true}
        menuButton={true}
      >
        <div>Creds</div>
      </PageLayout>
    </IonPage>
  );
};

export { Creds };
