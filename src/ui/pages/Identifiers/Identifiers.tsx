import { IonButton, IonIcon, useIonViewWillEnter } from "@ionic/react";
import { addOutline, peopleOutline } from "ionicons/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { i18n } from "../../../i18n";
import { TabsRoutePath } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getFavouritesIdentifiersCache,
  getIdentifiersCache,
  getIdentifiersFilters,
  getMultiSigGroupCache,
  getOpenMultiSig,
  setIdentifiersCache,
  setIdentifiersFilters,
  setOpenMultiSigId,
} from "../../../store/reducers/identifiersCache";
import {
  getCurrentOperation,
  setCurrentOperation,
  setCurrentRoute,
  setToastMsg,
  showConnections,
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
import { CardType, OperationType, ToastMsgType } from "../../globals/types";
import "./Identifiers.scss";
import { IdentifiersFilters, StartAnimationSource } from "./Identifiers.types";
import { RemovePendingAlert } from "../../components/RemovePendingAlert";
import { Agent } from "../../../core/agent/agent";
import { showError } from "../../utils/error";
import { FilterChip } from "../../components/FilterChip/FilterChip";
import { NotificationFilters } from "../Notifications/Notification.types";
import { AllowedChipFilter } from "../../components/FilterChip/FilterChip.types";
import { BasicRecord } from "../../../core/agent/records/basicRecord";
import { MiscRecordId } from "../../../core/agent/agent.types";

const CLEAR_STATE_DELAY = 500;
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
  const multisigGroupCache = useAppSelector(getMultiSigGroupCache);
  const favouriteIdentifiers = useAppSelector(getFavouritesIdentifiersCache);
  const currentOperation = useAppSelector(getCurrentOperation);
  const openMultiSigId = useAppSelector(getOpenMultiSig);
  const identifiersFiltersCache = useAppSelector(getIdentifiersFilters);

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
  const [individualIdentifiers, setIndividualIdentifiers] = useState<
    IdentifierShortDetails[]
  >([]);
  const [groupIdentifiers, setGroupIdentifiers] = useState<
    IdentifierShortDetails[]
  >([]);
  const [createIdentifierModalIsOpen, setCreateIdentifierModalIsOpen] =
    useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [resumeMultiSig, setResumeMultiSig] =
    useState<IdentifierShortDetails | null>(null);
  const [navAnimation, setNavAnimation] =
    useState<StartAnimationSource>("none");
  const [deletedPendingItem, setDeletePendingItem] =
    useState<IdentifierShortDetails | null>(null);
  const [openDeletePendingAlert, setOpenDeletePendingAlert] = useState(false);
  const favouriteContainerElement = useRef<HTMLDivElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<IdentifiersFilters>();

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.IDENTIFIERS }));
  });

  const handleMultiSigClick = async (identifier: IdentifierShortDetails) => {
    setResumeMultiSig(identifier);
    setCreateIdentifierModalIsOpen(true);
  };

  useEffect(() => {
    const multisigId =
      OperationType.OPEN_MULTISIG_IDENTIFIER === currentOperation &&
      multisigGroupCache
        ? multisigGroupCache?.groupId
        : openMultiSigId;

    if (!multisigId) {
      return;
    }

    const identifier = identifiersData.find(
      (item) => item.groupMetadata?.groupId === multisigId
    );

    if (identifier) {
      handleMultiSigClick(identifier);
      dispatch(setOpenMultiSigId(undefined));
      dispatch(setCurrentOperation(OperationType.IDLE));
    }
  }, [
    currentOperation,
    dispatch,
    identifiersData,
    multisigGroupCache,
    openMultiSigId,
  ]);

  useEffect(() => {
    setShowPlaceholder(identifiersData.length === 0);
    const tmpPendingIdentifiers = [];
    const tmpMultisigIdentifiers = [];
    const tmpFavIdentifiers = [];
    const tmpAllIdentifiers = [];
    const tmpIndividualIdentifiers = [];
    const tmpGroupIdentifiers = [];
    for (const identifier of identifiersData) {
      if (favouriteIdentifiers?.some((fav) => fav.id === identifier.id)) {
        tmpFavIdentifiers.push(identifier);
        tmpAllIdentifiers.push(identifier);
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
      if (identifier.multisigManageAid?.length) {
        tmpGroupIdentifiers.push(identifier);
      } else {
        tmpIndividualIdentifiers.push(identifier);
      }
      tmpAllIdentifiers.push(identifier);
    }
    setAllIdentifiers(tmpAllIdentifiers);
    setFavIdentifiers(tmpFavIdentifiers);
    setPendingIdentifiers(tmpPendingIdentifiers);
    setMultiSigIdentifiers(tmpMultisigIdentifiers);
    setIndividualIdentifiers(tmpIndividualIdentifiers);
    setGroupIdentifiers(tmpGroupIdentifiers);
  }, [favouriteIdentifiers, identifiersData]);

  const findTimeById = (id: string) => {
    const found = favouriteIdentifiers?.find((item) => item.id === id);
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
  const handleCloseCreateIdentifier = () => {
    setCreateIdentifierModalIsOpen(false);
  };

  const deletePendingIdentifier = async () => {
    if (!deletedPendingItem) return;
    setDeletePendingItem(null);

    try {
      const updatedIdentifiers = identifiersData.filter(
        (item) => item.id !== deletedPendingItem.id
      );

      await Agent.agent.identifiers.deleteIdentifier(deletedPendingItem.id);

      dispatch(setToastMsg(ToastMsgType.IDENTIFIER_DELETED));
      dispatch(setIdentifiersCache(updatedIdentifiers));
    } catch (e) {
      showError(
        "Unable to delete identifier",
        e,
        dispatch,
        ToastMsgType.DELETE_IDENTIFIER_FAIL
      );
    }
  };

  const deletePendingCheck = useMemo(
    () => ({
      title: i18n.t("tabs.identifiers.detelepending.title"),
      description: i18n.t(
        deletedPendingItem?.groupMetadata?.groupId
          ? "tabs.identifiers.detelepending.mutilsigdescription"
          : "tabs.identifiers.detelepending.description"
      ),
      button: i18n.t("tabs.identifiers.detelepending.button"),
    }),
    [deletedPendingItem]
  );

  const handleConnections = () => {
    dispatch(showConnections(true));
  };

  const handleCreateIdentifier = () => {
    setCreateIdentifierModalIsOpen(true);
  };

  const filterOptions = [
    {
      filter: IdentifiersFilters.All,
      label: i18n.t("tabs.identifiers.tab.filters.all"),
    },
    {
      filter: IdentifiersFilters.Individual,
      label: i18n.t("tabs.identifiers.tab.filters.individual"),
    },
    {
      filter: IdentifiersFilters.Group,
      label: i18n.t("tabs.identifiers.tab.filters.group"),
    },
  ];

  const setFilters = (filter: IdentifiersFilters) => {
    Agent.agent.basicStorage
      .createOrUpdateBasicRecord(
        new BasicRecord({
          id: MiscRecordId.APP_IDENTIFIER_SELECTED_FILTER,
          content: {
            filter: filter,
          },
        })
      )
      .then(() => {
        dispatch(setIdentifiersFilters(filter));
      });
  };

  const handleSelectFilter = (filter: AllowedChipFilter) => {
    setSelectedFilter(filter as IdentifiersFilters);
    setFilters(filter as IdentifiersFilters);
  };

  useEffect(() => {
    if (!identifiersFiltersCache) {
      setSelectedFilter(IdentifiersFilters.All);
    } else {
      setSelectedFilter(identifiersFiltersCache as IdentifiersFilters);
    }
  }, [identifiersFiltersCache]);

  return (
    <>
      <TabLayout
        pageId={pageId}
        header={true}
        customClass={tabClasses}
        title={`${i18n.t("tabs.identifiers.tab.title")}`}
        additionalButtons={
          <AdditionalButtons
            handleConnections={handleConnections}
            handleCreateIdentifier={handleCreateIdentifier}
          />
        }
        placeholder={
          showPlaceholder && (
            <CardsPlaceholder
              buttonLabel={`${i18n.t("tabs.identifiers.tab.create")}`}
              buttonAction={handleCreateIdentifier}
              testId={pageId}
            >
              <span className="placeholder-spacer" />
            </CardsPlaceholder>
          )
        }
      >
        {!showPlaceholder && (
          <>
            {!!favIdentifiers.length && (
              <div
                ref={favouriteContainerElement}
                className="identifiers-tab-content-block identifier-favourite-cards"
                data-testid="favourite-identifiers"
              >
                <CardSlider
                  title={`${i18n.t("tabs.identifiers.tab.favourite")}`}
                  name="favs"
                  cardType={CardType.IDENTIFIERS}
                  cardsData={sortedFavIdentifiers}
                  onShowCardDetails={() => handleShowNavAnimation("favourite")}
                />
              </div>
            )}
            {!!allIdentifiers.length && (
              <SwitchCardView
                className="identifiers-tab-content-block identifier-cards"
                cardTypes={CardType.IDENTIFIERS}
                cardsData={
                  selectedFilter === IdentifiersFilters.All
                    ? allIdentifiers
                    : selectedFilter === IdentifiersFilters.Individual
                      ? individualIdentifiers
                      : groupIdentifiers
                }
                onShowCardDetails={() => handleShowNavAnimation("cards")}
                title={`${i18n.t("tabs.identifiers.tab.allidentifiers")}`}
                name="allidentifiers"
                filters={
                  <div className="identifiers-tab-chips">
                    {filterOptions.map((option) => (
                      <FilterChip
                        key={option.filter}
                        filter={option.filter}
                        label={option.label}
                        isActive={option.filter === selectedFilter}
                        onClick={handleSelectFilter}
                      />
                    ))}
                  </div>
                }
              />
            )}
            {!!multiSigIdentifiers.length && (
              <div className="identifiers-tab-content-block multisig-container">
                <h3>{i18n.t("tabs.identifiers.tab.multisigidentifiers")}</h3>
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
              <div className="identifiers-tab-content-block pending-container">
                <ListHeader
                  title={`${i18n.t("tabs.identifiers.tab.pendingidentifiers")}`}
                />
                <IdentifierCardList
                  cardsData={pendingIdentifiers}
                  cardTypes={CardType.IDENTIFIERS}
                  testId="pending-identifiers-list"
                  onCardClick={(identifier) => {
                    setDeletePendingItem(identifier as IdentifierShortDetails);
                    setOpenDeletePendingAlert(true);
                  }}
                />
              </div>
            )}
          </>
        )}
      </TabLayout>
      <RemovePendingAlert
        pageId={pageId}
        openFirstCheck={openDeletePendingAlert}
        firstCheckProps={deletePendingCheck}
        onClose={() => setOpenDeletePendingAlert(false)}
        secondCheckTitle={`${i18n.t(
          "tabs.identifiers.detelepending.secondchecktitle"
        )}`}
        onDeletePendingItem={deletePendingIdentifier}
      />
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
