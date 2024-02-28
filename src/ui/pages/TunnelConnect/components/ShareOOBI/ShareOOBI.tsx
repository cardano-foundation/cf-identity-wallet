import { ShareOOBIProps } from "./ShareOOBI.types";
import "./ShareOOBI.scss";
import { ResponsiveModal } from "../../../../components/layout/ResponsiveModal";
import { PageHeader } from "../../../../components/PageHeader";

const ShareOOBI = ({ modalIsOpen, setModalIsOpen }: ShareOOBIProps) => {
  const componentId = "share-oobi-modal";

  const resetModal = () => {
    setModalIsOpen(false);
  };

  return (
    <ResponsiveModal
      componentId={componentId}
      modalIsOpen={modalIsOpen}
      onDismiss={() => resetModal()}
    >
      <>
        <PageHeader
          closeButton={true}
          closeButtonLabel="Close"
          closeButtonAction={() => resetModal()}
          title="Share OOBI"
        />
        <div className="">hello</div>
      </>
    </ResponsiveModal>
  );
};

export { ShareOOBI };
