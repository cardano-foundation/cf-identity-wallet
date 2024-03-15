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
import { IdentifierShortDetails } from "../../../core/agent/services/identifierService.types";
import "./Identifiers.scss";
import { IdentifiersList } from "./components/IdentifiersList";
import { AriesAgent } from "../../../core/agent/agent";

const CLEAR_STATE_DELAY = 1000;

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
  const [createIdentifierModalIsOpen, setCreateIdentifierModalIsOpen] =
    useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [showConnections, setShowConnections] = useState(false);
  const [showNavAnimation, setShowNavAnimation] = useState(false);

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
      identifiersData
        .filter((identifier) => !identifier.isPending)
        .filter(
          (identifier) =>
            !favouritesIdentifiers?.some((fav) => fav.id === identifier.id)
        )
    );
    setPendingIdentifiers(
      identifiersData.filter((identifier) => identifier.isPending)
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

  const handlePendingClick = async (identifier: IdentifierShortDetails) => {
    // @TODO - sdisalvo: This is a temporary fix Patrick initially added to the CardStack
    // and I moved it here since PendingIdentifiers are never going to show up in the stack.
    /**The below code only return false if the identifier is a multisig and it is not ready */
    const checkMultisigComplete =
      await AriesAgent.agent.identifiers.checkMultisigComplete(identifier.id);
    if (!checkMultisigComplete) {
      return;
    }
  };

  const handleShowNavAnimation = () => {
    setShowNavAnimation(true);

    setTimeout(() => setShowNavAnimation(false), CLEAR_STATE_DELAY);
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
        customClass={showNavAnimation ? "identifier-nav-animation" : undefined}
        title={`${i18n.t("identifiers.tab.title")}`}
        additionalButtons={
          <AdditionalButtons
            handleConnections={() => setShowConnections(true)}
            handleCreateIdentifier={() => setCreateIdentifierModalIsOpen(true)}
          />
        }
        placeholder={
          showPlaceholder && (
            <CardsPlaceholder
              buttonLabel={i18n.t("identifiers.tab.create")}
              buttonAction={() => setCreateIdentifierModalIsOpen(true)}
              testId={pageId}
            />
          )
        }
      >
        {!showPlaceholder && (
          <>
            {!!favIdentifiers.length && (
              <div className="identifiers-tab-content-block">
                {allIdentifiers.length ? (
                  <h3>{i18n.t("creds.tab.favourites")}</h3>
                ) : null}
                <CardsStack
                  name="favs"
                  cardsType={CardType.IDENTIFIERS}
                  cardsData={sortedFavIdentifiers}
                  onShowCardDetails={handleShowNavAnimation}
                />
              </div>
            )}
            {!!allIdentifiers.length && (
              <div className="identifiers-tab-content-block">
                {!!favIdentifiers.length && (
                  <h3>{i18n.t("identifiers.tab.allidentifiers")}</h3>
                )}
                <CardsStack
                  name="allidentifiers"
                  cardsType={CardType.IDENTIFIERS}
                  cardsData={allIdentifiers}
                  onShowCardDetails={handleShowNavAnimation}
                />
              </div>
            )}
            {!!pendingIdentifiers.length && (
              <div className="identifiers-tab-content-block">
                <h3>{i18n.t("identifiers.tab.pendingidentifiers")}</h3>
                <IdentifiersList
                  identifiers={pendingIdentifiers}
                  showDate={true}
                  handleClick={async (identifier) =>
                    handlePendingClick(identifier)
                  }
                />
              </div>
            )}
          </>
        )}
      </TabLayout>
      <CreateIdentifier
        modalIsOpen={createIdentifierModalIsOpen}
        setModalIsOpen={(isOpen: boolean) =>
          setCreateIdentifierModalIsOpen(isOpen)
        }
      />
    </>
  );
};

export { Identifiers, AdditionalButtons };
