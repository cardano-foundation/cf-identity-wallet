import { useHistory } from "react-router-dom";
import { IonButton, IonIcon, IonPage, useIonViewWillEnter } from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
import "./Creds.scss";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { getCredsCache } from "../../../store/reducers/credsCache";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";

interface AdditionalButtonsProps {
  handleCreateCred: () => void;
  handleConnections: () => void;
}

const AdditionalButtons = ({
  handleCreateCred,
  handleConnections,
}: AdditionalButtonsProps) => {
  return (
    <>
      <IonButton
        shape="round"
        className="connections-button"
        data-testid="connections-button"
        onClick={handleConnections}
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
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const credsData = useAppSelector(getCredsCache);

  const handleCreateCred = () => {
    // TODO: Function to create Credential
  };

  const handleConnections = () => {
    const data: DataProps = {
      store: { stateCache },
    };
    const { nextPath, updateRedux } = getNextRoute(TabsRoutePath.CREDS, data);
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    history.push(nextPath.pathname);
  };

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
          <AdditionalButtons
            handleCreateCred={handleCreateCred}
            handleConnections={handleConnections}
          />
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
