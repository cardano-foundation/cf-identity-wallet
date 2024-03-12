import { IncomingRequestType } from "../../../../store/reducers/stateCache/stateCache.types";
import { RequestProps } from "../IncomingRequest.types";
import { ConnectionRequest } from "./ConnectionRequest";
import CredentialRequest from "./CredentialRequest";
import { MultiSigRequest } from "./MultiSigRequest";

const RequestComponent = ({
  pageId,
  requestData,
  initiateAnimation,
  handleAccept,
  handleCancel,
  handleIgnore,
  incomingRequestType,
}: RequestProps) => {
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
      return (
        <MultiSigRequest
          pageId={pageId}
          requestData={requestData}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={incomingRequestType}
        />
      );
    default:
      return null;
  }
};

export default RequestComponent;
