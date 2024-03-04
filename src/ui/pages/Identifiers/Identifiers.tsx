import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  useIonViewWillEnter,
} from "@ionic/react";
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
import { CardType, IDENTIFIER_BG_MAPPING } from "../../globals/types";
import { Connections } from "../Connections";
import { formatShortDate } from "../../utils/formatters";
import { IdentifierShortDetails } from "../../../core/agent/services/identifierService.types";
import "./Identifiers.scss";

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
  const [favIdentifiers, setFavIdentifiers] = useState<
    IdentifierShortDetails[]
  >([]);
  const [allIdentifiers, setAllIdentifiers] = useState<
    IdentifierShortDetails[]
  >([]);
  const [pendingIdentifiers, setPendingIdentifiers] = useState<
    IdentifierShortDetails[]
  >([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [showConnections, setShowConnections] = useState(false);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.IDENTIFIERS }));
  });

  useEffect(() => {
    setShowPlaceholder(identifiersData.length === 0);
    setFavIdentifiers(
      identifiersData.filter((identifier) =>
        favouritesIdentifiers?.some((fav) => fav.id === identifier.id)
      )
    );
    setAllIdentifiers(
      identifiersData.filter(
        (identifier) =>
          !favouritesIdentifiers?.some((fav) => fav.id === identifier.id)
      )
    );
    // @TODO - sdisalvo: Temporary fix until we have a way to get the identifiers from the cache
    // setPendingIdentifiers(identifiersData.filter((identifier) => identifier.isPending));
    setPendingIdentifiers(
      identifiersData.filter(
        (identifier) => identifier.displayName === "Test M"
      )
    );
  }, [favouritesIdentifiers, identifiersData]);

  const findTimeById = (id: string) => {
    const found = favouritesIdentifiers?.find((item) => item.id === id);
    return found ? found.time : null;
  };

  const sortedFavIdentifiers = favIdentifiers.sort((a, b) => {
    const timeA = findTimeById(a.id);
    const timeB = findTimeById(b.id);

    if (timeA === null && timeB === null) return 0;
    if (timeA === null) return 1;
    if (timeB === null) return -1;

    return timeA - timeB;
  });

  const PendingIdentifier = ({
    identifier,
  }: {
    identifier: IdentifierShortDetails;
  }) => {
    return (
      <IonItem className="pending-identifier">
        <IonLabel>
          <div
            className="pending-identifier-miniature"
            style={{
              backgroundImage: `url(${
                IDENTIFIER_BG_MAPPING[identifier.theme]
              })`,
              backgroundSize: "cover",
            }}
          />
          <div className="pending-identifier-info">
            <div className="pending-identifier-info-top-line">
              {identifier.displayName
                .replace(/([A-Z][a-z])/g, " $1")
                .replace(/(\d)/g, " $1")}
            </div>
            <div className="pending-identifier-info-bottom-line">
              {`${i18n.t(
                "identifiers.tab.identifiertype"
              )}  •  ${formatShortDate(identifier.createdAtUTC)}`}
            </div>
          </div>
        </IonLabel>
      </IonItem>
    );
  };

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
              testId={pageId}
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
            {!!pendingIdentifiers.length && (
              <>
                <div className="cards-title cards-title-all">
                  {i18n.t("identifiers.tab.pendingidentifiers")}
                </div>
                <IonList
                  lines="none"
                  className="pending-identifiers-list"
                >
                  {pendingIdentifiers.map(
                    (identifier: IdentifierShortDetails, index: number) => {
                      return (
                        <PendingIdentifier
                          key={index}
                          identifier={identifier}
                        />
                      );
                    }
                  )}
                </IonList>
              </>
            )}
          </>
        )}
      </TabLayout>
      <CreateIdentifier
        modalIsOpen={modalIsOpen}
        setModalIsOpen={(isOpen: boolean) => setModalIsOpen(isOpen)}
      />
    </>
  );
};

export { Identifiers, AdditionalButtons };
