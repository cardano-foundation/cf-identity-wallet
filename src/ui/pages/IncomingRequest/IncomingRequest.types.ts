import { IncomingRequestProps } from "../../../store/reducers/stateCache/stateCache.types";

interface RequestProps {
  pageId: string;
  requestData: IncomingRequestProps;
  handleAccept: () => void;
  handleCancel: () => void;
  incomingRequestType?: string;
}

export type { RequestProps };
