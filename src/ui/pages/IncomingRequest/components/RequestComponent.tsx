import { useState } from "react";
import { IncomingRequestType } from "../../../../store/reducers/stateCache/stateCache.types";
import { RequestProps } from "../IncomingRequest.types";
import { ConnectionRequest } from "./ConnectionRequest";
import { CredentialRequest } from "./CredentialRequest";
import { MultiSigRequestStageOne } from "./MultiSigRequestStageOne";
import { MultiSigRequestStageTwo } from "./MultiSigRequestStageTwo";
import { TunnelRequest } from "./TunnelRequest";

const RequestComponent = ({
  pageId,
  activeStatus,
  blur,
  setBlur,
  requestData,
  initiateAnimation,
  handleAccept,
  handleCancel,
  handleIgnore,
  incomingRequestType,
}: RequestProps) => {
  const [requestStage, setRequestStage] = useState(0);
  switch (incomingRequestType) {
  case IncomingRequestType.CONNECTION_INCOMING:
  case IncomingRequestType.CONNECTION_RESPONSE:
    return (
      <ConnectionRequest
        pageId={pageId}
        activeStatus={activeStatus}
        requestData={requestData}
        initiateAnimation={initiateAnimation}
        handleAccept={handleAccept}
        handleCancel={handleCancel}
        incomingRequestType={incomingRequestType}
      />
    );
  case IncomingRequestType.CREDENTIAL_OFFER_RECEIVED:
    return (
      <CredentialRequest
        pageId={pageId}
        activeStatus={activeStatus}
        requestData={requestData}
        initiateAnimation={initiateAnimation}
        handleAccept={handleAccept}
        handleCancel={handleCancel}
        incomingRequestType={incomingRequestType}
      />
    );
  case IncomingRequestType.MULTI_SIG_REQUEST_INCOMING:
    return requestStage === 0 ? (
      <MultiSigRequestStageOne
        pageId={pageId}
        activeStatus={activeStatus}
        requestData={requestData}
        initiateAnimation={initiateAnimation}
        handleAccept={handleAccept}
        handleCancel={handleCancel}
        handleIgnore={handleIgnore}
        setRequestStage={setRequestStage}
      />
    ) : (
      <MultiSigRequestStageTwo
        pageId={pageId}
        activeStatus={activeStatus}
        blur={blur}
        setBlur={setBlur}
        requestData={requestData}
        initiateAnimation={initiateAnimation}
        handleAccept={handleAccept}
        handleCancel={handleCancel}
        setRequestStage={setRequestStage}
      />
    );
  case IncomingRequestType.TUNNEL_REQUEST:
    return (
      <TunnelRequest
        pageId={pageId}
        activeStatus={activeStatus}
        requestData={requestData}
        initiateAnimation={initiateAnimation}
        handleAccept={handleAccept}
        handleCancel={handleCancel}
        incomingRequestType={incomingRequestType}
      />
    );
  default:
    return null;
  }
};

export { RequestComponent };
