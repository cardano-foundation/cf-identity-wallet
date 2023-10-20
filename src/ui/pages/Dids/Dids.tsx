import { IonButton, IonIcon, IonPage, useIonViewWillEnter } from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
import "./Dids.scss";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getFavouritesIdentitiesCache,
  getIdentitiesCache,
} from "../../../store/reducers/identitiesCache";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { CreateIdentity } from "../../components/CreateIdentity";
import { CardTypes } from "../../constants/dictionary";

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
  const didsData = useAppSelector(getIdentitiesCache);
  const favouritesDids = useAppSelector(getFavouritesIdentitiesCache);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.DIDS }));
  });

  const findTimeById = (id: string) => {
    const found = favouritesDids.find((item) => item.id === id);
    return found ? found.time : null;
  };

  const favDids = didsData.filter((did) =>
    favouritesDids.some((fav) => fav.id === did.id)
  );

  const sortedFavDids = favDids.sort((a, b) => {
    const timeA = findTimeById(a.id);
    const timeB = findTimeById(b.id);

    if (timeA === null && timeB === null) return 0;
    if (timeA === null) return 1;
    if (timeB === null) return -1;

    return timeA - timeB;
  });

  const allDids = didsData.filter(
    (did) => !favouritesDids.some((fav) => fav.id === did.id)
  );

  return (
    <IonPage
      className="tab-layout dids-tab"
      data-testid="dids-tab"
    >
      <TabLayout
        header={true}
        title={`${i18n.t("identity.tab.title")}`}
        menuButton={true}
        additionalButtons={
          <AdditionalButtons handleCreateDid={() => setModalIsOpen(true)} />
        }
      >
        {didsData.length ? (
          <>
            {favDids.length ? (
              <>
                {allDids.length ? (
                  <div className="cards-title">
                    {i18n.t("creds.tab.favourites")}
                  </div>
                ) : null}
                <CardsStack
                  cardsType={CardTypes.DIDS}
                  cardsData={sortedFavDids}
                />
              </>
            ) : null}
            {allDids.length ? (
              <>
                {favDids.length ? (
                  <div className="cards-title cards-title-all">
                    {i18n.t("creds.tab.alldids")}
                  </div>
                ) : null}
                <CardsStack
                  cardsType={CardTypes.DIDS}
                  cardsData={allDids}
                />
              </>
            ) : null}
          </>
        ) : (
          <CardsPlaceholder
            buttonLabel={i18n.t("identity.tab.create")}
            buttonAction={() => setModalIsOpen(true)}
            testId="dids-cards-placeholder"
          />
        )}

        <CreateIdentity
          modalIsOpen={modalIsOpen}
          setModalIsOpen={(isOpen: boolean) => setModalIsOpen(isOpen)}
        />
      </TabLayout>
    </IonPage>
  );
};

export { Dids, AdditionalButtons };
