import { HolderModalProps } from "./HolderModal.types";
import "./HolderModal.scss";
import Grid from "@mui/material/Grid2";
import { ChevronLeft } from "@mui/icons-material";
import { Modal, Fade, Box, IconButton, Typography } from "@mui/material";

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
          <Grid
            container
            spacing={1}
          >
            <Grid size={1}>
              <IconButton
                size="large"
                aria-label="close modal"
                disableRipple
                onClick={handleCloseModal}
              >
                <ChevronLeft />
              </IconButton>
            </Grid>
            <Grid size={10}>
              <Typography
                id="holder-modal-title"
                variant="h6"
                component="h2"
              >
                Text in a modal
              </Typography>
            </Grid>
            <Grid size={1} />
          </Grid>
        </Box>
      </Fade>
    </Modal>
  );
};

export { HolderModal };
