import { IonButton, IonIcon, useIonViewWillEnter } from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
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
import { Connections } from "../Connections";

interface AdditionalButtonsProps {
  handleCreateIdentifier: () => void;
  handleConnections: () => void;
}

const AdditionalButtons = ({
  handleConnections,
  handleCreateIdentifier,
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
  const pageId = "identifiers-tab";
  const dispatch = useAppDispatch();
  const identifiersData = useAppSelector(getIdentifiersCache);
  const favouritesIdentifiers = useAppSelector(getFavouritesIdentifiersCache);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [showConnections, setShowConnections] = useState(false);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.IDENTIFIERS }));
  });

  useEffect(() => {
    setShowPlaceholder(identifiersData.length === 0);
  }, [identifiersData]);

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
    <>
      <Connections
        showConnections={showConnections}
        setShowConnections={setShowConnections}
      />
      <TabLayout
        pageId={pageId}
        header={true}
        title={`${i18n.t("identifiers.tab.title")}`}
        menuButton={true}
        additionalButtons={
          <AdditionalButtons
            handleConnections={() => setShowConnections(true)}
            handleCreateIdentifier={() => setModalIsOpen(true)}
          />
        }
        placeholder={
          showPlaceholder && (
            <CardsPlaceholder
              buttonLabel={i18n.t("identifiers.tab.create")}
              buttonAction={() => setModalIsOpen(true)}
              testId="identifiers-cards-placeholder"
            />
          )
        }
      >
        {!showPlaceholder && (
          <>
            {!!favIdentifiers.length && (
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
            )}
            {!!allIdentifiers.length && (
              <>
                {!!favIdentifiers.length && (
                  <div className="cards-title cards-title-all">
                    {i18n.t("identifiers.tab.allidentifiers")}
                  </div>
                )}
                <CardsStack
                  name="allidentifiers"
                  cardsType={CardType.IDENTIFIERS}
                  cardsData={allIdentifiers}
                />
              </>
            )}
          </>
        )}

        <CreateIdentifier
          modalIsOpen={modalIsOpen}
          setModalIsOpen={(isOpen: boolean) => setModalIsOpen(isOpen)}
        />
      </TabLayout>
    </>
  );
};

export { Identifiers, AdditionalButtons };
