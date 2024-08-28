import React, { useState } from "react";
import { Alert, Box, Button, Container, Grid, TextField } from "@mui/material";
import { resolveOobi } from "../../services/resolve-oobi";

interface GetInputButtonProps {
  handleGetContacts: Function
}

const GetInputButton: React.FC<GetInputButtonProps> = ({...props}) => {
  const [showInput, setShowInput] = useState(false);
  const [oobi, setOobi] = useState("");
  const [isAtendeeOobiEmptyVisible, setIsAtendeeOobiEmptyVisible] =
    useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async () => {
    setSubmitSuccess(false);
    if (oobi === "" || !oobi.includes("oobi")) {
      setIsAtendeeOobiEmptyVisible(true);
      return;
    } else {
      setIsAtendeeOobiEmptyVisible(false);
    }
    await resolveOobi(oobi);
    await props.handleGetContacts();
    setSubmitSuccess(true);
  };

  return (
    <Container sx={{ py: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "right" }} mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowInput(true)}
        >
          Input OOBI
        </Button>
      </Box>
      {showInput && (
        <>
          <Grid item xs={11} mb={2}>
            <TextField
              required
              id="input-oobi"
              label="Oobi link"
              variant="outlined"
              fullWidth
              onChange={(e) => setOobi(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "right" }}>
            {isAtendeeOobiEmptyVisible && (
              <Alert severity="error">Please, input valid OOBI link</Alert>
            )}
            {submitSuccess && (
              <Alert severity="info">Resolve OOBI successfully</Alert>
            )}
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default GetInputButton;
