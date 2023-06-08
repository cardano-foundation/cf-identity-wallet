import { IonPage, useIonViewWillEnter } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";

const Crypto = () => {
  const dispatch = useAppDispatch();
  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.CRYPTO }))
  );
  return (
    <IonPage
      className="tab-layout"
      data-testid="crypto-tab"
    >
      <TabLayout
        header={true}
        title="Crypto"
        menuButton={true}
      ></TabLayout>
    </IonPage>
  );
};

export { Crypto };
