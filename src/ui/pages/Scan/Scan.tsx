import {IonPage, useIonViewWillEnter} from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import {useAppDispatch} from "../../../store/hooks";
import {setCurrentRoute} from "../../../store/reducers/stateCache";
import {TabsRoutePath} from "../../../routes/paths";

const Scan = () => {
  const dispatch = useAppDispatch();
  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.SCAN }))
  );
  return (
    <IonPage
      className="tab-layout"
      data-testid="scan-tab"
    >
      <TabLayout header={false}></TabLayout>
    </IonPage>
  );
};

export { Scan };
