import { IonPage } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";

const Crypto = () => {
  return (
    <IonPage
      className="tab-layout"
      data-testid="crypto-tab"
    >
      <TabLayout
        currentPath={TabsRoutePath.CRYPTO}
        header={true}
        title="Crypto"
        menuButton={true}
      ></TabLayout>
    </IonPage>
  );
};

export { Crypto };
