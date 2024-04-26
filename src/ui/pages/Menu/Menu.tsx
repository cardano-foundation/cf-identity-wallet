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
import { SubMenuKey } from "./Menu.types";

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

const Menu = () => {
  const pageId = "menu-tab";
  const dispatch = useAppDispatch();
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);

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

  const MenuItem = ({
    index,
    icon,
    label,
  }: {
    index: number;
    icon: string;
    label: string;
  }) => {
    return (
      <IonCol>
        <IonCard
          onClick={() => showSelectedOption(index)}
          data-testid={`menu-input-item-${index}`}
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

  const selectSubmenu = useMemo(() => {
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
              index={SubMenuKey.Profile}
              icon={personCircleOutline}
              label={`${i18n.t("menu.tab.items.profile")}`}
            />
            <MenuItem
              index={SubMenuKey.Cryto}
              icon={walletOutline}
              label={`${i18n.t("menu.tab.items.crypto")}`}
            />
          </IonRow>
          <IonRow className="menu-input-row">
            <MenuItem
              index={SubMenuKey.Connections}
              icon={peopleOutline}
              label={`${i18n.t("menu.tab.items.connections")}`}
            />
            <MenuItem
              index={SubMenuKey.P2P}
              icon={chatbubbleOutline}
              label={`${i18n.t("menu.tab.items.p2p")}`}
            />
          </IonRow>
          <IonRow className="menu-input-row">
            <MenuItem
              index={SubMenuKey.Identifier}
              icon={fingerPrintOutline}
              label={`${i18n.t("menu.tab.items.identity")}`}
            />
            <MenuItem
              index={SubMenuKey.Credential}
              icon={idCardOutline}
              label={`${i18n.t("menu.tab.items.credentials")}`}
            />
          </IonRow>
        </IonGrid>
      </TabLayout>
      {selectSubmenu && (
        <SubMenu
          showSubMenu={showSubMenu}
          setShowSubMenu={setShowSubMenu}
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
