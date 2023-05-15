import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";

const Dids = () => {
  return (
    <IonPage
      className="page-layout dids-page"
      data-testid="dids-page"
    >
      <PageLayout
        header={true}
        menuButton={true}
      >
        <div>DIDs</div>
      </PageLayout>
    </IonPage>
  );
};

export { Dids };
