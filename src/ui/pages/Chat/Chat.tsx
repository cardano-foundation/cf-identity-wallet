import { useIonViewWillEnter } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Chat.scss";
import { i18n } from "../../../i18n";

const Chat = () => {
  const pageId = "chat-tab";
  const dispatch = useAppDispatch();

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.CHAT }));
  });

  return (
    <TabLayout
      pageId={pageId}
      header={true}
    >
      <div className="chat-tab-content">
        <h2>{i18n.t("chat.tab.header")}</h2>
      </div>
    </TabLayout>
  );
};

export { Chat };
