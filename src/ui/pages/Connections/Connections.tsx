import { IonButton, IonIcon, IonPage } from "@ionic/react";
import { cardOutline, addOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { CardsStack } from "../../components/CardsStack";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { i18n } from "../../../i18n";

const AdditionalButtons = () => {
  return (
    <>
      <IonButton
        shape="round"
        className="connections-button"
        data-testid="connections-button"
      >
        <IonIcon
          slot="icon-only"
          icon={cardOutline}
          color="primary"
        />
      </IonButton>
      <IonButton
        shape="round"
        className="add-button"
        data-testid="add-button"
      >
        <IonIcon
          slot="icon-only"
          icon={addOutline}
          color="primary"
        />
      </IonButton>
    </>
  );
};

const Connections = () => {
  const connectionsData: any[] = [];
  const handleCreateConnection = () => {
    // @TODO - sdisalvo: function to create connection
  };

  return (
    <IonPage
      className="tab-layout connections-tab"
      data-testid="connections-tab"
    >
      <TabLayout
        header={true}
        title={`${i18n.t("connections.tab.title")}`}
        menuButton={true}
        additionalButtons={<AdditionalButtons />}
      >
        {connectionsData.length ? (
          <CardsStack
            cardsType="connections"
            cardsData={connectionsData}
          />
        ) : (
          <CardsPlaceholder
            buttonLabel={i18n.t("connections.tab.create")}
            buttonAction={handleCreateConnection}
          />
        )}
      </TabLayout>
    </IonPage>
  );
};

export { Connections };
