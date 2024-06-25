import { IonCheckbox, IonContent } from "@ionic/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { IdentifierShortDetails } from "../../../../../core/agent/services/identifier.types";
import { i18n } from "../../../../../i18n";
import { useAppSelector } from "../../../../../store/hooks";
import { getIdentifiersCache } from "../../../../../store/reducers/identifiersCache";
import {
  setCurrentOperation,
  setToastMsg,
} from "../../../../../store/reducers/stateCache";
import { CardItem, CardList } from "../../../../components/CardList";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { ResponsivePageLayout } from "../../../../components/layout/ResponsivePageLayout";
import { OperationType, ToastMsgType } from "../../../../globals/types";
import { combineClassNames } from "../../../../utils/style";
import "./WalletConnect.scss";
import { WalletConnectStageTwoProps } from "./WalletConnect.types";
import { PeerConnection } from "../../../../../core/cardano/walletConnect/peerConnection";
import {
  getWalletConnectionsCache,
  setWalletConnectionsCache,
} from "../../../../../store/reducers/walletConnectionsCache";
import KeriLogo from "../../../../assets/images/KeriGeneric.jpg";

const WalletConnectStageTwo = ({
  isOpen,
  pendingDAppMeerkat,
  className,
  onBackClick,
  onClose,
}: WalletConnectStageTwoProps) => {
  const dispatch = useDispatch();
  const identifierCache = useAppSelector(getIdentifiersCache);
  const existingConnections = useAppSelector(getWalletConnectionsCache);

  const [selectedIdentifier, setSelectedIdentifier] =
    useState<IdentifierShortDetails | null>(null);

  const displayIdentifiers = identifierCache
    .filter((item) => !item.groupMetadata)
    .map(
      (identifier, index): CardItem<IdentifierShortDetails> => ({
        id: index,
        title: identifier.displayName,
        image: KeriLogo,
        data: identifier,
      })
    );

  const classes = combineClassNames("wallet-connect-stage-two", className, {
    show: !!isOpen,
    hide: !isOpen,
  });

  const handleSelectIdentifier = (data: IdentifierShortDetails) => {
    setSelectedIdentifier(selectedIdentifier?.id === data.id ? null : data);
  };

  const handleConnectWallet = async () => {
    try {
      if (selectedIdentifier && pendingDAppMeerkat) {
        await PeerConnection.peerConnection.start(selectedIdentifier.id);
        await PeerConnection.peerConnection.connectWithDApp(pendingDAppMeerkat);
        const existingConnection = existingConnections.find(
          (connection) => connection.id === pendingDAppMeerkat
        );
        if (existingConnection) {
          existingConnection.selectedAid = selectedIdentifier.id;
          dispatch(setWalletConnectionsCache([...existingConnections]));
        } else {
          // Insert a new connection if needed
          dispatch(
            setWalletConnectionsCache([
              { id: pendingDAppMeerkat, selectedAid: selectedIdentifier.id },
              ...existingConnections,
            ])
          );
        }

        dispatch(
          setCurrentOperation(OperationType.OPEN_WALLET_CONNECTION_DETAIL)
        );
      }
      onClose();
    } catch (e) {
      dispatch(setToastMsg(ToastMsgType.UNABLE_CONNECT_WALLET));
    }
  };

  return (
    <ResponsivePageLayout
      pageId="wallet-connect-stage-two"
      activeStatus={isOpen}
      customClass={classes}
      header={
        <PageHeader
          title={`${i18n.t(
            "menu.tab.items.connectwallet.request.stagetwo.title"
          )}`}
          closeButton
          closeButtonLabel={`${i18n.t(
            "menu.tab.items.connectwallet.request.button.back"
          )}`}
          closeButtonAction={onBackClick}
        />
      }
    >
      <h2 className="title">
        {i18n.t("menu.tab.items.connectwallet.request.stagetwo.message")}
      </h2>
      <IonContent className="identifier-list">
        <CardList
          data={displayIdentifiers}
          onCardClick={(data, e) => {
            e.stopPropagation();
          }}
          onRenderEndSlot={(data) => {
            return (
              <IonCheckbox
                checked={selectedIdentifier?.id === data.id}
                aria-label=""
                className="checkbox"
                data-testid={`identifier-select-${data.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectIdentifier(data);
                }}
              />
            );
          }}
        />
      </IonContent>
      <PageFooter
        primaryButtonText={`${i18n.t(
          "menu.tab.items.connectwallet.request.stagetwo.confirm"
        )}`}
        primaryButtonAction={handleConnectWallet}
        primaryButtonDisabled={!selectedIdentifier}
      />
    </ResponsivePageLayout>
  );
};

export { WalletConnectStageTwo };
