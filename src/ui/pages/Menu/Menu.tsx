import { IonButton, IonIcon, useIonViewWillEnter } from "@ionic/react";
import { settingsOutline } from "ionicons/icons";
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

  const AdditionalButtons = () => {
    return (
      <IonButton
        shape="round"
        className="connections-button"
        data-testid="connections-button"
      >
        <IonIcon
          slot="icon-only"
          icon={settingsOutline}
          color="primary"
        />
      </IonButton>
    );
  };

  return (
    <TabLayout
      pageId={pageId}
      header={true}
      title={`${i18n.t("menu.tab.header")}`}
      additionalButtons={<AdditionalButtons />}
    ></TabLayout>
  );
};

export { Menu };
