import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { HolderModalProps } from "./HolderModal.types";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";
import "./HolderModal.scss";

const HolderModal = ({ openModal, setOpenModal }: HolderModalProps) => {
  const handleCloseModal = () => setOpenModal(false);

  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="holder-modal-title"
      aria-describedby="holder-modal-description"
    >
      <Fade in={openModal}>
        <Box
          color="text.primary"
          bgcolor="background.default"
          className="holder-modal-container"
        >
          <Typography
            id="holder-modal-title"
            variant="h6"
            component="h2"
          >
            Text in a modal
          </Typography>
          <Typography
            id="holderl-modal-description"
            onClick={handleCloseModal}
          >
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Fade>
    </Modal>
  );
};

export { HolderModal };
