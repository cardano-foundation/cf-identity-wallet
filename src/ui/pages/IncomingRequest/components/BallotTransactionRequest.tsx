import { IonText } from "@ionic/react";
import { useMemo } from "react";
import { i18n } from "../../../../i18n";
import CardanoLogo from "../../../assets/images/CardanoLogo.jpg";
import {
  CardDetailsBlock,
  CardDetailsItem,
} from "../../../components/CardDetails";
import { PageFooter } from "../../../components/PageFooter";
import { PageHeader } from "../../../components/PageHeader";
import { ScrollablePageLayout } from "../../../components/layout/ScrollablePageLayout";
import { RequestProps } from "../IncomingRequest.types";
import "./BallotTransactionRequest.scss";

const BallotTransactionRequest = ({
  activeStatus,
  requestData,
  handleAccept,
  handleIgnore,
  handleCancel,
}: RequestProps) => {
  const ballot = requestData.ballotData;
  const ballotLogo = requestData.logo ? requestData.logo : CardanoLogo;

  const ballotDetails = useMemo(() => {
    if (!ballot) return [];

    return [
      {
        key: `${i18n.t("request.ballottransaction.transaction.action")}`,
        value: ballot.action,
      },
      {
        key: `${i18n.t("request.ballottransaction.transaction.actionText")}`,
        value: ballot.actionText,
      },
      {
        key: `${i18n.t("request.ballottransaction.transaction.id")}`,
        value: ballot.data.id,
      },
      {
        key: `${i18n.t("request.ballottransaction.transaction.address")}`,
        value: ballot.data.address,
      },
      {
        key: `${i18n.t("request.ballottransaction.transaction.event")}`,
        value: ballot.data.event,
      },
      {
        key: `${i18n.t("request.ballottransaction.transaction.category")}`,
        value: ballot.data.category,
      },
      {
        key: `${i18n.t("request.ballottransaction.transaction.proposal")}`,
        value: ballot.data.proposal,
      },
      {
        key: `${i18n.t("request.ballottransaction.transaction.network")}`,
        value: ballot.data.network,
      },
      {
        key: `${i18n.t("request.ballottransaction.transaction.votedat")}`,
        value: ballot.data.votedAt,
      },
      {
        key: `${i18n.t("request.ballottransaction.transaction.votingpower")}`,
        value: ballot.data.votingPower,
      },
      {
        key: `${i18n.t("request.ballottransaction.transaction.slot")}`,
        value: ballot.slot,
      },
      {
        key: `${i18n.t("request.ballottransaction.transaction.uri")}`,
        value: ballot.uri,
      },
    ];
  }, [ballot]);

  const handleSign = () => {
    handleAccept();
  };

  return (
    <ScrollablePageLayout
      activeStatus={activeStatus}
      pageId="ballot-transaction"
      header={
        <PageHeader
          title={`${i18n.t("request.ballottransaction.title")}`}
          closeButton
          closeButtonLabel={`${i18n.t("request.button.ignore")}`}
          closeButtonAction={handleIgnore}
        />
      }
    >
      <div className="ballot-transaction-header">
        <img
          className="ballot-owner-logo"
          data-testid="ballot-logo"
          src={ballotLogo}
          alt={requestData.label}
        />
        <h2 className="ballot-name">{requestData.label} Ballot</h2>
        <h3 className="ballot-subtitle">{ballot?.eventName}</h3>
        <p className="ballot-link">{ballot?.ownerUrl}</p>
      </div>
      <div className="ballot-transaction-content">
        <CardDetailsBlock
          className="ballot-address"
          title={`${i18n.t("request.ballottransaction.transaction.address")}`}
        >
          <IonText>{ballot?.data.address}</IonText>
        </CardDetailsBlock>
        <CardDetailsBlock
          className="ballot-data"
          title={i18n.t("request.ballottransaction.transaction.data")}
        >
          {ballotDetails.map((detail) => (
            <CardDetailsItem
              testId={detail.key}
              key={detail.key}
              info={detail.value}
              keyValue={`${detail.key}:`}
              mask={false}
            />
          ))}
        </CardDetailsBlock>
      </div>
      <PageFooter
        primaryButtonText={`${i18n.t("request.button.sign")}`}
        primaryButtonAction={handleSign}
        secondaryButtonText={`${i18n.t("request.button.cancel")}`}
        secondaryButtonAction={handleCancel}
      />
    </ScrollablePageLayout>
  );
};

export { BallotTransactionRequest };
