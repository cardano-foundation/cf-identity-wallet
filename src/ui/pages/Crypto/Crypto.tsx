import { IonPage } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";

const Crypto = () => {
  return (
    <IonPage
      className="tab-layout"
      data-testid="crypto-tab"
    >
      <TabLayout
        header={true}
        title="Crypto"
        menuButton={true}
      ></TabLayout>
    </IonPage>
  );
};

export { Crypto };
