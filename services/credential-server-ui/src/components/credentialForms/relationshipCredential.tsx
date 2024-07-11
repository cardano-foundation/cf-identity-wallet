import React, { useState } from "react";
import { Alert, Button, Grid, TextField } from "@mui/material";

interface RelationshipFormProps {
  onCustomCredentialChange?: (newJson: string) => void;
}

const RelationshipForm: React.FC<RelationshipFormProps> = ({
  onCustomCredentialChange,
}) => {
  const jsonFilePath = "credentials-json/relationship-credential.json";
  const [namePartner1, setNamePartner1] = useState("");
  const [namePartner2, setNamePartner2] = useState("");

  const [isSuccessfulValidationVisible, setIsSuccessfulValidationVisible] =
    useState(false);
  const [isUnsuccessfulValidationVisible, setIsUnsuccessfulValidationVisible] =
    useState(false);

  const isInformationCorrect = () => {
    if (namePartner1 === "" || namePartner2 === "") {
      return false;
    }
    return true;
  };

  const generateJson = async () => {
    if (!isInformationCorrect()) {
      setIsSuccessfulValidationVisible(false);
      setIsUnsuccessfulValidationVisible(true);
      return;
    }

    const prescriptionCredential = await fetch(jsonFilePath).then((response) =>
      response.json(),
    );
    prescriptionCredential.credentialSubject[0].name = namePartner1;
    prescriptionCredential.credentialSubject[1].name = namePartner2;
    onCustomCredentialChange?.(prescriptionCredential);

    setIsSuccessfulValidationVisible(true);
    setIsUnsuccessfulValidationVisible(false);
  };

  return (
    <Grid container spacing={2} margin={2}>
      <Grid item xs={11} sm={6}>
        <TextField
          required
          id="input-name-partner-1"
          label="Name"
          variant="outlined"
          fullWidth
          onChange={(e) => setNamePartner1(e.target.value)}
        />
      </Grid>
      <Grid item xs={11} sm={6}>
        <TextField
          required
          id="input-name-partner-2"
          label="Name"
          variant="outlined"
          fullWidth
          onChange={(e) => setNamePartner2(e.target.value)}
        />
      </Grid>

      <Grid
        item
        xs={11}
        sm={12}
        container
        alignItems="flex-end"
        justifyContent="right"
      >
        <Button variant="contained" color="primary" onClick={generateJson}>
          Validate Information
        </Button>
      </Grid>

      <Grid container justifyContent="center" margin={2}>
        <Grid item xs={12} sm={6}>
          {isSuccessfulValidationVisible && (
            <Alert severity="success">Successfully validated</Alert>
          )}

          {isUnsuccessfulValidationVisible && (
            <Alert severity="error">
              It was not possible to validate the information
            </Alert>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default RelationshipForm;
