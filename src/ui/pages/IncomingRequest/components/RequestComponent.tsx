import { IncomingRequestType } from "../../../../store/reducers/stateCache/stateCache.types";
import { RequestProps } from "../IncomingRequest.types";
import { CredentialRequest } from "./CredentialRequest";
import { MultiSigRequest } from "./MultiSigRequest";

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
  switch (incomingRequestType) {
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
    return (
      <MultiSigRequest
        blur={blur}
        setBlur={setBlur}
        pageId={pageId}
        activeStatus={activeStatus}
        requestData={requestData}
        initiateAnimation={initiateAnimation}
        handleAccept={handleAccept}
        handleCancel={handleCancel}
        handleIgnore={handleIgnore}
      />
    );
  default:
    return null;
  }
};

export { RequestComponent };
