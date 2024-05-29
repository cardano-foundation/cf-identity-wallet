import { IonText } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { i18n } from "../../../../../../i18n";
import {
  CardDetailsAttributes,
  CardDetailsBlock,
} from "../../../../../components/CardDetails";
import { PageFooter } from "../../../../../components/PageFooter";
import { ScrollablePageLayout } from "../../../../../components/layout/ScrollablePageLayout";
import CardanoLogo from "../../../../../assets/images/CardanoLogo.jpg";
import { RequestProps } from "../IncomingRequest.types";
import "./SignRequest.scss";
import { PeerConnection } from "../../../../../../core/cardano/walletConnect/peerConnection";
import { Agent } from "../../../../../../core/agent/agent";
import { PeerConnectionMetadataRecord } from "../../../../../../core/agent/records";

const SignRequest = ({
  pageId,
  activeStatus,
  requestData,
  handleAccept,
  handleCancel,
}: RequestProps) => {
  const signRequest = requestData.signTransaction;
  const [isSigningObject, setIsSigningObject] = useState(false);
  const [peerConnection, setPeerConnection] =
    useState<PeerConnectionMetadataRecord>();
  const logo = requestData.logo ? requestData.logo : CardanoLogo;

  useEffect(() => {
    (async () => {
      const connectedDAppAddress =
        PeerConnection.peerConnection.getConnectedDAppAddress();
      const peerConnectionData =
        await Agent.agent.peerConnectionMetadataStorage.getPeerConnectionMetadata(
          connectedDAppAddress
        );
      setPeerConnection(peerConnectionData);
    })();
  }, []);

  const signDetails = useMemo(() => {
    if (!signRequest) return {};

    let signTransactionContent;
    try {
      signTransactionContent = JSON.parse(signRequest.payload.payload);
      setIsSigningObject(true);
    } catch (error) {
      signTransactionContent = signRequest.payload.payload;
    }
    return signTransactionContent;
  }, [requestData.signTransaction]);

  const handleSign = () => {
    handleAccept();
  };

  return (
    <ScrollablePageLayout
      activeStatus={activeStatus}
      pageId={pageId}
      customClass="sign-request"
      header={<h2>{`${i18n.t("request.signtransaction.title")}`}</h2>}
    >
      <div className="sign-header">
        <img
          className="sign-owner-logo"
          data-testid="sign-logo"
          src={logo}
          alt={requestData.label}
        />
        <h2 className="sign-name">{requestData.label}</h2>
        <p className="sign-link">{peerConnection?.url}</p>
      </div>
      <div className="sign-content">
        <CardDetailsBlock
          className="sign-identifier"
          title={`${i18n.t("request.signtransaction.identifier")}`}
        >
          <IonText className="identifier">
            {signRequest?.payload.identifier}
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

export { SignRequest };
