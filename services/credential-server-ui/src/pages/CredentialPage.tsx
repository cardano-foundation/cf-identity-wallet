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
  Autocomplete
} from "@mui/material";
import axios from "axios";
import { Contact } from "../types.types";
import {
  Attributes,
  CredentialType,
  SCHEMA_SAID,
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
        (await axios.get(`${config.endpoint}${config.path.contacts}`)).data.data
      );
    } catch (e) {
      console.log(e);
    }
  };

  const handleRequestCredential = async (values: any) => {
    const schemaSaid = SCHEMA_SAID[values.credential_type as CredentialType];
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
                      onChange={(_event, data) => field.onChange(data?.id || null)}
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
