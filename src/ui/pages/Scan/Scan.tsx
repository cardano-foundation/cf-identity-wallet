import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";

const Scan = () => {
  return (
    <IonPage
      className="page-layout scan-page"
      data-testid="scan-page"
    >
      <PageLayout
        header={true}
        menuButton={true}
      >
        <div>Scan</div>
      </PageLayout>
    </IonPage>
  );
};

export { Scan };
