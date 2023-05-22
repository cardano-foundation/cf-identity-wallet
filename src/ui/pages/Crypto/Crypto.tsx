import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";

const Crypto = () => {
  return (
    <IonPage
      className="page-layout crypto-page"
      data-testid="crypto-page"
    >
      <PageLayout
        header={true}
        menuButton={true}
        currentPath={TabsRoutePath.CRYPTO}
      >
        <div>Crypto</div>
      </PageLayout>
    </IonPage>
  );
};

export { Crypto };
