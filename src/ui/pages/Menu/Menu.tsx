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
import { useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Menu.scss";
import { i18n } from "../../../i18n";
import { Settings } from "./components/Settings";
import { SubMenu } from "./components/SubMenu";

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
        onClick={() => showSelectedOption(0)}
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

  const SubMenuChildren = [Settings];
  const subMenuTitle = ["settings.sections.header"];
  const subMenuAdditionalButtons = [<></>];

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
              index={1}
              icon={personCircleOutline}
              label={`${i18n.t("menu.tab.items.profile")}`}
            />
            <MenuItem
              index={2}
              icon={walletOutline}
              label={`${i18n.t("menu.tab.items.crypto")}`}
            />
          </IonRow>
          <IonRow className="menu-input-row">
            <MenuItem
              index={3}
              icon={peopleOutline}
              label={`${i18n.t("menu.tab.items.connections")}`}
            />
            <MenuItem
              index={4}
              icon={chatbubbleOutline}
              label={`${i18n.t("menu.tab.items.p2p")}`}
            />
          </IonRow>
          <IonRow className="menu-input-row">
            <MenuItem
              index={5}
              icon={fingerPrintOutline}
              label={`${i18n.t("menu.tab.items.identity")}`}
            />
            <MenuItem
              index={6}
              icon={idCardOutline}
              label={`${i18n.t("menu.tab.items.credentials")}`}
            />
          </IonRow>
        </IonGrid>
      </TabLayout>
      <SubMenu
        showSubMenu={showSubMenu}
        setShowSubMenu={setShowSubMenu}
        title={`${i18n.t(subMenuTitle[selectedOption])}`}
        additionalButtons={subMenuAdditionalButtons[selectedOption]}
      >
        {SubMenuChildren[selectedOption] && SubMenuChildren[selectedOption]()}
      </SubMenu>
    </>
  );
};

export { Menu };
