import { IdentifierDetails } from "../../../../../core/agent/services/identifier.types";

enum DetailView {
    GroupMember = "groupmember",
    SigningThreshold = "signingthreshold",
    Id = "id",
    Created = "created",
    SigningKey="signingkeys",
    RotationThreshold="rotationthreshold",
    SequenceNumber="sequencenumber",
    RotationKeyDigests = "rotationkeydigests",
}

interface IdentifierDetailModalProps {
    isOpen: boolean;
    setOpen: (value: boolean) => void;
    data: IdentifierDetails;
    view: DetailView;
    setViewType: (view: DetailView) => void;
    reloadData: () => Promise<void>
}

interface IdentifierIDDetailProps {
    id: string;
}

interface SigningThresholdProps {
    data: IdentifierDetails;
    setViewType: (view: DetailView) => void;
}

interface CreatedTimestampProps {
    createdTime: string;
}

interface SenquenceNumberProps {
    data: IdentifierDetails;
}

interface ListItem {
    image?: string;
    title: string;
    isCurrentUser?: boolean;
}

interface ListProps {
    title: string;
    data: ListItem[];
    bottomText: string;
    fullText?: boolean;
    mask?: boolean;
    rotateAction?: () => void;
}

export type { IdentifierDetailModalProps, IdentifierIDDetailProps, SigningThresholdProps, CreatedTimestampProps, SenquenceNumberProps, ListProps, ListItem }

export { DetailView };