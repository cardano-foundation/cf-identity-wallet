import { IonText } from "@ionic/react";
import { useMemo } from "react";
import { i18n } from "../../../../i18n";
import CardanoLogo from "../../../assets/images/CardanoLogo.jpg";
import {
  CardDetailsAttributes,
  CardDetailsBlock,
  CardDetailsItem,
} from "../../../components/CardDetails";
import { PageFooter } from "../../../components/PageFooter";
import { PageHeader } from "../../../components/PageHeader";
import { ScrollablePageLayout } from "../../../components/layout/ScrollablePageLayout";
import { RequestProps } from "../IncomingRequest.types";
import "./SignTransactionRequest.scss";
import { SideSlider } from "../../../components/SideSlider";

const SignTransactionRequest = ({
  pageId,
  activeStatus,
  requestData,
  handleAccept,
  handleIgnore,
  handleCancel,
}: RequestProps) => {
  const signTransaction = requestData.signTransaction;
  const ballotLogo = requestData.logo ? requestData.logo : CardanoLogo;

  const signDetails = useMemo(() => {
    if (!signTransaction) return {};

    return {
      [`${i18n.t("request.signtransaction.transaction.action")}`]:
        signTransaction.action,
      [`${i18n.t("request.signtransaction.transaction.actionText")}`]:
        signTransaction.actionText,
      [`${i18n.t("request.signtransaction.transaction.id")}`]:
        signTransaction.data.id,
      [`${i18n.t("request.signtransaction.transaction.address")}`]:
        signTransaction.data.address,
      [`${i18n.t("request.signtransaction.transaction.event")}`]:
        signTransaction.data.event,
      [`${i18n.t("request.signtransaction.transaction.category")}`]:
        signTransaction.data.category,
      [`${i18n.t("request.signtransaction.transaction.proposal")}`]:
        signTransaction.data.proposal,
      [`${i18n.t("request.signtransaction.transaction.network")}`]:
        signTransaction.data.network,
      [`${i18n.t("request.signtransaction.transaction.votedat")}`]:
        signTransaction.data.votedAt,
      [`${i18n.t("request.signtransaction.transaction.votingpower")}`]:
        signTransaction.data.votingPower,
      [`${i18n.t("request.signtransaction.transaction.slot")}`]:
        signTransaction.slot,
      [`${i18n.t("request.signtransaction.transaction.uri")}`]:
        signTransaction.uri,
    };
  }, [signTransaction]);

  const handleSign = () => {
    handleAccept();
  };

  return (
    <SideSlider open={!!activeStatus}>
      <ScrollablePageLayout
        activeStatus={activeStatus}
        pageId={pageId}
        customClass="sign-transaction"
        header={
          <PageHeader
            title={`${i18n.t("request.signtransaction.title")}`}
            closeButton
            closeButtonLabel={`${i18n.t("request.button.ignore")}`}
            closeButtonAction={handleIgnore}
          />
        }
      >
        <div className="sign-transaction-header">
          <img
            className="sign-owner-logo"
            data-testid="sign-logo"
            src={ballotLogo}
            alt={requestData.label}
          />
          <h2 className="sign-name">{requestData.label}</h2>
          <h3 className="sign-subtitle">{signTransaction?.eventName}</h3>
          <p className="sign-link">{signTransaction?.ownerUrl}</p>
        </div>
        <div className="sign-transaction-content">
          <CardDetailsBlock
            className="sign-address"
            title={`${i18n.t("request.signtransaction.transaction.address")}`}
          >
            <IonText className="address">
              {signTransaction?.data.address}
            </IonText>
          </CardDetailsBlock>
          <CardDetailsBlock
            className="sign-data"
            title={i18n.t("request.signtransaction.transaction.data")}
          >
            <CardDetailsAttributes
              data={signDetails}
              itemProps={{
                mask: false,
                fullText: true,
                copyButton: false,
                className: "sign-info-item",
              }}
            />
          </CardDetailsBlock>
        </div>
        <PageFooter
          primaryButtonText={`${i18n.t("request.button.sign")}`}
          primaryButtonAction={handleSign}
          secondaryButtonText={`${i18n.t("request.button.cancel")}`}
          secondaryButtonAction={handleCancel}
        />
      </ScrollablePageLayout>
    </SideSlider>
  );
};

export { SignTransactionRequest };
