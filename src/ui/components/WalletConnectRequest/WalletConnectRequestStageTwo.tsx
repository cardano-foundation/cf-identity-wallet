import { IonCheckbox, IonContent } from "@ionic/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { i18n } from "../../../i18n";
import { useAppSelector } from "../../../store/hooks";
import { getIdentifiersCache } from "../../../store/reducers/identifiersCache";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { CardItem, CardList } from "../CardList";
import { PageFooter } from "../PageFooter";
import { PageHeader } from "../PageHeader";
import { ResponsivePageLayout } from "../layout/ResponsivePageLayout";
import { ToastMsgType } from "../../globals/types";
import { combineClassNames } from "../../utils/style";
import "./WalletConnectRequest.scss";
import { WalletConnectRequestStageTwoProps } from "./WalletConnectRequest.types";

const WalletConnectRequestStageTwo = ({
  isOpen,
  className,
  onBackClick,
  onClose,
}: WalletConnectRequestStageTwoProps) => {
  const dispatch = useDispatch();
  const indentifierCache = useAppSelector(getIdentifiersCache);
  const [closeAnimation, setCloseAnimation] = useState(false);

  const [selectedIdentifier, setSelectedIdentifier] =
    useState<IdentifierShortDetails | null>(null);

  const displayIdentifiers = indentifierCache.map(
    (identifier, index): CardItem<IdentifierShortDetails> => ({
      id: index,
      title: identifier.displayName,
      image: "",
      data: identifier,
    })
  );

  const classes = combineClassNames("wallet-connect-stage-two", className, {
    show: !!isOpen,
    hide: !isOpen,
    "animation-on": closeAnimation,
    "animation-off": !closeAnimation,
  });

  const handleSelectIdentifier = (data: IdentifierShortDetails) => {
    setSelectedIdentifier(selectedIdentifier?.id === data.id ? null : data);
  };

  const handleConnectWallet = async () => {
    try {
      // TODO: implement connect wallet logic
      dispatch(setToastMsg(ToastMsgType.CONNECT_WALLET_SUCCESS));
      setCloseAnimation(true);

      setTimeout(() => {
        onClose();
      }, 500);
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
          title={`${i18n.t("connectwallet.request.stagetwo.title")}`}
          closeButton
          closeButtonLabel={`${i18n.t("connectwallet.request.button.back")}`}
          closeButtonAction={onBackClick}
        />
      }
    >
      <h2 className="title">
        {i18n.t("connectwallet.request.stagetwo.message")}
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
          "connectwallet.request.stagetwo.confirm"
        )}`}
        primaryButtonAction={handleConnectWallet}
        primaryButtonDisabled={!selectedIdentifier}
      />
    </ResponsivePageLayout>
  );
};

export { WalletConnectRequestStageTwo };
