import { IonPage } from "@ionic/react";
import { PageLayout } from "../../components/layout/PageLayout";

const Crypto = () => {
  return (
    <IonPage className="page-layout crypto-page">
      <PageLayout
        header={true}
        menuButton={true}
      >
        <div>Crypto</div>
      </PageLayout>
    </IonPage>
  );
};

export { Crypto };
