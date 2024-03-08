interface RequestProps {
  pageId: string;
  requestData: {
    label: string;
    logo?: string;
  };
  handleAccept: () => void;
  handleCancel: () => void;
  incomingRequestType?: string;
}

export type { RequestProps };
