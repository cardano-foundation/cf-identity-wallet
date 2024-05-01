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
import { MenuItemProps, SubMenuData, SubMenuKey } from "./Menu.types";

const emptySubMenu = {
  Component: () => <></>,
  title: "",
  additionalButtons: <></>,
};

const submenuMap = new Map<SubMenuKey, SubMenuData>([
  [
    SubMenuKey.Settings,
    {
      Component: Settings,
      title: "settings.sections.header",
      additionalButtons: <></>,
    },
  ],
]);

const MenuItem = ({ itemKey, icon, label, onClick }: MenuItemProps) => {
  return (
    <IonCol size="6">
      <IonCard
        onClick={() => onClick(itemKey)}
        data-testid={`menu-input-item-${itemKey}`}
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

  const showSelectedOption = (key: SubMenuKey) => {
    if (!submenuMap.has(key)) return;

    setShowSubMenu(true);
    setSelectedOption(key);
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

  const menuItems = [
    {
      itemKey: SubMenuKey.Profile,
      icon: personCircleOutline,
      label: `${i18n.t("menu.tab.items.profile")}`,
    },
    {
      itemKey: SubMenuKey.Crypto,
      icon: walletOutline,
      label: `${i18n.t("menu.tab.items.crypto")}`,
    },
    {
      itemKey: SubMenuKey.Connections,
      icon: peopleOutline,
      label: `${i18n.t("menu.tab.items.connections")}`,
    },
    {
      itemKey: SubMenuKey.P2P,
      icon: chatbubbleOutline,
      label: `${i18n.t("menu.tab.items.p2p")}`,
    },
    {
      itemKey: SubMenuKey.Identifier,
      icon: fingerPrintOutline,
      label: `${i18n.t("menu.tab.items.identity")}`,
    },
    {
      itemKey: SubMenuKey.Credential,
      icon: idCardOutline,
      label: `${i18n.t("menu.tab.items.credentials")}`,
    },
  ];

  const selectSubmenu = useMemo(() => {
    // NOTE: emptySubMenu is returned for unavailable selected options to not break the animation
    // by keeping the SubMenu component in the DOM
    return selectedOption !== undefined
      ? submenuMap.get(selectedOption) || emptySubMenu
      : emptySubMenu;
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
          <IonRow>
            {menuItems.map((menuItem) => (
              <MenuItem
                key={menuItem.itemKey}
                itemKey={menuItem.itemKey}
                icon={menuItem.icon}
                label={`${i18n.t(menuItem.label)}`}
                onClick={() => showSelectedOption(menuItem.itemKey)}
              />
            ))}
          </IonRow>
        </IonGrid>
      </TabLayout>
      <SubMenu
        showSubMenu={showSubMenu}
        setShowSubMenu={setShowSubMenu}
        title={`${i18n.t(selectSubmenu.title)}`}
        additionalButtons={selectSubmenu.additionalButtons}
      >
        <selectSubmenu.Component />
      </SubMenu>
    </>
  );
};

export { Menu };
