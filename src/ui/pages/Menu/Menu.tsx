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

  const handleItemSelection = (index: number) => {
    // @TODO - sdisalvo: add some logic for selection
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
          onClick={() => handleItemSelection(index)}
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
            icon={personCircleOutline}
            label={`${i18n.t("menu.tab.items.profile")}`}
          />
          <MenuItem
            index={1}
            icon={walletOutline}
            label={`${i18n.t("menu.tab.items.crypto")}`}
          />
        </IonRow>
        <IonRow className="menu-input-row">
          <MenuItem
            index={2}
            icon={peopleOutline}
            label={`${i18n.t("menu.tab.items.connections")}`}
          />
          <MenuItem
            index={3}
            icon={chatbubbleOutline}
            label={`${i18n.t("menu.tab.items.p2p")}`}
          />
        </IonRow>
        <IonRow className="menu-input-row">
          <MenuItem
            index={4}
            icon={fingerPrintOutline}
            label={`${i18n.t("menu.tab.items.identity")}`}
          />
          <MenuItem
            index={5}
            icon={idCardOutline}
            label={`${i18n.t("menu.tab.items.credentials")}`}
          />
        </IonRow>
      </IonGrid>
    </TabLayout>
  );
};

export { Menu };
