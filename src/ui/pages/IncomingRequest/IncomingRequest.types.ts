import { IncomingRequestProps } from "../../../store/reducers/stateCache/stateCache.types";

interface RequestProps {
  pageId: string;
  blur?: boolean;
  setBlur?: (value: boolean) => void;
  requestData: IncomingRequestProps;
  initiateAnimation: boolean;
  handleAccept: () => void;
  handleCancel: () => void;
  handleIgnore?: () => void;
  incomingRequestType?: string;
  setRequestStage?: (stage: number) => void;
}

export type { RequestProps };
