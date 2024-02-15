import { useIonViewWillEnter } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Menu.scss";
import { i18n } from "../../../i18n";

const Menu = () => {
  const pageId = "menu-tab";
  const dispatch = useAppDispatch();

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.MENU }));
  });

  return (
    <TabLayout
      pageId={pageId}
      header={true}
    >
      <div className="menu-tab-content">
        <h2>{i18n.t("menu.tab.header")}</h2>
      </div>
    </TabLayout>
  );
};

export { Menu };
