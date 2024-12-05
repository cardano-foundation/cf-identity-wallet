import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import React, { useEffect, useState } from "react";
import { Contact } from "../types";
import { Controller, useForm } from "react-hook-form";
import { config } from "../config";
import { UUID_REGEX } from "../constants";
import axios from "axios";
import Toast from "../components/Toast";

const RevocationPage: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [isRevokeCredentialSuccess, setIsRevokeCredentialSuccess] =
    useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("error");

  useEffect(() => {
    handleGetContacts();
  }, []);

  useEffect(() => {
    handleGetContactCredentials(selectedContact?.id);
  }, [selectedContact]);

  const handleGetContacts = async () => {
    try {
      const response = await axios.get(
        `${config.endpoint}${config.path.contacts}`
      );
      setContacts(response.data.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setToastMessage("Error fetching contacts");
      setToastSeverity("error");
      setToastVisible(true);
    }
  };

  const handleGetContactCredentials = async (contactId?: string) => {
    if (!contactId) {
      return setCredentials([]);
    }
    try {
      const response = await axios.get(
        `${config.endpoint}${config.path.credentials}?contactId=${contactId}`
      );
      setCredentials(response.data.data);
    } catch (error) {
      console.error("Error fetching credentials:", error);
      setToastMessage("Error fetching credentials");
      setToastSeverity("error");
      setToastVisible(true);
    }
  };

  const handleRevokeCredential = async (values: any) => {
    setIsRevokeCredentialSuccess(false);
    const response = await axios.post(
      `${config.endpoint}${config.path.revokeCredential}`,
      {
        credentialId: values.selectedCredential,
        holder: values.selectedContact,
      }
    );
    if (response.status === 200) {
      setIsRevokeCredentialSuccess(true);
    }
    await handleGetContactCredentials(values.selectedContact);
  };

  const handleCloseToast = () => {
    setToastVisible(false);
  };

  return (
    <>
      <Typography
        component="h1"
        variant="h4"
        align="center"
      >
        Revoke Credential
      </Typography>
      <div>
        <form onSubmit={handleSubmit(handleRevokeCredential)}>
          <Grid
            container
            spacing={2}
            justifyContent="center"
          >
            <Grid
              item
              xs={10}
            >
              <FormControl fullWidth>
                <Controller
                  name="selectedContact"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      {...register(`selectedContact`, {
                        required: true,
                      })}
                      getOptionLabel={(option) =>
                        UUID_REGEX.test(option.alias)
                          ? option.id
                          : `${option.alias} (${option.id})`
                      }
                      options={contacts || []}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search by connection name or ID"
                        />
                      )}
                      onChange={(_event, data) => {
                        field.onChange(data?.id || null);
                        setSelectedContact(data);
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid
              item
              xs={1}
            >
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleGetContacts}
                style={{ height: "100%" }}
              ></Button>
            </Grid>
            <Grid
              item
              xs={10}
            >
              <FormControl fullWidth>
                <InputLabel id="selectedCredential">
                  Asociated credentials
                </InputLabel>
                <Controller
                  name="selectedCredential"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="selectedCredential"
                      label="Asociated credentials"
                      {...field}
                      {...register(`selectedCredential`, {
                        required: true,
                      })}
                    >
                      {credentials.map((credential: any, index) => (
                        <MenuItem
                          key={index}
                          value={credential.sad.d}
                        >
                          {credential.schema.title} ({credential.sad.d})
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid
              item
              xs={1}
            >
              <Button
                startIcon={<RefreshIcon />}
                onClick={() => handleGetContactCredentials(selectedContact?.id)}
                style={{ height: "100%" }}
              ></Button>
            </Grid>
            <Grid
              item
              xs={12}
            >
              <Box sx={{ display: "flex", justifyContent: "right" }}>
                {errors.selectedContact && (
                  <Alert severity="error">
                    Please, select a contact from the list of connections
                  </Alert>
                )}
                {errors.selectedCredential && (
                  <Alert severity="error">Please, select a credential</Alert>
                )}
                {isRevokeCredentialSuccess && (
                  <Alert severity="success">
                    Revoke credential successfully sent
                  </Alert>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Revoke Credential
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </div>
      <Toast
        message={toastMessage}
        severity={toastSeverity}
        visible={toastVisible}
        onClose={handleCloseToast}
      />
    </>
  );
};

export { RevocationPage };
