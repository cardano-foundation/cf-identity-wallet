import { IonButton, IonIcon, IonPage } from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { i18n } from "../../../i18n";
import { identity } from "../../__mocks__/identityMock";
import { DidsProps } from "./Dids.types";
import "./Dids.scss";

const identities = [];
//identities.push(identity);

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

const IdentityPlaceholder = () => {
  return (
    <div className="identity-placeholder">
      <div className="identity-placeholder-cards">
        <span className="back-card" />
        <span className="front-card" />
      </div>
      <IonButton
        shape="round"
        expand="block"
        className="ion-primary-button"
      >
        <IonIcon
          slot="icon-only"
          size="small"
          icon={addOutline}
          color="primary"
        />
        {i18n.t("dids.label.create")}
      </IonButton>
    </div>
  );
};

const IdentityCards = () => {
  return <div>Cards</div>;
};

const Dids = () => {
  return (
    <IonPage
      className="tab-layout dids-tab"
      data-testid="dids-tab"
    >
      <TabLayout
        currentPath={TabsRoutePath.DIDS}
        header={true}
        title="Identities"
        menuButton={true}
        otherButtons={<OtherButtons />}
      >
        {identities.length ? <IdentityCards /> : <IdentityPlaceholder />}
      </TabLayout>
    </IonPage>
  );
};

export { Dids, OtherButtons };
