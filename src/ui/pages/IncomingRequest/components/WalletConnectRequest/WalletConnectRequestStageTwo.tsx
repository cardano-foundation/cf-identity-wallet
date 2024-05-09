import { IonCheckbox, IonContent } from "@ionic/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { IdentifierShortDetails } from "../../../../../core/agent/services/identifier.types";
import { i18n } from "../../../../../i18n";
import { useAppSelector } from "../../../../../store/hooks";
import { getIdentifiersCache } from "../../../../../store/reducers/identifiersCache";
import { CardItem, CardList } from "../../../../components/CardList";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { ResponsivePageLayout } from "../../../../components/layout/ResponsivePageLayout";
import { combineClassNames } from "../../../../utils/style";
import { RequestProps } from "../../IncomingRequest.types";
import "./WalletConnectRequest.scss";
import { VerifyPassword } from "../../../../components/VerifyPassword";
import { VerifyPasscode } from "../../../../components/VerifyPasscode";
import {
  getStateCache,
  setToastMsg,
} from "../../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../../globals/types";

const WalletConnectRequestStageTwo = ({
  pageId,
  activeStatus,
  initiateAnimation,
  setRequestStage,
  handleCancel,
}: RequestProps) => {
  const dispatch = useDispatch();
  const indentifierCache = useAppSelector(getIdentifiersCache);
  const stateCache = useAppSelector(getStateCache);
  const [selectedIdentifier, setSelectedIdentifier] =
    useState<IdentifierShortDetails | null>(null);

  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);

  const displayIdentifiers = indentifierCache.map(
    (identifier, index): CardItem<IdentifierShortDetails> => ({
      id: index,
      title: identifier.displayName,
      image: "",
      data: identifier,
    })
  );

  const classes = combineClassNames("wallet-connect-stage-two", {
    show: !!activeStatus,
    hide: !activeStatus,
    "animation-on": initiateAnimation,
    "animation-off": !initiateAnimation,
  });

  const handleSelectIdentifier = (data: IdentifierShortDetails) => {
    setSelectedIdentifier(selectedIdentifier?.id === data.id ? null : data);
  };

  const handleOpenVerify = () => {
    if (
      !stateCache?.authentication.passwordIsSkipped &&
      stateCache?.authentication.passwordIsSet
    ) {
      setVerifyPasswordIsOpen(true);
    } else {
      setVerifyPasscodeIsOpen(true);
    }
  };

  const handleConnectWallet = async () => {
    try {
      // TODO: implement connect wallet logic
      dispatch(setToastMsg(ToastMsgType.CONNECT_WALLET_SUCCESS));
      handleCancel();
    } catch (e) {
      dispatch(setToastMsg(ToastMsgType.UNABLE_CONNECT_WALLET));
    }
  };

  return (
    <>
      <ResponsivePageLayout
        pageId={`${pageId}`}
        activeStatus={activeStatus}
        customClass={classes}
        header={
          <PageHeader
            title={`${i18n.t("request.walletconnection.stagetwo.title")}`}
            closeButton
            closeButtonLabel={`${i18n.t(
              "request.walletconnection.stagetwo.back"
            )}`}
            closeButtonAction={() => setRequestStage?.(0)}
          />
        }
      >
        <h2 className="title">
          {i18n.t("request.walletconnection.stagetwo.message")}
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
            "request.walletconnection.stagetwo.confirm"
          )}`}
          primaryButtonAction={handleOpenVerify}
          primaryButtonDisabled={!selectedIdentifier}
        />
      </ResponsivePageLayout>
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        onVerify={handleConnectWallet}
      />
      <VerifyPasscode
        isOpen={verifyPasscodeIsOpen}
        setIsOpen={setVerifyPasscodeIsOpen}
        onVerify={handleConnectWallet}
      />
    </>
  );
};

export { WalletConnectRequestStageTwo };
