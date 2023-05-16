import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";
import {RoutePath} from "../../../routes";
import {TabsRoutePath} from "../../components/navigation/TabsMenu";

const Chat = () => {
  return (
    <IonPage
      className="page-layout chat-page"
      data-testid="chat-page"
    >
      <PageLayout
        header={true}
        menuButton={true}
        currentPath={TabsRoutePath.CHAT}
      >
        <div>Chat</div>
      </PageLayout>
    </IonPage>
  );
};

export { Chat };
