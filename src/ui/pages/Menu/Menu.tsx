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
  linkOutline,
  addOutline,
} from "ionicons/icons";
import { useMemo, useRef, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Menu.scss";
import { i18n } from "../../../i18n";
import { SubMenu } from "./components/SubMenu";
import { MenuItemProps, SubMenuData, SubMenuKey } from "./Menu.types";
import { Settings } from "./components/Settings";
import {
  ConnectWallet,
  ConnectWalletOptionRef,
} from "./components/ConnectWallet";
import { ManagePassword } from "./components/Settings/components/ManagePassword";
import { TermAndPrivacy } from "./components/Settings/components/TermAndPrivacy";
import { RecoverySeedPhrase } from "./components/Settings/components/RecoverySeedPhrase";

const emptySubMenu = {
  Component: () => <></>,
  title: "",
  additionalButtons: <></>,
  pageId: "empty",
  nestedMenu: false,
  renderAsModal: false,
};

const MenuItem = ({
  itemKey,
  icon,
  label,
  onClick,
  subLabel,
}: MenuItemProps) => {
  return (
    <IonCol size="6">
      <IonCard
        onClick={() => onClick(itemKey)}
        data-testid={`menu-input-item-${itemKey}`}
        className="menu-input"
      >
        <div className="menu-item-icon">
          <IonIcon
            icon={icon}
            color="primary"
          />
          {subLabel && <span className="sub-label">{subLabel}</span>}
        </div>
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

  const connectWalletRef = useRef<ConnectWalletOptionRef>(null);

  const submenuMapData: [SubMenuKey, SubMenuData][] = [
    [
      SubMenuKey.Settings,
      {
        Component: (props?: { switchView: (key: SubMenuKey) => void }) => (
          <Settings
            {...props}
            switchView={showSelectedOption}
          />
        ),
        title: "settings.sections.header",
        additionalButtons: <></>,
        pageId: "menu-setting",
        nestedMenu: false,
      },
    ],
    [
      SubMenuKey.ManagePassword,
      {
        Component: ManagePassword,
        title: "settings.sections.security.managepassword.page.title",
        additionalButtons: <></>,
        pageId: "manage-password",
        nestedMenu: true,
      },
    ],
    [
      SubMenuKey.ConnectWallet,
      {
        Component: () => <ConnectWallet ref={connectWalletRef} />,
        title: "menu.tab.items.connectwallet.tabheader",
        pageId: "connect-wallet",
        nestedMenu: false,
        additionalButtons: (
          <IonButton
            shape="round"
            className="connect-wallet-button"
            data-testid="menu-add-connection-button"
            onClick={() => connectWalletRef.current?.openConnectWallet()}
          >
            <IonIcon
              slot="icon-only"
              icon={addOutline}
              color="primary"
            />
          </IonButton>
        ),
        renderAsModal: false,
      },
    ],
    [
      SubMenuKey.TermAndPrivacy,
      {
        Component: TermAndPrivacy,
        title: "settings.sections.support.terms.submenu.title",
        pageId: "term-and-privacy",
        nestedMenu: true,
        additionalButtons: <></>,
      },
    ],
    [
      SubMenuKey.RecoverySeedPhrase,
      {
        Component: RecoverySeedPhrase,
        title: "settings.sections.security.seedphrase.page.title",
        pageId: "recovery-seed-phrase",
        nestedMenu: true,
        additionalButtons: <></>,
      },
    ],
  ];

  const submenuMap = useMemo(() => new Map(submenuMapData), []);

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

  const menuItems: Omit<MenuItemProps, "onClick">[] = [
    {
      itemKey: SubMenuKey.Profile,
      icon: personCircleOutline,
      label: `${i18n.t("menu.tab.items.profile.title")}`,
    },
    {
      itemKey: SubMenuKey.Crypto,
      icon: walletOutline,
      label: `${i18n.t("menu.tab.items.crypto.title")}`,
    },
    {
      itemKey: SubMenuKey.Connections,
      icon: peopleOutline,
      label: `${i18n.t("menu.tab.items.connections.title")}`,
    },
    {
      itemKey: SubMenuKey.ConnectWallet,
      icon: linkOutline,
      label: `${i18n.t("menu.tab.items.connectwallet.title")}`,
      subLabel: `${i18n.t("menu.tab.items.connectwallet.cip")}`,
    },
  ];

  const selectSubmenu = useMemo(() => {
    // NOTE: emptySubMenu is returned for unavailable selected options to not break the animation
    // by keeping the SubMenu component in the DOM
    return selectedOption !== undefined
      ? submenuMap.get(selectedOption) || emptySubMenu
      : emptySubMenu;
  }, [selectedOption, submenuMap]);

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
                subLabel={menuItem.subLabel}
                onClick={() => showSelectedOption(menuItem.itemKey)}
              />
            ))}
          </IonRow>
        </IonGrid>
      </TabLayout>
      <SubMenu
        showSubMenu={showSubMenu}
        setShowSubMenu={setShowSubMenu}
        nestedMenu={selectSubmenu.nestedMenu}
        title={`${i18n.t(selectSubmenu.title)}`}
        additionalButtons={selectSubmenu.additionalButtons}
        pageId={selectSubmenu.pageId}
        switchView={showSelectedOption}
        renderAsModal={selectSubmenu.renderAsModal}
      >
        <selectSubmenu.Component />
      </SubMenu>
    </>
  );
};

export { Menu };
