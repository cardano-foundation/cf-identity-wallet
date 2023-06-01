import { IonPage } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";

const Creds = () => {
  return (
    <IonPage
      className="tab-layout"
      data-testid="creds-tab"
    >
      <TabLayout
        header={true}
        title="Credentials"
        menuButton={true}
      ></TabLayout>
    </IonPage>
  );
};

export { Creds };
