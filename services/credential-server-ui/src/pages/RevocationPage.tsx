import { Autocomplete, Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import React, { useEffect, useState } from "react";
import { Contact } from "../types.types";
import { Controller, useForm } from "react-hook-form";
import { config } from "../config";
import { Attributes, CredentialType, SCHEMA_SAID, UUID_REGEX } from "../constants";
import axios from "axios";
import { IAttributes, IAttributeObj } from "../constants/type";

const RevocationPage: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [attributes, setAttributes] = useState<IAttributeObj[]>([]);
  const [isIssueCredentialSuccess, setIsIssueCredentialSuccess] =
    useState(false);
  const [selectedContact, setSelectedContact] = useState();

  useEffect(() => {
    handleGetContacts();
  }, []);

  useEffect(() => {
    const type = watch("credential_type") as CredentialType;
    if (!type) return;

    const newAttributes = Attributes[type];
    newAttributes.forEach((att, index) => {
      setValue(`attributes.${index}.key`, att.key);
      setValue(`attributes.${index}.label`, att.label);
    });

    setAttributes(newAttributes);
  }, [watch("credential_type")]);

  useEffect(() => {
    if (selectedContact) {
      handleGetContacCredentials((selectedContact as any).id);
    } else {
      setCredentials([]);
    }
  }, [selectedContact]);

  const handleGetContacts = async () => {
    try {
      setContacts(
        (await axios.get(`${config.endpoint}${config.path.contacts}`)).data
          .data,
      );
    } catch (e) {
      console.log(e);
    }
  };

  const handleGetContacCredentials = async (contactId: string) => {
    try {
      const credentialsData = (await axios.get(`${config.endpoint}${config.path.contactCredentials}`, { params: { contactId }})).data.data;
      if (credentialsData.length) {
        setCredentials(
          credentialsData
        );
      } else {
        setCredentials([])
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleRevokeCredential = async (values: any) => {
    await axios.post(`${config.endpoint}${config.path.revokeCredential}`, {
      credentialId: values.selectedCredential,
      holder: values.selectedContact
    });
    await handleGetContacCredentials(values.selectedContact);
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
                          {credential.sad.d}
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

export default RevocationPage;