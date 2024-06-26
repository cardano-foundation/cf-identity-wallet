import { IncomingRequestType } from "../../../../../../store/reducers/stateCache/stateCache.types";
import { RequestProps } from "../IncomingRequest.types";
import { CredentialRequest } from "./CredentialRequest";
import { MultiSigRequest } from "./MultiSigRequest";
import { SignRequest } from "./SignRequest";

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
}: RequestProps<IncomingRequestType>) => {
  switch (requestData.type) {
  case IncomingRequestType.CREDENTIAL_OFFER_RECEIVED:
    return (
      <CredentialRequest
        pageId={pageId}
        activeStatus={activeStatus}
        requestData={requestData}
        initiateAnimation={initiateAnimation}
        handleAccept={handleAccept}
        handleCancel={handleCancel}
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
  case IncomingRequestType.PEER_CONNECT_SIGN:
    return (
      <SignRequest
        pageId={pageId}
        activeStatus={activeStatus}
        blur={blur}
        setBlur={setBlur}
        requestData={requestData}
        initiateAnimation={initiateAnimation}
        handleAccept={handleAccept}
        handleCancel={handleCancel}
      />
    );
  default:
    return null;
  }
};

export { RequestComponent };
