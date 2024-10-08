import {
  IonButton,
  IonGrid,
  IonIcon,
  IonRow,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  settingsOutline,
  personCircleOutline,
  walletOutline,
  peopleOutline,
  linkOutline,
  chatbubbleOutline,
} from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { Browser } from "@capacitor/browser";
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
import { MenuItemProps, SubMenuKey } from "./Menu.types";
import { OperationType } from "../../globals/types";
import { CHAT_LINK, CRYPTO_LINK } from "../../globals/constants";
import { emptySubMenu, SubMenuItems } from "./components/SubMenuItems";
import MenuItem from "./components/MenuItem";

const Menu = () => {
  const pageId = "menu-tab";
  const dispatch = useAppDispatch();
  const currentOperation = useAppSelector(getCurrentOperation);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    SubMenuKey | undefined
  >();

  useIonViewWillEnter(() => {
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

  const handleOpenUrl = (key: SubMenuKey.Crypto | SubMenuKey.Chat) => {
    switch (key) {
    case SubMenuKey.Crypto: {
      Browser.open({ url: CRYPTO_LINK });
      break;
    }
    case SubMenuKey.Chat: {
      Browser.open({ url: CHAT_LINK });
      break;
    }
    default:
      return;
    }
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
      subLabel: `${i18n.t("menu.tab.items.crypto.sublabel")}`,
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
      subLabel: `${i18n.t("menu.tab.items.connectwallet.sublabel")}`,
    },
    {
      itemKey: SubMenuKey.Chat,
      icon: chatbubbleOutline,
      label: `${i18n.t("menu.tab.items.chat.title")}`,
      subLabel: `${i18n.t("menu.tab.items.chat.sublabel")}`,
    },
  ];

  const showSelectedOption = (key: SubMenuKey) => {
    if (key === SubMenuKey.Crypto || key === SubMenuKey.Chat) {
      handleOpenUrl(key);
    }
    if (!subMenuItems.has(key)) return;
    setShowSubMenu(true);
    setSelectedOption(key);
  };

  const subMenuItems = SubMenuItems(selectedOption, showSelectedOption);

  const selectSubmenu = useMemo(() => {
    // NOTE: emptySubMenu is returned for unavailable selected options to not break the animation
    // by keeping the SubMenu component in the DOM
    return selectedOption !== undefined
      ? subMenuItems.get(selectedOption) || emptySubMenu
      : emptySubMenu;
  }, [selectedOption, subMenuItems]);

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
