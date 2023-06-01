import { IonPage } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";

const Chat = () => {
  return (
    <IonPage
      className="tab-layout"
      data-testid="chat-tab"
    >
      <TabLayout
        header={true}
        title="Chat"
        menuButton={true}
      ></TabLayout>
    </IonPage>
  );
};

export { Chat };
