import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { config } from "../config";
import { Contact } from "../types.types";
import {
  Attributes,
  CredentialType,
  SCHEMA_SAID,
  UUID_REGEX,
  credentialTypes,
} from "../constants";
import { IAttributeObj, IAttributes } from "../constants/type";

function RequestCredential() {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [isRequestCredentialSuccess, setIsRequestCredentialSuccess] =
    useState(false);
  const [attributes, setAttributes] = useState<IAttributeObj[]>([]);

  useEffect(() => {
    const type = watch("credential_type") as CredentialType;
    if (!type) return;

    const newAttributes = Attributes[type];

    if (!newAttributes) return;
    newAttributes.forEach((att, index) => {
      setValue(`attributes.${index}.key`, att.key);
      setValue(`attributes.${index}.label`, att.label);
    });

    setAttributes(newAttributes);
  }, [watch("credential_type")]);

  useEffect(() => {
    handleGetContacts();
  }, []);

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
    let attributes: IAttributes = {};

    values.attributes.forEach((att: IAttributeObj) => {
      if (att.key && att.value) attributes[att.key] = att.value;
    });

    if (Object.keys(attributes).length) {
      objAttributes = {
        attributes,
      };
    }

    const data = {
      schemaSaid: schemaSaid,
      aid: values.selectedContact,
      ...objAttributes,
    };

    axios
      .post(`${config.endpoint}${config.path.requestDisclosure}`, data)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          setIsRequestCredentialSuccess(true);
        }
      })
      .catch((error) => console.log(error));
  };
  return (
    <Box>
      <Typography component="h1" variant="h4" align="center">
        Request Credential
      </Typography>
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
            <FormLabel>Attributes</FormLabel>
            {attributes.map((att, index) => (
              <Stack
                key={index}
                gap={2}
                direction={"row"}
                width={"100%"}
                mt={1}
              >
                <FormControl sx={{ width: "30%" }}>
                  <Controller
                    control={control}
                    name="key"
                    render={({ field }) => (
                      <TextField
                        id="key-basic"
                        label="key"
                        variant="outlined"
                        InputProps={{
                          readOnly: true,
                        }}
                        {...register(`attributes.${index}.key`)}
                      />
                    )}
                  />
                </FormControl>
                <FormControl sx={{ width: "70%" }}>
                  <Controller
                    control={control}
                    name="value"
                    render={({ field }) => (
                      <TextField
                        id="value-basic"
                        label="value"
                        variant="outlined"
                        {...register(`attributes.${index}.value`)}
                      />
                    )}
                  />
                </FormControl>
              </Stack>
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
                <Alert severity="error">Please, select a credential type</Alert>
              )}
              {isRequestCredentialSuccess && (
                <Alert severity="success">
                  Request credential successfully sent
                </Alert>
              )}
              <Button variant="contained" color="primary" type="submit">
                Request Credential
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export { RequestCredential };
