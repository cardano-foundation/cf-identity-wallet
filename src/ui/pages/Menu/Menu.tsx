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
import { useEffect, useMemo, useRef, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCurrentOperation,
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Menu.scss";
import { i18n } from "../../../i18n";
import { SubMenu } from "./components/SubMenu";
import { MenuItemProps, SubMenuData, SubMenuKey } from "./Menu.types";
import {
  ConnectWallet,
  ConnectWalletOptionRef,
} from "./components/ConnectWallet";
import { ManagePassword } from "./components/Settings/components/ManagePassword";
import { TermsAndPrivacy } from "./components/Settings/components/TermsAndPrivacy";
import { RecoverySeedPhrase } from "./components/Settings/components/RecoverySeedPhrase";
import { OperationType } from "../../globals/types";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { ProfileOptionRef } from "./components/Profile/Profile.types";
import { Connections } from "../Connections";
import { ConnectionsOptionRef } from "../Connections/Connections.types";

const emptySubMenu = {
  Component: () => <></>,
  title: "",
  closeButtonLabel: undefined,
  closeButtonAction: undefined,
  additionalButtons: <></>,
  actionButton: false,
  actionButtonAction: undefined,
  actionButtonLabel: undefined,
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
  const currentOperation = useAppSelector(getCurrentOperation);
  const connectWalletRef = useRef<ConnectWalletOptionRef>(null);
  const profileRef = useRef<ProfileOptionRef>(null);
  const connectionsRef = useRef<ConnectionsOptionRef>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    SubMenuKey | undefined
  >();

  const resetMenu = () => {
    setShowConnections(false);
    setShowSubMenu(false);
    setSelectedOption(undefined);
  };

  useIonViewWillEnter(() => {
    resetMenu();
    dispatch(setCurrentRoute({ path: TabsRoutePath.MENU }));
  });

  const backHardwareConfig = useMemo(
    () => ({
      prevent: !showSubMenu,
    }),
    [showSubMenu]
  );

  useEffect(() => {
    if (currentOperation === OperationType.BACK_TO_CONNECT_WALLET) {
      showSelectedOption(SubMenuKey.ConnectWallet);
      dispatch(setCurrentOperation(OperationType.IDLE));
    }
  }, [currentOperation]);

  const toggleEditProfile = () => {
    setIsEditingProfile((prev) => {
      const newState = !prev;
      return newState;
    });
  };
  const saveChanges = () => {
    profileRef.current?.saveChanges();
    toggleEditProfile();
  };

  useEffect(() => {
    setShowConnections(selectedOption === SubMenuKey.Connections);
  }, [selectedOption]);

  const submenuMapData: [SubMenuKey, SubMenuData][] = [
    [
      SubMenuKey.Profile,
      {
        Component: () => (
          <Profile
            ref={profileRef}
            isEditing={isEditingProfile}
          />
        ),
        closeButtonLabel: isEditingProfile
          ? `${i18n.t("menu.tab.items.profile.actioncancel")}`
          : undefined,
        closeButtonAction: isEditingProfile ? toggleEditProfile : undefined,
        title: isEditingProfile
          ? "menu.tab.items.profile.tabedit"
          : "menu.tab.items.profile.tabheader",
        pageId: isEditingProfile ? "edit-profile" : "view-profile",
        additionalButtons: <></>,
        nestedMenu: false,
        actionButton: true,
        actionButtonAction: isEditingProfile ? saveChanges : toggleEditProfile,
        actionButtonLabel: isEditingProfile
          ? `${i18n.t("menu.tab.items.profile.actionconfirm")}`
          : `${i18n.t("menu.tab.items.profile.actionedit")}`,
        renderAsModal: false,
      },
    ],
    [
      SubMenuKey.Connections,
      {
        Component: () => (
          <Connections
            showConnections={showConnections}
            setShowConnections={setShowConnections}
            selfPaginated={false}
            ref={connectionsRef}
          />
        ),
        title: "connections.tab.title",
        pageId: "connections",
        additionalButtons: (
          <IonButton
            shape="round"
            className="add-button"
            data-testid="add-connection-button"
            onClick={() => connectionsRef.current?.handleConnectModalButton()}
          >
            <IonIcon
              slot="icon-only"
              icon={addOutline}
              color="primary"
            />
          </IonButton>
        ),
        nestedMenu: false,
        renderAsModal: false,
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
        renderAsModal: false,
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
        renderAsModal: false,
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
        renderAsModal: false,
      },
    ],
    [
      SubMenuKey.TermsAndPrivacy,
      {
        Component: TermsAndPrivacy,
        title: "settings.sections.support.terms.submenu.title",
        pageId: "term-and-privacy",
        nestedMenu: true,
        additionalButtons: <></>,
        renderAsModal: false,
      },
    ],
  ];

  const submenuMap = useMemo(() => new Map(submenuMapData), [isEditingProfile]);

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
        hardwareBackButtonConfig={backHardwareConfig}
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
        closeButtonLabel={selectSubmenu.closeButtonLabel}
        closeButtonAction={selectSubmenu.closeButtonAction}
        title={`${i18n.t(selectSubmenu.title)}`}
        additionalButtons={selectSubmenu.additionalButtons}
        actionButton={selectSubmenu.actionButton}
        actionButtonAction={selectSubmenu.actionButtonAction}
        actionButtonLabel={selectSubmenu.actionButtonLabel}
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
