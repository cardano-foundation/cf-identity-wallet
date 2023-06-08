import {
  IonPage,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useHistory, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import {
  removeRoute,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";

const Creds = () => {
  const dispatch = useAppDispatch();
  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.CREDS }))
  );

  return (
    <IonPage
      className="tab-layout"
      data-testid="creds-tab"
    >
      <TabLayout
        header={true}
        title="Credentials"
        menuButton={true}
      ></TabLayout>
    </IonPage>
  );
};

export { Creds };
