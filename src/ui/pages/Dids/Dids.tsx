import { IonButton, IonIcon, IonPage } from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
import { didsMock } from "../../__mocks__/didsMock";
import "./Dids.scss";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";

const didsData = didsMock;

const AdditionalButtons = () => {
  return (
    <>
      <IonButton
        shape="round"
        className="contacts-button"
        data-testid="contacts-button"
      >
        <IonIcon
          slot="icon-only"
          icon={peopleOutline}
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

const handleCreateDid = () => {
  // TODO: Function to create DID
};

const Dids = () => {
  return (
    <IonPage
      className="tab-layout dids-tab"
      data-testid="dids-tab"
    >
      <TabLayout
        header={true}
        title="Identities"
        menuButton={true}
        additionalButtons={<AdditionalButtons />}
      >
        {didsData.length ? (
          <CardsStack
            cardsType="dids"
            cardsData={didsData}
          />
        ) : (
          <CardsPlaceholder
            buttonLabel={i18n.t("dids.label.create")}
            buttonAction={handleCreateDid}
          />
        )}
      </TabLayout>
    </IonPage>
  );
};

export { Dids, AdditionalButtons };
