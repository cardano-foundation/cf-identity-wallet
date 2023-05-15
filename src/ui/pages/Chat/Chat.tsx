import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";

const Chat = () => {
  return (
    <IonPage
      className="page-layout chat-page"
      data-testid="chat-page"
    >
      <PageLayout
        header={true}
        menuButton={true}
      >
        <div>Chat</div>
      </PageLayout>
    </IonPage>
  );
};

export { Chat };
