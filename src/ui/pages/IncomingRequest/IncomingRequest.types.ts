import { IncomingRequestProps } from "../../../store/reducers/stateCache/stateCache.types";

interface RequestProps {
  pageId: string;
  requestData: IncomingRequestProps;
  initiateAnimation: boolean;
  handleAccept: () => void;
  handleCancel: () => void;
  handleIgnore?: () => void;
  incomingRequestType?: string;
  setRequestStage?: (stage: number) => void;
}

export type { RequestProps };
