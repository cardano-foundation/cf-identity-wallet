import { IonText } from "@ionic/react";
import { useMemo, useState } from "react";
import { i18n } from "../../../../../../i18n";
import {
  CardDetailsAttributes,
  CardDetailsBlock,
} from "../../../../../components/CardDetails";
import { PageFooter } from "../../../../../components/PageFooter";
import { PageHeader } from "../../../../../components/PageHeader";
import { ScrollablePageLayout } from "../../../../../components/layout/ScrollablePageLayout";
import CardanoLogo from "../../../../../assets/images/CardanoLogo.jpg";
import { RequestProps } from "../IncomingRequest.types";
import "./SignTransactionRequest.scss";

const SignTransactionRequest = ({
  pageId,
  activeStatus,
  requestData,
  handleAccept,
  handleCancel,
}: RequestProps) => {
  const signTransaction = requestData.signTransaction;
  const [isSigningObject, setIsSigningObject] = useState(false);
  const ballotLogo = requestData.logo ? requestData.logo : CardanoLogo;

  const signDetails = useMemo(() => {
    if (!signTransaction) return {};

    let signTransactionContent;
    try {
      signTransactionContent = JSON.parse(signTransaction.payload.payload);
      setIsSigningObject(true);
    } catch (error) {
      signTransactionContent = signTransaction.payload.payload;
    }
    if (isSigningObject) {
      return {
        [`${i18n.t("request.signtransaction.transaction.action")}`]:
          signTransaction.type,
        [`${i18n.t("request.signtransaction.transaction.actionText")}`]:
          signTransactionContent,
      };
    } else {
      return signTransactionContent;
    }
  }, [requestData.signTransaction]);

  const handleSign = () => {
    handleAccept();
  };

  return (
    <ScrollablePageLayout
      activeStatus={activeStatus}
      pageId={pageId}
      customClass="sign-transaction"
      header={
        <PageHeader title={`${i18n.t("request.signtransaction.title")}`} />
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
        <h3 className="sign-subtitle">{signTransaction?.type}</h3>
      </div>
      <div className="sign-transaction-content">
        <CardDetailsBlock
          className="sign-address"
          title={`${i18n.t("request.signtransaction.identifier")}`}
        >
          <IonText className="address">
            {signTransaction?.payload.identifier}
          </IonText>
        </CardDetailsBlock>
        <CardDetailsBlock
          className="sign-data"
          title={i18n.t("request.signtransaction.transaction.data")}
        >
          {isSigningObject ? (
            <CardDetailsAttributes
              data={signDetails}
              itemProps={{
                mask: false,
                fullText: true,
                copyButton: false,
                className: "sign-info-item",
              }}
            />
          ) : (
            signDetails.toString()
          )}
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

export { SignTransactionRequest };
