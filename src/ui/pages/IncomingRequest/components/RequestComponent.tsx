import { useState } from "react";
import { IncomingRequestType } from "../../../../store/reducers/stateCache/stateCache.types";
import { RequestProps } from "../IncomingRequest.types";
import { ConnectionRequest } from "./ConnectionRequest";
import CredentialRequest from "./CredentialRequest";
import { MultiSigRequestStageOne } from "./MultiSigRequestStageOne";
import { MultiSigRequestStageTwo } from "./MultiSigRequestStageTwo";

const RequestComponent = ({
  pageId,
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
        requestData={requestData}
        initiateAnimation={initiateAnimation}
        handleAccept={handleAccept}
        handleCancel={handleCancel}
        setRequestStage={setRequestStage}
      />
    );
  default:
    return null;
  }
};

export default RequestComponent;
