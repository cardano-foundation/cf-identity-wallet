import { IonPage, useIonViewWillEnter } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Chat.scss";
import { i18n } from "../../../i18n";

const Chat = () => {
  const dispatch = useAppDispatch();

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.CHAT }));
  });

  return (
    <IonPage
      className="tab-layout"
      data-testid="chat-tab"
    >
      <TabLayout
        header={true}
        menuButton={true}
      >
        <div className="chat-tab-content">
          <h2>{i18n.t("chat.tab.header")}</h2>
        </div>
      </TabLayout>
    </IonPage>
  );
};

export { Chat };
