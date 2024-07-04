import React, { useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { config } from "../config";
import {
  Alert,
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
import axios from "axios";
import { Contact } from "../types.types";
import {
  Attributes,
  CredentialType,
  UUID_REGEX,
  credentialTypes,
} from "../constants";
import { Controller, useForm } from "react-hook-form";
import { IAttributeObj, IAttributes } from "../constants/type";

const CredentialPage: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const [contacts, setContacts] = useState<Contact[]>([]);
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

  const handleRequestCredential = async (values: any) => {
    const schemaSaid =
      values.credential_type === CredentialType.IIW
        ? "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu"
        : "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao";
    let objAttributes = {};
    let attribute: IAttributes = {};

    values.attributes.forEach((att: IAttributeObj) => {
      if (att.key && att.value) attribute[att.key] = att.value;
    });

    if (Object.keys(attribute).length) {
      objAttributes = {
        attribute,
      };
    }

    const data = {
      schemaSaid: schemaSaid,
      aid: values.selectedContact,
      ...objAttributes,
    };

    axios
      .post(`${config.endpoint}${config.path.issueAcdcCredential}`, data)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          setIsIssueCredentialSuccess(true);
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <>
      <Typography component="h1" variant="h4" align="center">
        Issue Credential
      </Typography>
      <div>
        <form onSubmit={handleSubmit(handleRequestCredential)}>
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
            <Grid item xs={11}>
              <FormControl fullWidth>
                <InputLabel id="credential_type">Credential Type</InputLabel>
                <Controller
                  name="credential_type"
                  control={control}
                  defaultValue={credentialTypes[0]}
                  render={({ field }) => (
                    <Select
                      label="Credential Type"
                      labelId="credential_type"
                      defaultValue={credentialTypes[0]}
                      {...register(`credential_type`, {
                        required: true,
                      })}
                    >
                      {credentialTypes.map((cred, index) => (
                        <MenuItem key={index} value={cred}>
                          {cred}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={11}>
              {attributes.map((att, index) => (
                <>
                  <FormControl sx={{ width: "30%", display: "none" }}>
                    <Controller
                      control={control}
                      name="key"
                      defaultValue={att.key}
                      render={({ field }) => (
                        <TextField
                          hidden
                          defaultValue={att.key}
                          id="key-basic"
                          label="key"
                          variant="outlined"
                          {...register(`attributes.${index}.key`)}
                        />
                      )}
                    />
                  </FormControl>
                  <FormControl sx={{ width: "100%" }}>
                    <Controller
                      control={control}
                      name="value"
                      render={({ field }) => (
                        <TextField
                          id="value-basic"
                          label={att.label}
                          variant="outlined"
                          {...register(`attributes.${index}.value`)}
                        />
                      )}
                    />
                  </FormControl>
                </>
              ))}
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "right" }}>
                {errors.selectedContact && (
                  <Alert severity="error">
                    Please, select a contact from the list of connections
                  </Alert>
                )}
                {errors.credential_type && (
                  <Alert severity="error">
                    Please, select a credential type
                  </Alert>
                )}
                {isIssueCredentialSuccess && (
                  <Alert severity="success">
                    Issue credential successfully
                  </Alert>
                )}
                <Button variant="contained" color="primary" type="submit">
                  Issue Credential
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </div>
    </>
  );
};

export default CredentialPage;
