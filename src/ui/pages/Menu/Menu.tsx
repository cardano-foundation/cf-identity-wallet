import {
  IonButton,
  IonCol,
  IonIcon,
  IonItem,
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
    console.log("selected: ", index);
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
        <IonItem
          onClick={() => handleItemSelection(index)}
          data-testid={`menu-input-item-${index}`}
          className="menu-input"
        >
          <IonIcon
            slot="start"
            icon={icon}
            color="primary"
          />
          <IonLabel>{label}</IonLabel>
        </IonItem>
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
      <>
        <IonRow className="menu-input-row">
          <MenuItem
            index={0}
            icon={personCircleOutline}
            label={"Profile"}
          />
          <MenuItem
            index={1}
            icon={walletOutline}
            label={"Crypto"}
          />
        </IonRow>
        <IonRow className="menu-input-row">
          <MenuItem
            index={2}
            icon={peopleOutline}
            label={"Connections"}
          />
          <MenuItem
            index={3}
            icon={chatbubbleOutline}
            label={"P2P"}
          />
        </IonRow>
        <IonRow className="menu-input-row">
          <MenuItem
            index={4}
            icon={fingerPrintOutline}
            label={"Identity"}
          />
          <MenuItem
            index={5}
            icon={idCardOutline}
            label={"Credentials"}
          />
        </IonRow>
      </>
    </TabLayout>
  );
};

export { Menu };
