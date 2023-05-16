import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";
import {TabsRoutePath} from "../../components/navigation/TabsMenu";

const Dids = () => {
  return (
    <IonPage
      className="page-layout dids-page"
      data-testid="dids-page"
    >
      <PageLayout
        header={true}
        menuButton={true}
        currentPath={TabsRoutePath.DIDS}
      >
        <div>DIDs</div>
      </PageLayout>
    </IonPage>
  );
};

export { Dids };
