import { IonButton, IonIcon, IonPage } from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";

const Dids = () => {
  const OtherButtons = () => {
    return (
      <>
        <IonButton
          shape="round"
          className="menu-button"
          data-testid="menu-button"
        >
          <IonIcon
            slot="icon-only"
            icon={peopleOutline}
            color="primary"
          />
        </IonButton>
        <IonButton
          shape="round"
          className="menu-button"
          data-testid="menu-button"
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

export { Dids };
