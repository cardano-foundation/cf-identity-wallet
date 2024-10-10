import {
  IonButton,
  IonIcon,
  IonLabel,
  useIonViewWillEnter,
} from "@ionic/react";
import { addOutline, peopleOutline } from "ionicons/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Agent } from "../../../core/agent/agent";
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
  setCurrentOperation,
  setCurrentRoute,
  setToastMsg,
  showConnections,
} from "../../../store/reducers/stateCache";
import { ArchivedCredentials } from "../../components/ArchivedCredentials";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { TabLayout } from "../../components/layout/TabLayout";
import { CardType, OperationType, ToastMsgType } from "../../globals/types";
import { useOnlineStatusEffect } from "../../hooks";
import { StartAnimationSource } from "../Identifiers/Identifiers.type";
import "./Credentials.scss";
import { ListHeader } from "../../components/ListHeader";
import { CardList as CredentialCardList } from "../../components/SwitchCardView";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "../../../core/agent/services/credentialService.types";
import { RemovePendingAlert } from "../../components/RemovePendingAlert";
import { showError } from "../../utils/error";

const CLEAR_STATE_DELAY = 1000;

interface AdditionalButtonsProps {
  handleCreateCred: () => void;
  handleConnections: () => void;
}

const AdditionalButtons = ({
  handleCreateCred,
  handleConnections,
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
        className="add-credential-button"
        data-testid="add-credential-button"
        onClick={handleCreateCred}
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
  }, [credsCache]);

  useOnlineStatusEffect(fetchArchivedCreds);

  const handleConnections = () => {
    dispatch(showConnections(true));
  };

  const handleCreateCred = () => {
    dispatch(setCurrentOperation(OperationType.SCAN_CONNECTION));
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

  const allCreds = confirmedCreds.filter(
    (cred) => !favCredsCache?.some((fav) => fav.id === cred.id)
  );

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

  const tabClasses = `credential-tab ${
    navAnimation === "cards"
      ? "cards-credential-nav"
      : navAnimation === "favourite"
        ? "favorite-credential-nav"
        : ""
  }`;

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
          <AdditionalButtons
            handleConnections={handleConnections}
            handleCreateCred={handleCreateCred}
          />
        }
        placeholder={
          showPlaceholder && (
            <CardsPlaceholder
              buttonLabel={i18n.t("tabs.credentials.tab.create")}
              buttonAction={handleCreateCred}
              testId={pageId}
            >
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
                {!!allCreds.length && (
                  <h3>{i18n.t("tabs.credentials.tab.favourites")}</h3>
                )}
                <CardsStack
                  name="favs"
                  cardsType={CardType.CREDENTIALS}
                  cardsData={sortedFavCreds}
                  onShowCardDetails={() => handleShowNavAnimation("favourite")}
                />
              </div>
            )}
            {!!allCreds.length && (
              <div className="credentials-tab-content-block credential-cards">
                {!!favCreds.length && (
                  <h3>{i18n.t("tabs.credentials.tab.allcreds")}</h3>
                )}
                <CardsStack
                  name="allcreds"
                  cardsType={CardType.CREDENTIALS}
                  cardsData={allCreds}
                  onShowCardDetails={() => handleShowNavAnimation("cards")}
                />
              </div>
            )}
            {!!pendingCreds.length && (
              <div className="credetial-tab-content-block">
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
          "credentials.tab.detelepending.secondchecktitle"
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
