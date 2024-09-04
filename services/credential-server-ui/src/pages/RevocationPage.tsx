import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from "@mui/material";
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

  const handleGetContacCredentials = async () => {
    try {
      setCredentials(
        (await axios.get(`${config.endpoint}${config.path.contactCredentials}`), { params: { contactId : selec}}).data
          .data,
      );
    } catch (e) {
      console.log(e);
    }
  };

  const handleRevokeCredential = async (values: any) => {
    
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
                <InputLabel id="selectedContact">
                  Established Connections
                </InputLabel>

                <Controller
                  name="selectedContact"
                  control={control}
                  render={({ field }) => (
                    <Select
                      labelId="selectedContact"
                      label="Established Connections"
                      {...field}
                      {...register(`selectedContact`, {
                        required: true,
                      })}
                    >
                      {contacts.map((contact: any, index) => (
                        <MenuItem key={index} value={contact.id}>
                          {UUID_REGEX.test(contact.alias)
                            ? contact.id
                            : `${contact.alias} (${contact.id})`}
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
            <Grid item xs={10}>
              <FormControl fullWidth>
                <InputLabel id="selectedCrential">
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
                        <MenuItem key={index} value={credential.id}>
                          {credential.id}
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