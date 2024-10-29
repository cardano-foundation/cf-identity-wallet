import {
  IonButton,
  IonIcon,
  IonLabel,
  useIonViewWillEnter,
} from "@ionic/react";
import { peopleOutline } from "ionicons/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "../../../core/agent/services/credentialService.types";
import { i18n } from "../../../i18n";
import { TabsRoutePath } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCredsArchivedCache,
  setCredsArchivedCache,
} from "../../../store/reducers/credsArchivedCache";
import {
  getCredsCache,
  getFavouritesCredsCache,
  setCredsCache,
} from "../../../store/reducers/credsCache";
import {
  setCurrentRoute,
  setToastMsg,
  showConnections,
} from "../../../store/reducers/stateCache";
import { ArchivedCredentials } from "../../components/ArchivedCredentials";
import { CardSlider } from "../../components/CardSlider";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { TabLayout } from "../../components/layout/TabLayout";
import { ListHeader } from "../../components/ListHeader";
import { RemovePendingAlert } from "../../components/RemovePendingAlert";
import { CardList as CredentialCardList, SwitchCardView } from "../../components/SwitchCardView";
import { CardType, ToastMsgType } from "../../globals/types";
import { useOnlineStatusEffect } from "../../hooks";
import { showError } from "../../utils/error";
import { combineClassNames } from "../../utils/style";
import { StartAnimationSource } from "../Identifiers/Identifiers.type";
import "./Credentials.scss";

const CLEAR_STATE_DELAY = 1000;

const AdditionalButtons = ({
  handleConnections,
}: {
  handleConnections: () => void;
}) => {
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
    </>
  );
};

const Credentials = () => {
  const pageId = "credentials-tab";
  const dispatch = useAppDispatch();
  const credsCache = useAppSelector(getCredsCache);
  const archivedCreds = useAppSelector(getCredsArchivedCache);
  const favCredsCache = useAppSelector(getFavouritesCredsCache);
  const [archivedCredentialsIsOpen, setArchivedCredentialsIsOpen] =
    useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [navAnimation, setNavAnimation] =
    useState<StartAnimationSource>("none");
  const favouriteContainerElement = useRef<HTMLDivElement>(null);
  const [deletedPendingItem, setDeletePendingItem] =
    useState<CredentialShortDetails | null>(null);
  const [openDeletePendingAlert, setOpenDeletePendingAlert] = useState(false);

  const revokedCreds = useMemo(
    () => credsCache.filter((item) => item.status === CredentialStatus.REVOKED),
    [credsCache]
  );

  const pendingCreds = useMemo(
    () => credsCache.filter((item) => item.status === CredentialStatus.PENDING),
    [credsCache]
  );
  const confirmedCreds = useMemo(
    () =>
      credsCache.filter((item) => item.status === CredentialStatus.CONFIRMED),
    [credsCache]
  );

  const fetchArchivedCreds = useCallback(async () => {
    try {
      const creds = await Agent.agent.credentials.getCredentials(true);
      dispatch(setCredsArchivedCache(creds));
    } catch (e) {
      showError("Unable to get archived credential", e, dispatch);
    }
  }, [dispatch]);

  useEffect(() => {
    setShowPlaceholder(confirmedCreds.length + pendingCreds.length === 0);
  }, [confirmedCreds.length, credsCache, pendingCreds.length]);

  useOnlineStatusEffect(fetchArchivedCreds);

  const handleConnections = () => {
    dispatch(showConnections(true));
  };

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.CREDENTIALS }));
  });

  const findTimeById = (id: string) => {
    const found = favCredsCache.find((item) => item.id === id);
    return found ? found.time : null;
  };

  const favCreds = credsCache.filter((cred) =>
    favCredsCache?.some((fav) => fav.id === cred.id)
  );

  const sortedFavCreds = favCreds.sort((a, b) => {
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

  const tabClasses = combineClassNames("credential-tab", {
    "cards-credential-nav": navAnimation === "cards",
    "favorite-credential-nav": navAnimation === "favourite"
  });

  const handleArchivedCredentialsDisplayChange = (value: boolean) => {
    if (value === archivedCredentialsIsOpen) return;
    setArchivedCredentialsIsOpen(value);
    fetchArchivedCreds();
  };

  const ArchivedCredentialsButton = () => {
    return (
      <div
        className={`archived-credentials-button-container${
          archivedCreds.length > 0 || revokedCreds.length > 0
            ? " visible"
            : " hidden"
        }`}
      >
        <IonButton
          fill="outline"
          className="secondary-button"
          data-testid="cred-archived-revoked-button"
          onClick={() => setArchivedCredentialsIsOpen(true)}
        >
          <IonLabel color="secondary">
            {i18n.t("tabs.credentials.tab.viewarchived")}
          </IonLabel>
        </IonButton>
      </div>
    );
  };

  const deletePendingCheck = useMemo(
    () => ({
      title: i18n.t("tabs.credentials.tab.detelepending.title"),
      description: i18n.t("tabs.credentials.tab.detelepending.description"),
      button: i18n.t("tabs.credentials.tab.detelepending.button"),
    }),
    []
  );

  const deletePendingCred = async () => {
    if (!deletedPendingItem) return;
    setDeletePendingItem(null);

    try {
      await Agent.agent.credentials.archiveCredential(deletedPendingItem.id);
      await Agent.agent.credentials.deleteCredential(deletedPendingItem.id);

      dispatch(setToastMsg(ToastMsgType.CREDENTIAL_DELETED));

      const creds = await Agent.agent.credentials.getCredentials();
      dispatch(setCredsCache(creds));
    } catch (e) {
      showError(
        "Unable to delete credential",
        e,
        dispatch,
        ToastMsgType.DELETE_CRED_FAIL
      );
    }
  };

  return (
    <>
      <TabLayout
        pageId={pageId}
        header={true}
        customClass={tabClasses}
        title={`${i18n.t("tabs.credentials.tab.title")}`}
        additionalButtons={
          <AdditionalButtons handleConnections={handleConnections} />
        }
        placeholder={
          showPlaceholder && (
            <CardsPlaceholder testId={pageId}>
              <p>
                <i>{i18n.t("tabs.credentials.tab.placeholder")}</i>
              </p>
              <ArchivedCredentialsButton />
            </CardsPlaceholder>
          )
        }
      >
        {!showPlaceholder && (
          <>
            {favCreds.length > 0 && (
              <div
                ref={favouriteContainerElement}
                className="credentials-tab-content-block credential-favourite-cards"
                data-testid="favourite-container-element"
              >
                <CardSlider
                  title={`${i18n.t("tabs.credentials.tab.favourites")}`}
                  name="favs"
                  cardType={CardType.CREDENTIALS}
                  cardsData={sortedFavCreds}
                  onShowCardDetails={() => handleShowNavAnimation("favourite")}
                />
              </div>
            )}
            {!!confirmedCreds.length && (
              <SwitchCardView
                className="credentials-tab-content-block credential-cards"
                cardTypes={CardType.CREDENTIALS}
                cardsData={confirmedCreds}
                onShowCardDetails={() => handleShowNavAnimation("cards")}
                title={`${i18n.t("tabs.credentials.tab.allcreds")}`}
                name="allcreds"
              />
            )}
            {!!pendingCreds.length && (
              <div className="credetial-tab-content-block pending-container">
                <ListHeader
                  title={`${i18n.t("tabs.credentials.tab.pendingcred")}`}
                />
                <CredentialCardList
                  cardsData={pendingCreds}
                  cardTypes={CardType.CREDENTIALS}
                  testId="pending-creds-list"
                  onCardClick={(cred) => {
                    setDeletePendingItem(cred as CredentialShortDetails);
                    setOpenDeletePendingAlert(true);
                  }}
                />
              </div>
            )}
            <ArchivedCredentialsButton />
          </>
        )}
      </TabLayout>
      <RemovePendingAlert
        pageId={pageId}
        openFirstCheck={openDeletePendingAlert}
        firstCheckProps={deletePendingCheck}
        onClose={() => setOpenDeletePendingAlert(false)}
        secondCheckTitle={`${i18n.t(
          "tabs.credentials.tab.detelepending.secondchecktitle"
        )}`}
        onDeletePendingItem={deletePendingCred}
      />
      <ArchivedCredentials
        revokedCreds={revokedCreds}
        archivedCreds={archivedCreds}
        archivedCredentialsIsOpen={archivedCredentialsIsOpen}
        setArchivedCredentialsIsOpen={handleArchivedCredentialsDisplayChange}
      />
    </>
  );
};

export { Credentials };
