import React, { useState } from "react";
import { Alert, Box, Button, Container, Grid, TextField } from "@mui/material";
import { resolveOobi } from "../../services/resolve-oobi";

interface InputOobiProps {
  handleGetContacts: Function
}

const InputOobi: React.FC<InputOobiProps> = ({ ...props }) => {
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
      <Grid item xs={12} mb={2}>
        <TextField
          required
          id="input-oobi"
          label="Input connection link"
          variant="outlined"
          fullWidth
          onChange={(e) => setOobi(e.target.value)}
        />
        {isAtendeeOobiEmptyVisible && (
          <Alert severity="error">Please, input valid OOBI link</Alert>
        )}
        {submitSuccess && (
          <Alert severity="info">Resolve OOBI successfully</Alert>
        )}
      </Grid>
      <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Grid>
    </Container>
  );
};

export default InputOobi;
