import {
  IonButton,
  IonIcon,
  IonPage,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
import "./Dids.scss";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getDidsCache } from "../../../store/reducers/didsCache";
import {
  removeRoute,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";

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

const Dids = () => {
  const didsData = useAppSelector(getDidsCache);
  const handleCreateDid = () => {
    // TODO: Function to create DID
  };

  const dispatch = useAppDispatch();
  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.DIDS }))
  );

  return (
    <IonPage
      className="tab-layout dids-tab"
      data-testid="dids-tab"
    >
      <TabLayout
        header={true}
        title={`${i18n.t("dids.tab.title")}`}
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
            buttonLabel={i18n.t("dids.tab.create")}
            buttonAction={handleCreateDid}
          />
        )}
      </TabLayout>
    </IonPage>
  );
};

export { Dids, AdditionalButtons };
