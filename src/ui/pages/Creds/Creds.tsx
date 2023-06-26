import { IonButton, IonIcon, IonPage, useIonViewWillEnter } from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
import "./Creds.scss";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { getCredsCache } from "../../../store/reducers/credsCache";

interface AdditionalButtonsProps {
  handleCreateCred: () => void;
}

const AdditionalButtons = ({ handleCreateCred }: AdditionalButtonsProps) => {
  return (
    <>
      <IonButton
        shape="round"
        className="contacts-button"
        data-testid="contacts-button"
      >
        <IonIcon
          slot="icon-only"
          icon={peopleOutline}
          color="primary"
        />
      </IonButton>
      <IonButton
        shape="round"
        className="add-button"
        data-testid="add-button"
        onClick={handleCreateCred}
      >
        <IonIcon
          slot="icon-only"
          icon={addOutline}
          color="primary"
        />
      </IonButton>
    </>
  );
};

const Creds = () => {
  const credsData = useAppSelector(getCredsCache);
  const handleCreateCred = () => {
    // TODO: Function to create Credential
  };

  const dispatch = useAppDispatch();
  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.CREDS }))
  );

  return (
    <IonPage
      className="tab-layout creds-tab"
      data-testid="creds-tab"
    >
      <TabLayout
        header={true}
        title={`${i18n.t("creds.tab.title")}`}
        menuButton={true}
        additionalButtons={
          <AdditionalButtons handleCreateCred={handleCreateCred} />
        }
      >
        {credsData.length ? (
          <CardsStack
            cardsType="creds"
            cardsData={credsData}
          />
        ) : (
          <CardsPlaceholder
            buttonLabel={i18n.t("creds.tab.create")}
            buttonAction={handleCreateCred}
          />
        )}
      </TabLayout>
    </IonPage>
  );
};

export { Creds };
