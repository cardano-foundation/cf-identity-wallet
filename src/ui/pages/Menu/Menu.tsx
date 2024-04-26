import {
  IonButton,
  IonCard,
  IonCol,
  IonGrid,
  IonIcon,
  IonLabel,
  IonRow,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  settingsOutline,
  personCircleOutline,
  walletOutline,
  peopleOutline,
  chatbubbleOutline,
  fingerPrintOutline,
  idCardOutline,
} from "ionicons/icons";
import { useMemo, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Menu.scss";
import { i18n } from "../../../i18n";
import { Settings } from "./components/Settings";
import { SubMenu } from "./components/SubMenu";
import { MenuItemProps, SubMenuKey } from "./Menu.types";

const submenuMap = new Map([
  [
    SubMenuKey.Settings,
    {
      Component: Settings,
      title: "settings.sections.header",
      addtionalButtons: <></>,
    },
  ],
]);

const MenuItem = ({ key, icon, label, onClick }: MenuItemProps) => {
  return (
    <IonCol>
      <IonCard
        onClick={() => onClick(key)}
        data-testid={`menu-input-item-${key}`}
        className="menu-input"
      >
        <IonIcon
          icon={icon}
          color="primary"
        />
        <IonLabel>{label}</IonLabel>
      </IonCard>
    </IonCol>
  );
};

const Menu = () => {
  const pageId = "menu-tab";
  const dispatch = useAppDispatch();
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    SubMenuKey | undefined
  >();

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.MENU }));
  });

  const showSelectedOption = (index: number) => {
    {
      setShowSubMenu(true);
      setSelectedOption(index);
    }
  };

  const AdditionalButtons = () => {
    return (
      <IonButton
        shape="round"
        className="settings-button"
        data-testid="settings-button"
        onClick={() => showSelectedOption(SubMenuKey.Settings)}
      >
        <IonIcon
          slot="icon-only"
          icon={settingsOutline}
          color="primary"
        />
      </IonButton>
    );
  };

  const handleCloseSubMenu = () => {
    setShowSubMenu(false);
    setSelectedOption(undefined);
  };

  const selectSubmenu = useMemo(() => {
    if (!selectedOption) return;

    return submenuMap.get(selectedOption);
  }, [selectedOption]);

  return (
    <>
      <TabLayout
        pageId={pageId}
        header={true}
        title={`${i18n.t("menu.tab.header")}`}
        additionalButtons={<AdditionalButtons />}
      >
        <IonGrid>
          <IonRow className="menu-input-row">
            <MenuItem
              key={SubMenuKey.Profile}
              icon={personCircleOutline}
              label={`${i18n.t("menu.tab.items.profile")}`}
              onClick={setSelectedOption}
            />
            <MenuItem
              key={SubMenuKey.Crypto}
              icon={walletOutline}
              label={`${i18n.t("menu.tab.items.crypto")}`}
              onClick={setSelectedOption}
            />
          </IonRow>
          <IonRow className="menu-input-row">
            <MenuItem
              key={SubMenuKey.Connections}
              icon={peopleOutline}
              label={`${i18n.t("menu.tab.items.connections")}`}
              onClick={setSelectedOption}
            />
            <MenuItem
              key={SubMenuKey.P2P}
              icon={chatbubbleOutline}
              label={`${i18n.t("menu.tab.items.p2p")}`}
              onClick={setSelectedOption}
            />
          </IonRow>
          <IonRow className="menu-input-row">
            <MenuItem
              key={SubMenuKey.Identifier}
              icon={fingerPrintOutline}
              label={`${i18n.t("menu.tab.items.identity")}`}
              onClick={setSelectedOption}
            />
            <MenuItem
              key={SubMenuKey.Credential}
              icon={idCardOutline}
              label={`${i18n.t("menu.tab.items.credentials")}`}
              onClick={setSelectedOption}
            />
          </IonRow>
        </IonGrid>
      </TabLayout>
      {selectSubmenu && (
        <SubMenu
          showSubMenu={showSubMenu}
          setShowSubMenu={handleCloseSubMenu}
          title={`${i18n.t(selectSubmenu.title)}`}
          additionalButtons={selectSubmenu.addtionalButtons}
        >
          <selectSubmenu.Component />
        </SubMenu>
      )}
    </>
  );
};

export { Menu };
