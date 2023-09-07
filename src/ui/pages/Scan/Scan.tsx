import { IonPage, useIonViewWillEnter } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { Scanner } from "../../components/Scanner";
import "./Scan.scss";

const Scan = () => {
  const dispatch = useAppDispatch();

  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.SCAN }))
  );
  return (
    <IonPage
      className="tab-layout scan-tab"
      data-testid="scan-tab"
    >
      <TabLayout header={false}>
        <Scanner />
      </TabLayout>
    </IonPage>
  );
};

export { Scan };
