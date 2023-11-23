import { IonButton, IonIcon, IonPage, useIonViewWillEnter } from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
import "./Identifiers.scss";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getFavouritesIdentifiersCache,
  getIdentifiersCache,
} from "../../../store/reducers/identifiersCache";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { CreateIdentifier } from "../../components/CreateIdentifier";
import { CardType } from "../../globals/types";

interface AdditionalButtonsProps {
  handleCreateIdentifier: () => void;
}

const AdditionalButtons = ({
  handleCreateIdentifier,
}: AdditionalButtonsProps) => {
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
        onClick={handleCreateIdentifier}
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

const Identifiers = () => {
  const dispatch = useAppDispatch();
  const identifiersData = useAppSelector(getIdentifiersCache);
  const favouritesIdentifiers = useAppSelector(getFavouritesIdentifiersCache);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.IDENTIFIERS }));
  });

  const findTimeById = (id: string) => {
    const found = favouritesIdentifiers?.find((item) => item.id === id);
    return found ? found.time : null;
  };

  const favIdentifiers = identifiersData.filter((identifier) =>
    favouritesIdentifiers?.some((fav) => fav.id === identifier.id)
  );

  const sortedFavIdentifiers = favIdentifiers.sort((a, b) => {
    const timeA = findTimeById(a.id);
    const timeB = findTimeById(b.id);

    if (timeA === null && timeB === null) return 0;
    if (timeA === null) return 1;
    if (timeB === null) return -1;

    return timeA - timeB;
  });

  const allIdentifiers = identifiersData.filter(
    (identifier) =>
      !favouritesIdentifiers?.some((fav) => fav.id === identifier.id)
  );

  return (
    <IonPage
      className="tab-layout identifiers-tab"
      data-testid="identifiers-tab"
    >
      <TabLayout
        header={true}
        title={`${i18n.t("identifiers.tab.title")}`}
        menuButton={true}
        additionalButtons={
          <AdditionalButtons
            handleCreateIdentifier={() => setModalIsOpen(true)}
          />
        }
      >
        {identifiersData.length ? (
          <>
            {favIdentifiers.length ? (
              <>
                {allIdentifiers.length ? (
                  <div className="cards-title">
                    {i18n.t("creds.tab.favourites")}
                  </div>
                ) : null}
                <CardsStack
                  name="favs"
                  cardsType={CardType.IDENTIFIERS}
                  cardsData={sortedFavIdentifiers}
                />
              </>
            ) : null}
            {allIdentifiers.length ? (
              <>
                {favIdentifiers.length ? (
                  <div className="cards-title cards-title-all">
                    {i18n.t("identifiers.tab.allidentifiers")}
                  </div>
                ) : null}
                <CardsStack
                  name="allidentifiers"
                  cardsType={CardType.IDENTIFIERS}
                  cardsData={allIdentifiers}
                />
              </>
            ) : null}
          </>
        ) : (
          <CardsPlaceholder
            buttonLabel={i18n.t("identifiers.tab.create")}
            buttonAction={() => setModalIsOpen(true)}
            testId="identifiers-cards-placeholder"
          />
        )}

        <CreateIdentifier
          modalIsOpen={modalIsOpen}
          setModalIsOpen={(isOpen: boolean) => setModalIsOpen(isOpen)}
        />
      </TabLayout>
    </IonPage>
  );
};

export { Identifiers, AdditionalButtons };
