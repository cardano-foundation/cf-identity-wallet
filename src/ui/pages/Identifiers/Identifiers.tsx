import { IonButton, IonIcon, useIonViewWillEnter } from "@ionic/react";
import { addOutline, peopleOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { i18n } from "../../../i18n";
import { TabsRoutePath } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getFavouritesIdentifiersCache,
  getIdentifiersCache,
} from "../../../store/reducers/identifiersCache";
import {
  getCurrentOperation,
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { CardSlider } from "../../components/CardSlider";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CreateIdentifier } from "../../components/CreateIdentifier";
import { ListHeader } from "../../components/ListHeader";
import {
  CardList as IdentifierCardList,
  SwitchCardView,
} from "../../components/SwitchCardView";
import { TabLayout } from "../../components/layout/TabLayout";
import { CardType, OperationType } from "../../globals/types";
import { useToggleConnections } from "../../hooks";
import { Connections } from "../Connections";
import "./Identifiers.scss";
import { StartAnimationSource } from "./Identifiers.type";

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
    (currentOperation === OperationType.CREATE_IDENTIFIER_CONNECT_WALLET ||
      currentOperation ===
        OperationType.CREATE_IDENTIFIER_SHARE_CONNECTION_FROM_IDENTIFIERS ||
      currentOperation ===
        OperationType.CREATE_IDENTIFIER_SHARE_CONNECTION_FROM_CREDENTIALS) &&
      history.location.pathname === TabsRoutePath.IDENTIFIERS &&
      setCreateIdentifierModalIsOpen(true);
  }, [currentOperation, history.location.pathname]);
  useEffect(() => {
    setShowPlaceholder(identifiersData.length === 0);
    const tmpPendingIdentifiers = [];
    const tmpMultisigIdentifiers = [];
    const tmpFavIdentifiers = [];
    const tmpAllIdentifiers = [];
    for (const identifier of identifiersData) {
      if (favouritesIdentifiers?.some((fav) => fav.id === identifier.id)) {
        tmpFavIdentifiers.push(identifier);
        continue;
      }
      if (identifier.isPending) {
        tmpPendingIdentifiers.push(identifier);
        continue;
      }
      if (identifier.groupMetadata?.groupId) {
        tmpMultisigIdentifiers.push(identifier);
        continue;
      }
      tmpAllIdentifiers.push(identifier);
    }
    setAllIdentifiers(tmpAllIdentifiers);
    setFavIdentifiers(tmpFavIdentifiers);
    setPendingIdentifiers(tmpPendingIdentifiers);
    setMultiSigIdentifiers(tmpMultisigIdentifiers);
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
    switch (currentOperation) {
    case OperationType.CREATE_IDENTIFIER_CONNECT_WALLET:
      dispatch(setCurrentOperation(OperationType.BACK_TO_CONNECT_WALLET));
      history.push(TabsRoutePath.MENU);
      break;
    case OperationType.CREATE_IDENTIFIER_SHARE_CONNECTION_FROM_IDENTIFIERS:
      dispatch(setCurrentOperation(OperationType.BACK_TO_SHARE_CONNECTION));
      break;
    case OperationType.CREATE_IDENTIFIER_SHARE_CONNECTION_FROM_CREDENTIALS:
      dispatch(setCurrentOperation(OperationType.BACK_TO_SHARE_CONNECTION));
      history.push(TabsRoutePath.CREDENTIALS);
      break;
    default:
      dispatch(setCurrentOperation(OperationType.IDLE));
      break;
    }
    setCreateIdentifierModalIsOpen(false);
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
                <CardSlider
                  title={`${i18n.t("identifiers.tab.favourites")}`}
                  name="favs"
                  cardType={CardType.IDENTIFIERS}
                  cardsData={sortedFavIdentifiers}
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
