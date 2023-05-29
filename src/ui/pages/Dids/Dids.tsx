import { IonButton, IonIcon, IonPage } from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";

const OtherButtons = () => {
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

const Dids = () => {
  return (
    <IonPage
      className="tab-layout"
      data-testid="dids-tab"
    >
      <TabLayout
        currentPath={TabsRoutePath.DIDS}
        header={true}
        title="Identities"
        menuButton={true}
        otherButtons={<OtherButtons />}
      ></TabLayout>
    </IonPage>
  );
};

export { Dids, OtherButtons };
