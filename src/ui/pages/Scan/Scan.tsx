import { IonPage } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";

const Scan = () => {
  return (
    <IonPage
      className="tab-layout"
      data-testid="scan-tab"
    >
      <TabLayout
        currentPath={TabsRoutePath.SCAN}
        header={false}
      ></TabLayout>
    </IonPage>
  );
};

export { Scan };
