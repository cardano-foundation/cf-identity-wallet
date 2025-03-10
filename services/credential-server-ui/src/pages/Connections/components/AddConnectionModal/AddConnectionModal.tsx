import React from "react";
import { PopupModal } from "../../../../components/PopupModal";
import { AddConnectionModalProps } from "./AddConnectionModal.types";
import { i18n } from "../../../../i18n";
import { Button } from "@mui/material";

const AddConnectionModal = ({
  openModal,
  setOpenModal,
}: AddConnectionModalProps) => {
  return (
    <PopupModal
      open={openModal}
      onClose={() => setOpenModal(false)}
      title={i18n.t("pages.connections.addConnection.modal.title")}
      body={i18n.t("pages.connections.addConnection.modal.descriptionStepOne")}
      footer={
        <>
          <Button
            variant="contained"
            aria-label="cancel delete connection"
            onClick={() => setOpenModal(false)}
          >
            {i18n.t(
              "pages.connections.addConnection.modal.button.copyConnectionId"
            )}
          </Button>
          <Button
            variant="contained"
            aria-label="confirm delete connection"
            onClick={() => setOpenModal(false)}
          >
            {i18n.t("pages.connections.addConnection.modal.button.next")}
          </Button>
        </>
      }
    />
  );
};

export { AddConnectionModal };
