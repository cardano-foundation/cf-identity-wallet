import {
  IonButton,
  IonIcon,
  IonLabel,
  useIonViewWillEnter,
} from "@ionic/react";
import { peopleOutline, addOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { TabLayout } from "../../components/layout/TabLayout";
import { i18n } from "../../../i18n";
import "./Creds.scss";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { CardsStack } from "../../components/CardsStack";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getToastMsg,
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { Connections } from "../Connections";
import { CardType, OperationType, ToastMsgType } from "../../globals/types";
import { ArchivedCredentials } from "../../components/ArchivedCredentials";
import { Agent } from "../../../core/agent/agent";
import {
  getCredsCache,
  getFavouritesCredsCache,
} from "../../../store/reducers/credsCache";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { StartAnimationSource } from "../Identifiers/Identifiers.type";

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

const Creds = () => {
  const pageId = "creds-tab";
  const dispatch = useAppDispatch();
  const credsCache = useAppSelector(getCredsCache);
  const favCredsCache = useAppSelector(getFavouritesCredsCache);
  const toastMsg = useAppSelector(getToastMsg);
  const [archivedCreds, setArchivedCreds] = useState<CredentialShortDetails[]>(
    []
  );
  const [showConnections, setShowConnections] = useState(false);
  const [archivedCredentialsIsOpen, setArchivedCredentialsIsOpen] =
    useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [navAnimation, setNavAnimation] =
    useState<StartAnimationSource>("none");
  const favouriteContainerElement = useRef<HTMLDivElement>(null);

  const fetchArchivedCreds = async () => {
    // @TODO - sdisalvo: handle error
    const creds = await Agent.agent.credentials.getCredentials(true);
    setArchivedCreds(creds);
  };

  useEffect(() => {
    setShowPlaceholder(credsCache.length === 0);
  }, [credsCache]);

  useEffect(() => {
    const validToastMsgTypes = [
      ToastMsgType.CREDENTIAL_ARCHIVED,
      ToastMsgType.CREDENTIAL_RESTORED,
      ToastMsgType.CREDENTIALS_RESTORED,
      ToastMsgType.CREDENTIAL_DELETED,
      ToastMsgType.CREDENTIALS_DELETED,
    ];

    if (toastMsg && validToastMsgTypes.includes(toastMsg)) {
      fetchArchivedCreds();
    }
  }, [toastMsg]);

  const handleCreateCred = () => {
    dispatch(setCurrentOperation(OperationType.SCAN_CONNECTION));
  };

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.CREDS }));
    fetchArchivedCreds();
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

  const allCreds = credsCache.filter(
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

  const ArchivedCredentialsButton = () => {
    return (
      <div className="archived-credentials-button-container">
        <IonButton
          fill="outline"
          className="secondary-button"
          onClick={() => setArchivedCredentialsIsOpen(true)}
        >
          <IonLabel color="secondary">
            {i18n.t("creds.tab.viewarchived")}
          </IonLabel>
        </IonButton>
      </div>
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
        customClass={tabClasses}
        title={`${i18n.t("creds.tab.title")}`}
        additionalButtons={
          <AdditionalButtons
            handleConnections={() => setShowConnections(true)}
            handleCreateCred={handleCreateCred}
          />
        }
        placeholder={
          showPlaceholder && (
            <CardsPlaceholder
              buttonLabel={i18n.t("creds.tab.create")}
              buttonAction={handleCreateCred}
              testId={pageId}
            >
              {!!archivedCreds.length && <ArchivedCredentialsButton />}
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
              >
                {!!allCreds.length && <h3>{i18n.t("creds.tab.favourites")}</h3>}
                <CardsStack
                  name="favs"
                  cardsType={CardType.CREDS}
                  cardsData={sortedFavCreds}
                  onShowCardDetails={() => handleShowNavAnimation("favourite")}
                />
              </div>
            )}
            {!!allCreds.length && (
              <div className="credentials-tab-content-block credential-cards">
                {!!favCreds.length && <h3>{i18n.t("creds.tab.allcreds")}</h3>}
                <CardsStack
                  name="allcreds"
                  cardsType={CardType.CREDS}
                  cardsData={allCreds}
                  onShowCardDetails={() => handleShowNavAnimation("cards")}
                />
              </div>
            )}
            {!!archivedCreds.length && <ArchivedCredentialsButton />}
          </>
        )}
      </TabLayout>
      <ArchivedCredentials
        archivedCreds={archivedCreds}
        archivedCredentialsIsOpen={archivedCredentialsIsOpen}
        setArchivedCredentialsIsOpen={setArchivedCredentialsIsOpen}
      />
    </>
  );
};

export { Creds };
