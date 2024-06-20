import { IonButton, IonIcon, useIonViewWillEnter } from "@ionic/react";
import { addOutline, peopleOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { Agent } from "../../../core/agent/agent";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { i18n } from "../../../i18n";
import { TabsRoutePath } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getFavouritesIdentifiersCache,
  getIdentifiersCache,
  setIdentifiersCache,
} from "../../../store/reducers/identifiersCache";
import {
  getCurrentOperation,
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { CreateIdentifier } from "../../components/CreateIdentifier";
import { TabLayout } from "../../components/layout/TabLayout";
import { CardType, OperationType } from "../../globals/types";
import { Connections } from "../Connections";
import "./Identifiers.scss";
import { StartAnimationSource } from "./Identifiers.type";
import { useToggleConnections } from "../../hooks";
import { ListHeader } from "../../components/ListHeader";
import {
  CardList as IdentifierCardList,
  SwitchCardView,
} from "../../components/SwitchCardView";

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
  const history = useHistory();
  const dispatch = useAppDispatch();
  const identifiersData = useAppSelector(getIdentifiersCache);
  const favouritesIdentifiers = useAppSelector(getFavouritesIdentifiersCache);
  const currentOperation = useAppSelector(getCurrentOperation);
  const [favIdentifiers, setFavIdentifiers] = useState<
    IdentifierShortDetails[]
  >([]);
  const [allIdentifiers, setAllIdentifiers] = useState<
    IdentifierShortDetails[]
  >([]);
  const [pendingIdentifiers, setPendingIdentifiers] = useState<
    IdentifierShortDetails[]
  >([]);
  const [multiSigIdentifiers, setMultiSigIdentifiers] = useState<
    IdentifierShortDetails[]
  >([]);
  const [createIdentifierModalIsOpen, setCreateIdentifierModalIsOpen] =
    useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [toggleClick, setToggleClick] = useState(false);
  const [resumeMultiSig, setResumeMultiSig] =
    useState<IdentifierShortDetails | null>(null);
  const [navAnimation, setNavAnimation] =
    useState<StartAnimationSource>("none");
  const favouriteContainerElement = useRef<HTMLDivElement>(null);

  const { showConnections, setShowConnections } = useToggleConnections(
    TabsRoutePath.IDENTIFIERS
  );

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.IDENTIFIERS }));
  });
  useEffect(() => {
    if (
      currentOperation === OperationType.CREATE_IDENTIFIER_CONNECT_WALLET &&
      history.location.pathname === TabsRoutePath.IDENTIFIERS
    ) {
      setCreateIdentifierModalIsOpen(true);
    }
  }, [currentOperation, history.location.pathname]);
  useEffect(() => {
    setShowPlaceholder(identifiersData.length === 0);
    setAllIdentifiers(
      identifiersData
        .filter((identifier) => !identifier.isPending)
        .filter((identifier) => !identifier.groupMetadata?.groupId)
        .filter(
          (identifier) =>
            !favouritesIdentifiers?.some((fav) => fav.id === identifier.id)
        )
    );
    setFavIdentifiers(
      identifiersData.filter((identifier) =>
        favouritesIdentifiers?.some((fav) => fav.id === identifier.id)
      )
    );
    setPendingIdentifiers(
      identifiersData.filter((identifier) => identifier.isPending)
    );
    setMultiSigIdentifiers(
      identifiersData.filter((identifier) => identifier.groupMetadata?.groupId)
    );
  }, [favouritesIdentifiers, identifiersData, toggleClick]);
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
  const handlePendingClick = async () => {
    setToggleClick(!toggleClick);
  };
  const handleMultiSigClick = async (identifier: IdentifierShortDetails) => {
    setResumeMultiSig(identifier);
    setCreateIdentifierModalIsOpen(true);
  };
  const handleShowNavAnimation = (source: StartAnimationSource) => {
    if (favouriteContainerElement.current && source !== "favourite") {
      favouriteContainerElement.current.style.height =
        favouriteContainerElement.current.scrollHeight + "px";
    }
    setNavAnimation(source);
    setTimeout(() => {
      setNavAnimation("none");
      if (favouriteContainerElement.current) {
        favouriteContainerElement.current.removeAttribute("style");
      }
    }, CLEAR_STATE_DELAY);
  };
  const tabClasses = `${
    navAnimation === "cards"
      ? "cards-identifier-nav"
      : navAnimation === "favourite"
        ? "favorite-identifier-nav"
        : ""
  }`;
  const handleCloseCreateIdentifier = (isOpen: boolean) => {
    if (
      !isOpen &&
      currentOperation === OperationType.CREATE_IDENTIFIER_CONNECT_WALLET
    ) {
      dispatch(setCurrentOperation(OperationType.IDLE));
    }
    setCreateIdentifierModalIsOpen(isOpen);
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
        customClass={tabClasses}
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
              <div
                ref={favouriteContainerElement}
                className="identifiers-tab-content-block identifier-favourite-cards"
              >
                {!!allIdentifiers.length && (
                  <ListHeader
                    title={`${i18n.t("identifiers.tab.favourites")}`}
                  />
                )}
                <CardsStack
                  name="favs"
                  cardsType={CardType.IDENTIFIERS}
                  cardsData={sortedFavIdentifiers}
                  onShowCardDetails={() => handleShowNavAnimation("favourite")}
                />
              </div>
            )}
            {!!allIdentifiers.length && (
              <SwitchCardView
                className="identifiers-tab-content-block identifier-cards"
                cardTypes={CardType.IDENTIFIERS}
                cardsData={allIdentifiers}
                onShowCardDetails={() => handleShowNavAnimation("cards")}
                title={`${i18n.t("identifiers.tab.allidentifiers")}`}
                name="allidentifiers"
              />
            )}
            {!!multiSigIdentifiers.length && (
              <div className="identifiers-tab-content-block">
                <h3>{i18n.t("identifiers.tab.multisigidentifiers")}</h3>
                <IdentifierCardList
                  cardTypes={CardType.IDENTIFIERS}
                  cardsData={multiSigIdentifiers}
                  onCardClick={async (identifier) =>
                    handleMultiSigClick(identifier as IdentifierShortDetails)
                  }
                  testId="identifiers-list"
                />
              </div>
            )}
            {!!pendingIdentifiers.length && (
              <div className="identifiers-tab-content-block">
                <ListHeader
                  title={`${i18n.t("identifiers.tab.pendingidentifiers")}`}
                />
                <IdentifierCardList
                  cardsData={pendingIdentifiers}
                  cardTypes={CardType.IDENTIFIERS}
                  onCardClick={() => handlePendingClick()}
                  testId="identifiers-list"
                />
              </div>
            )}
          </>
        )}
      </TabLayout>
      <CreateIdentifier
        modalIsOpen={createIdentifierModalIsOpen}
        setModalIsOpen={handleCloseCreateIdentifier}
        resumeMultiSig={resumeMultiSig}
        setResumeMultiSig={setResumeMultiSig}
      />
    </>
  );
};
export { AdditionalButtons, Identifiers };
