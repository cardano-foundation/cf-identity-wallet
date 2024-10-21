import { useEffect, useState } from "react";
import { CredentialDetailModal } from "../../../../../components/CredentialDetailModule";
import { LightCredentialDetailModalProps } from "../CredentialRequest.types";

const LightCredentialDetailModal = ({
  credId,
  isOpen,
  defaultSelected,
  joinedCredRequestMembers,
  setIsOpen,
  onClose,
  viewOnly,
}: LightCredentialDetailModalProps) => {
  const [isSelected, setSelected] = useState(!!defaultSelected);

  useEffect(() => {
    setSelected(!!defaultSelected);
  }, [defaultSelected]);

  return (
    <CredentialDetailModal
      pageId="request-cred-detail"
      id={credId || ""}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClose={(reason) => {
        onClose?.(reason, isSelected, credId);
      }}
      isLightMode
      selected={isSelected}
      setSelected={setSelected}
      joinedCredRequestMembers={joinedCredRequestMembers}
      viewOnly={viewOnly}
    />
  );
};
export { LightCredentialDetailModal };
