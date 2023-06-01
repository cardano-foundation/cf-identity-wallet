import { IonPage } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";

const Scan = () => {
  return (
    <IonPage
      className="tab-layout"
      data-testid="scan-tab"
    >
      <TabLayout header={false}></TabLayout>
    </IonPage>
  );
};

export { Scan };
