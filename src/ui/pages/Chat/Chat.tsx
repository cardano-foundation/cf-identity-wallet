import {IonPage, useIonViewWillEnter} from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import {useAppDispatch} from "../../../store/hooks";
import {setCurrentRoute} from "../../../store/reducers/stateCache";
import {TabsRoutePath} from "../../../routes/paths";

const Chat = () => {
  const dispatch = useAppDispatch();
  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.CHAT }))
  );
  return (
    <IonPage
      className="tab-layout"
      data-testid="chat-tab"
    >
      <TabLayout
        header={true}
        title="Chat"
        menuButton={true}
      ></TabLayout>
    </IonPage>
  );
};

export { Chat };
