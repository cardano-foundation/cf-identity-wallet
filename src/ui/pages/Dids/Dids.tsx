import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";

const Dids = () => {
  return (
    <IonPage className="page-layout dids-page">
      <PageLayout
        header={true}
        menuButton={true}
      >
        <div>Dids</div>
      </PageLayout>
    </IonPage>
  );
};

export { Dids };
