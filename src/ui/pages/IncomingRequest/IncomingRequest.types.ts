import {
  IncomingRequestProps,
  IncomingRequestType,
} from "../../../store/reducers/stateCache/stateCache.types";

interface RequestProps<T extends IncomingRequestType> {
  pageId: string;
  activeStatus?: boolean;
  blur?: boolean;
  setBlur?: (value: boolean) => void;
  requestData: IncomingRequestProps & { type: T };
  initiateAnimation: boolean;
  handleAccept: () => void;
  handleCancel: () => void;
  handleIgnore?: () => void;
}

export type { RequestProps };
