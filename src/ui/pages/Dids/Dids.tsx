import {
  IonButton,
  IonIcon,
  IonPage,
  IonToast,
  useIonViewWillEnter,
} from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
import "./Dids.scss";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getIdentitiesCache } from "../../../store/reducers/identitiesCache";
import {
  getCurrentRoute,
  getStateCache,
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { CreateIdentity } from "../../components/CreateIdentity";
import { cardTypes, toastState } from "../../constants/dictionary";

interface AdditionalButtonsProps {
  handleCreateDid: () => void;
}

const AdditionalButtons = ({ handleCreateDid }: AdditionalButtonsProps) => {
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
        onClick={handleCreateDid}
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

const Dids = () => {
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const currentRoute = useAppSelector(getCurrentRoute);
  const didsData = useAppSelector(getIdentitiesCache);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.DIDS }));
  });

  useEffect(() => {
    if (
      stateCache.currentOperation === toastState.identityDeleted &&
      currentRoute?.path === TabsRoutePath.DIDS
    ) {
      setShowToast(true);
    }
  }, [stateCache.currentOperation, currentRoute]);

  return (
    <IonPage
      className="tab-layout dids-tab"
      data-testid="dids-tab"
    >
      <TabLayout
        header={true}
        title={`${i18n.t("dids.tab.title")}`}
        menuButton={true}
        additionalButtons={
          <AdditionalButtons handleCreateDid={() => setModalIsOpen(true)} />
        }
      >
        {didsData.length ? (
          <CardsStack
            cardsType={cardTypes.dids}
            cardsData={didsData}
          />
        ) : (
          <CardsPlaceholder
            buttonLabel={i18n.t("dids.tab.create")}
            buttonAction={() => setModalIsOpen(true)}
            testId="dids-cards-placeholder"
          />
        )}
        <CreateIdentity
          modalIsOpen={modalIsOpen}
          setModalIsOpen={(isOpen: boolean) => setModalIsOpen(isOpen)}
        />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => {
            setShowToast(false);
            dispatch(setCurrentOperation(""));
          }}
          message={`${i18n.t("toast.identityDeleted")}`}
          color="secondary"
          position="top"
          cssClass="confirmation-toast"
          duration={1500}
        />
      </TabLayout>
    </IonPage>
  );
};

export { Dids, AdditionalButtons };
