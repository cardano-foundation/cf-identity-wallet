import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";

const Scan = () => {
  return (
    <IonPage
      className="page-layout scan-page"
      data-testid="scan-page"
    >
      <PageLayout
        header={true}
        menuButton={true}
        currentPath={TabsRoutePath.SCAN}
      >
        <div>Scan</div>
      </PageLayout>
    </IonPage>
  );
};

export { Scan };
