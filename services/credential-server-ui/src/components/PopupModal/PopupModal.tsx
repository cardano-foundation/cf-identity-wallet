import React from "react";
import { Modal, Fade, Box, IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import "./PopupModal.scss";

interface PopupModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  body: React.ReactNode;
  footer: React.ReactNode;
}

const PopupModal: React.FC<PopupModalProps> = ({
  open,
  onClose,
  title,
  body,
  footer,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="popup-modal-title"
      aria-describedby="popup-modal-description"
      className="popup-modal"
    >
      <Fade in={open}>
        <Box
          color="text.primary"
          bgcolor="background.default"
          className="popup-modal-container"
        >
          <div className="popup-modal-header">
            <h2>{title}</h2>
            <IconButton
              size="large"
              aria-label="close modal"
              disableRipple
              onClick={onClose}
            >
              <Close />
            </IconButton>
          </div>
          <Typography className="popup-modal-body">{body}</Typography>
          <div className="popup-modal-footer">{footer}</div>
        </Box>
      </Fade>
    </Modal>
  );
};

export { PopupModal };
