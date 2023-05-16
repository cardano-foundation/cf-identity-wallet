import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";

const Creds = () => {
  return (
    <IonPage
      className="page-layout creds-page"
      data-testid="creds-page"
    >
      <PageLayout
        header={true}
        menuButton={true}
        currentPath={TabsRoutePath.CREDS}
      >
        <div>Creds</div>
      </PageLayout>
    </IonPage>
  );
};

export { Creds };
