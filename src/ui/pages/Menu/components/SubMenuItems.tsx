import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addOutline } from "ionicons/icons";
import { IonButton, IonIcon } from "@ionic/react";
import { SubMenuData, SubMenuKey } from "../Menu.types";
import { Profile } from "./Profile";
import { i18n } from "../../../../i18n";
import { Connections } from "../../Connections";
import { ConnectWallet, ConnectWalletOptionRef } from "./ConnectWallet";
import { Settings } from "./Settings";
import { ManagePassword } from "./Settings/components/ManagePassword";
import { RecoverySeedPhrase } from "./Settings/components/RecoverySeedPhrase";
import { TermsAndPrivacy } from "./Settings/components/TermsAndPrivacy";
import { ProfileOptionRef } from "./Profile/Profile.types";
import { ConnectionsOptionRef } from "../../Connections/Connections.types";

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

const SubMenuItems = (
  selectedOption: unknown,
  showSelectedOption: (key: SubMenuKey) => void
) => {
  const profileRef = useRef<ProfileOptionRef>(null);
  const connectionsRef = useRef<ConnectionsOptionRef>(null);
  const connectWalletRef = useRef<ConnectWalletOptionRef>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const RENDER_SETTING_AS_MODAL = false;

  useEffect(() => {
    setShowConnections(selectedOption === SubMenuKey.Connections);
  }, [selectedOption]);

  const backToParentMenu = useCallback(() => {
    showSelectedOption(SubMenuKey.Settings);
  }, []);

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

  const menuMapData: [SubMenuKey, SubMenuData][] = [
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
  ];

  const settingsMapData: [SubMenuKey, SubMenuData][] = [
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
        renderAsModal: RENDER_SETTING_AS_MODAL,
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
        renderAsModal: RENDER_SETTING_AS_MODAL,
      },
    ],
    [
      SubMenuKey.RecoverySeedPhrase,
      {
        Component: () => <RecoverySeedPhrase onClose={backToParentMenu} />,
        title: "settings.sections.security.seedphrase.page.title",
        pageId: "recovery-seed-phrase",
        nestedMenu: true,
        additionalButtons: <></>,
        renderAsModal: RENDER_SETTING_AS_MODAL,
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
        renderAsModal: RENDER_SETTING_AS_MODAL,
      },
    ],
  ];

  const subMenuMapData: [SubMenuKey, SubMenuData][] = [
    ...menuMapData,
    ...settingsMapData,
  ];

  return useMemo(() => new Map(subMenuMapData), [isEditingProfile]);
};

export { emptySubMenu, SubMenuItems };
