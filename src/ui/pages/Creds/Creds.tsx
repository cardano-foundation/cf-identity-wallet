import { IonPage } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";

const Creds = () => {
  return (
    <IonPage
      className="tab-layout"
      data-testid="creds-tab"
    >
      <TabLayout
        currentPath={TabsRoutePath.CREDS}
        header={true}
        title="Credentials"
        menuButton={true}
      ></TabLayout>
    </IonPage>
  );
};

export { Creds };
