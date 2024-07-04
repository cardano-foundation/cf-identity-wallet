import React, { useState } from "react";
import {
  Alert,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";

interface PrescriptionFormProps {
  onCustomCredentialChange?: (newJson: string) => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  onCustomCredentialChange,
}) => {
  const jsonFilePath = "credentials-json/prescription-credential.json";
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [expirationDate, setExpirationDate] = React.useState<Dayjs | null>(
    null,
  );

  const [isSuccessfulValidationVisible, setIsSuccessfulValidationVisible] =
    useState(false);
  const [isUnsuccessfulValidationVisible, setIsUnsuccessfulValidationVisible] =
    useState(false);

  const isInformationCorrect = () => {
    if (type === "" || name === "" || expirationDate === null) {
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
    prescriptionCredential.credentialSubject.prescription.type = type;
    prescriptionCredential.credentialSubject.prescription.name = name;
    prescriptionCredential.expirationDate = expirationDate?.toISOString();
    onCustomCredentialChange?.(prescriptionCredential);

    setIsSuccessfulValidationVisible(true);
    setIsUnsuccessfulValidationVisible(false);
  };

  return (
    <Grid container spacing={2} margin={2}>
      <Grid item xs={11} sm={6}>
        <FormControl fullWidth>
          <InputLabel id="input-label-type">Class of medicine</InputLabel>
          <Select
            labelId="select-label-type"
            id="id-select-type"
            value={type}
            label="Class of medicine"
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value={"Antipyretics"}>Antipyretics</MenuItem>
            <MenuItem value={"Analgesics"}>Analgesics</MenuItem>
            <MenuItem value={"Antibiotics"}>Antibiotics</MenuItem>
            <MenuItem value={"Antiseptics"}>Antiseptics</MenuItem>
            <MenuItem value={"Mood stabilizers"}>Mood stabilizers</MenuItem>
            <MenuItem value={"Tranquilizers"}>Tranquilizers</MenuItem>
            <MenuItem value={"Stimulants"}>Stimulants</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={11} sm={6}>
        <TextField
          required
          id="input-name"
          label="Name"
          variant="outlined"
          fullWidth
          onChange={(e) => setName(e.target.value)}
        />
      </Grid>

      <Grid item xs={11} sm={6}>
        <DatePicker
          label={"Expiration Date"}
          value={expirationDate}
          onChange={(newExpirationDate) => setExpirationDate(newExpirationDate)}
        />
      </Grid>

      <Grid
        item
        xs={11}
        sm={6}
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

export default PrescriptionForm;
