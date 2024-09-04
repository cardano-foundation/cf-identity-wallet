import { Autocomplete, Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import React, { useEffect, useState } from "react";
import { Contact } from "../types";
import { Controller, useForm } from "react-hook-form";
import { config } from "../config";
import { UUID_REGEX } from "../constants";
import axios from "axios";

const RevocationPage: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
  } = useForm();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();

  useEffect(() => {
    handleGetContacts();
  }, []);

  useEffect(() => {
    handleGetContactCredentials(selectedContact?.id);
  }, [selectedContact]);

  const handleGetContacts = async () => {
    setContacts(
      (await axios.get(`${config.endpoint}${config.path.contacts}`)).data
        .data,
    );
  };

  const handleGetContactCredentials = async (contactId?: string) => {
    if (!contactId) {
      return setCredentials([]);
    }
    const credentialsData = (await axios.get(`${config.endpoint}${config.path.contactCredentials}`, { params: { contactId }})).data.data;
    if (credentialsData.length) {
      setCredentials(
        credentialsData
      );
    } else {
      setCredentials([])
    }
  };

  const handleRevokeCredential = async (values: any) => {
    await axios.post(`${config.endpoint}${config.path.revokeCredential}`, {
      credentialId: values.selectedCredential,
      holder: values.selectedContact
    });
    await handleGetContactCredentials(values.selectedContact);
  };

  return (
    <>
      <Typography component="h1" variant="h4" align="center">
        Revoke Credential
      </Typography>
      <div>
        <form onSubmit={handleSubmit(handleRevokeCredential)}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={10}>
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
                    getOptionLabel={(option) => UUID_REGEX.test(option.alias) ? option.id : `${option.alias} (${option.id})` }
                    options={contacts || []}
                    renderInput={(params) => <TextField {...params} label="Search by connection name or ID" />}
                    onChange={(_event, data) => { field.onChange(data?.id || null); setSelectedContact(data) }}
                  />
                )}
              />
            </FormControl>
            </Grid>
            <Grid item xs={1}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleGetContacts}
                style={{ height: "100%" }}
              ></Button>
            </Grid>
            <Grid item xs={10}>
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
                        <MenuItem key={index} value={credential.sad.d}>
                          {credential.schema.title} ({credential.sad.d})
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={1}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleGetContacts}
                style={{ height: "100%" }}
              ></Button>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "right" }}>
                <Button variant="contained" color="primary" type="submit">
                  Revoke Credential
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </div>
    </>
  );
};

export { RevocationPage };