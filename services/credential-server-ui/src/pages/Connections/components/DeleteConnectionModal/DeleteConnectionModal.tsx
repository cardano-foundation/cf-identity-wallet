import { DeleteConnectionModalProps } from "./DeleteConnectionModal.types";
import "./HolderModal.scss";
import Grid from "@mui/material/Grid2";
import { ChevronLeft } from "@mui/icons-material";
import { Modal, Fade, Box, IconButton, Typography } from "@mui/material";

const DeleteConnectionModal = ({
  openModal,
  setOpenModal,
}: DeleteConnectionModalProps) => {
  const handleCloseModal = () => setOpenModal(false);

  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="delete-connection-modal-title"
      aria-describedby="delete-connection-modal-description"
    >
      <Fade in={openModal}>
        <Box
          color="text.primary"
          bgcolor="background.default"
          className="delete-connection-modal-container"
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
                id="delete-connection-modal-title"
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

export { DeleteConnectionModal };
