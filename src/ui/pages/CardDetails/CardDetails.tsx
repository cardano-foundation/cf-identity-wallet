import { useLocation } from "react-router-dom";
import { IonButton, IonIcon, IonPage } from "@ionic/react";
import { shareOutline, ellipsisVertical } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import { i18n } from "../../../i18n";
import { CardsStack } from "../../components/CardsStack";
import { CardsStackProps } from "../../components/CardsStack/CardsStack.types";

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
          icon={shareOutline}
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
          icon={ellipsisVertical}
          color="primary"
        />
      </IonButton>
    </>
  );
};

const CardDetails = () => {
  const location = useLocation();
  const cardsData: CardsStackProps[] = [location.state as CardsStackProps];
  return (
    <IonPage
      className="tab-layout dids-tab"
      data-testid="dids-tab"
    >
      <TabLayout
        currentPath={TabsRoutePath.CARD_DETAILS}
        header={true}
        title="Card details"
        menuButton={false}
        otherButtons={<OtherButtons />}
      >
        <CardsStack
          cardsType="dids"
          cardsData={cardsData}
        />
      </TabLayout>
    </IonPage>
  );
};

export { CardDetails, OtherButtons };
