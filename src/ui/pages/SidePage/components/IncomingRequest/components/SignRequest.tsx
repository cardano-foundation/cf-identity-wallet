import { IonText } from "@ionic/react";
import { useMemo, useState } from "react";
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
import { Spinner } from "../../../../../components/Spinner";
import { PageHeader } from "../../../../../components/PageHeader";
import { IncomingRequestType } from "../../../../../../store/reducers/stateCache/stateCache.types";

const SignRequest = ({
  pageId,
  activeStatus,
  requestData,
  initiateAnimation,
  handleAccept,
  handleCancel,
}: RequestProps) => {
  const [isSigningObject, setIsSigningObject] = useState(false);
  const signDetails = useMemo(() => {
    if (
      requestData.type !== IncomingRequestType.PEER_CONNECT_SIGN ||
      !requestData.signTransaction
    )
      return {};

    let signContent;
    try {
      signContent = JSON.parse(requestData.signTransaction.payload.payload);
      setIsSigningObject(true);
    } catch (error) {
      signContent = requestData.signTransaction.payload.payload;
    }
    return signContent;
  }, [requestData.type]);

  if (requestData.type !== IncomingRequestType.PEER_CONNECT_SIGN) {
    return null;
  }
  const signRequest = requestData.signTransaction;
  const logo = CardanoLogo;

  const handleSign = () => {
    handleAccept();
  };

  return (
    <>
      <ScrollablePageLayout
        activeStatus={activeStatus}
        pageId={pageId}
        customClass="sign-request"
        header={<PageHeader title={`${i18n.t("request.sign.title")}`} />}
        footer={
          <PageFooter
            customClass="sign-footer"
            primaryButtonText={`${i18n.t("request.button.sign")}`}
            primaryButtonAction={handleSign}
            secondaryButtonText={`${i18n.t("request.button.dontallow")}`}
            secondaryButtonAction={handleCancel}
          />
        }
      >
        <div className="sign-header">
          <img
            className="sign-owner-logo"
            data-testid="sign-logo"
            src={logo}
            alt={requestData.peerConnection?.name}
          />
          <h2 className="sign-name">{requestData.peerConnection?.name}</h2>
          <p className="sign-link">{requestData.peerConnection?.url}</p>
        </div>
        <div className="sign-content">
          <CardDetailsBlock
            className="sign-identifier"
            title={`${i18n.t("request.sign.identifier")}`}
          >
            <IonText className="identifier">
              {signRequest?.payload.identifier}
            </IonText>
          </CardDetailsBlock>
          <CardDetailsBlock
            className="sign-data"
            title={i18n.t("request.sign.transaction.data")}
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
              <IonText className="sign-string">
                {signDetails.toString()}
              </IonText>
            )}
          </CardDetailsBlock>
        </div>
      </ScrollablePageLayout>
      <Spinner show={initiateAnimation} />
    </>
  );
};

export { SignRequest };
