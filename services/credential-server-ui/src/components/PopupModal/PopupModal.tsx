import { Modal, Fade, Box, IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import "./PopupModal.scss";
import { PopupModalProps } from "./PopupModal.types";

const PopupModal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  customClass,
}: PopupModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className={"popup-modal" + (customClass ? " " + customClass : "")}
      keepMounted={false}
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
          {description && (
            <Typography className="popup-modal-description">
              {description}
            </Typography>
          )}
          {children}
          <div className="popup-modal-footer">{footer}</div>
        </Box>
      </Fade>
    </Modal>
  );
};

export { PopupModal };
