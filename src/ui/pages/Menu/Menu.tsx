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
  globeOutline,
} from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import {
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { RoutePath, TabsRoutePath } from "../../../routes/paths";
import "./Menu.scss";
import { i18n } from "../../../i18n";
import { OperationType } from "../../globals/types";
import { useHistory } from "react-router-dom";

const Menu = () => {
  const pageId = "menu-tab";
  const dispatch = useAppDispatch();
  const history = useHistory();

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.MENU }));
  });

  const AdditionalButtons = () => {
    return (
      <IonButton
        shape="round"
        className="settings-button"
        data-testid="settings-button"
        onClick={() => {
          dispatch(setCurrentOperation(OperationType.SHOW_SETTINGS));
        }}
      >
        <IonIcon
          slot="icon-only"
          icon={settingsOutline}
          color="primary"
        />
      </IonButton>
    );
  };

  const handleItemSelection = (route: string) => {
    if (!route.length) return;
    dispatch(setCurrentRoute({ path: route }));
    history.push({
      pathname: route,
    });
  };

  const MenuItem = ({
    index,
    route,
    icon,
    label,
  }: {
    index: number;
    route: string;
    icon: string;
    label: string;
  }) => {
    return (
      <IonCol>
        <IonCard
          onClick={() => handleItemSelection(route)}
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

  return (
    <TabLayout
      pageId={pageId}
      header={true}
      title={`${i18n.t("menu.tab.header")}`}
      additionalButtons={<AdditionalButtons />}
    >
      <IonGrid>
        <IonRow className="menu-input-row">
          <MenuItem
            index={0}
            route=""
            icon={personCircleOutline}
            label={`${i18n.t("menu.tab.items.profile")}`}
          />
          <MenuItem
            index={1}
            route=""
            icon={walletOutline}
            label={`${i18n.t("menu.tab.items.crypto")}`}
          />
        </IonRow>
        <IonRow className="menu-input-row">
          <MenuItem
            index={2}
            route=""
            icon={peopleOutline}
            label={`${i18n.t("menu.tab.items.connections")}`}
          />
          <MenuItem
            index={3}
            route=""
            icon={chatbubbleOutline}
            label={`${i18n.t("menu.tab.items.p2p")}`}
          />
        </IonRow>
        <IonRow className="menu-input-row">
          <MenuItem
            index={4}
            route=""
            icon={fingerPrintOutline}
            label={`${i18n.t("menu.tab.items.identity")}`}
          />
          <MenuItem
            index={5}
            route=""
            icon={idCardOutline}
            label={`${i18n.t("menu.tab.items.credentials")}`}
          />
        </IonRow>
        <IonRow className="menu-input-row">
          <MenuItem
            index={6}
            route={RoutePath.TUNNEL_CONNECT}
            icon={globeOutline}
            label={`${i18n.t("menu.tab.items.tunnel")}`}
          />

          <MenuItem
            index={7}
            route=""
            icon=""
            label=""
          />
        </IonRow>
      </IonGrid>
    </TabLayout>
  );
};

export { Menu };
