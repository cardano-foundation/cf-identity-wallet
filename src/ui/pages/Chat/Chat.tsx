import { IonPage } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";

const Chat = () => {
  return (
    <IonPage
      className="tab-layout"
      data-testid="chat-tab"
    >
      <TabLayout
        currentPath={TabsRoutePath.CHAT}
        header={true}
        title="Chat"
        menuButton={true}
      ></TabLayout>
    </IonPage>
  );
};

export { Chat };
