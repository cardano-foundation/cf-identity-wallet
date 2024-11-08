import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
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
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { config } from "../config";
import { Contact } from "../types";
import { CredentialType, UUID_REGEX } from "../constants";
import {
  IAttributeObj,
  IAttributes,
  SchemaShortDetails,
} from "../constants/type";

interface CredentialFormProps {
  onSubmit: (values: any) => Promise<void>;
  submitButtonText: string;
  successMessage: string;
  apiPath: string;
}

const CredentialForm: React.FC<CredentialFormProps> = ({
  onSubmit,
  submitButtonText,
  successMessage,
  apiPath,
}) => {
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [schemaList, setSchemaList] = useState<SchemaShortDetails[]>([]);
  const [defaultCredentialType, setDefaultCredentialType] =
    useState<string>("");
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    handleGetContacts();
    handleGetSchemaList();
  }, []);

  useEffect(() => {
    const type = watch("credential_type") as CredentialType;
    if (!type) return;

    handleGetSchemaDetails(type);
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

  const handleGetSchemaList = async () => {
    try {
      const response = await axios.get(
        `${config.endpoint}${config.path.schemaList}`
      );
      const schemas: SchemaShortDetails[] = response.data;
      setSchemaList(schemas);
      if (schemas.length > 0) {
        setDefaultCredentialType(schemas[0].title);
        setValue("credential_type", schemas[0].title);
        setSelectedSchemaId(schemas[0].$id);
      } else {
        setDefaultCredentialType("");
      }
    } catch (error) {
      console.log(`Error fetching schema list: ${error}`);
    }
  };

  const handleGetSchemaDetails = async (schemaTitle: string) => {
    const schema = schemaList.find((s) => s.title === schemaTitle);
    if (!schema) return;

    try {
      const response = await axios.get(
        `${config.endpoint}${config.path.schemaCustomFields}`,
        {
          params: { id: schema.$id },
        }
      );
      const { customizableKeys } = response.data;

      const newAttributes = Object.keys(customizableKeys).map((key: string) => {
        const value = customizableKeys[key];
        return {
          key,
          label: `${value.name} - ${value.description}`,
          type: value.type || "string", // Default to 'string' if type is not provided
          defaultValue: value.default || "", // Add default value if provided
        };
      });

      newAttributes.forEach((att: IAttributeObj, index: number) => {
        setValue(`attributes.${index}.key`, att.key);
        setValue(`attributes.${index}.label`, att.label);
        setValue(`attributes.${index}.value`, att.defaultValue);
      });

      setAttributes(newAttributes);
      setSelectedSchemaId(schema.$id);
    } catch (error) {
      console.log(`Error fetching schema details: ${error}`);
    }
  };

  const handleFormSubmit = async (values: any) => {
    setIsSuccess(false);
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
      schemaSaid: selectedSchemaId,
      aid: values.selectedContact,
      ...objAttributes,
    };

    try {
      await onSubmit(data);
      setIsSuccess(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
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
                    {...register(`selectedContact`, { required: true })}
                    getOptionLabel={(option) =>
                      UUID_REGEX.test(option.alias)
                        ? option.id
                        : `${option.alias} (${option.id})`
                    }
                    options={contacts || []}
                    value={selectedContact}
                    onChange={(_event, data) => {
                      field.onChange(data?.id || null);
                      setSelectedContact(data);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search by connection name or ID"
                      />
                    )}
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
            xs={11}
          >
            <FormControl fullWidth>
              <InputLabel id="credential_type">Credential Type</InputLabel>
              <Controller
                name="credential_type"
                control={control}
                defaultValue={defaultCredentialType}
                render={({ field }) => (
                  <Select
                    label="Credential Type"
                    labelId="credential_type"
                    {...register(`credential_type`, { required: true })}
                    value={field.value || ""}
                    onChange={(event) => {
                      field.onChange(event);
                      setSelectedSchemaId(
                        schemaList.find((s) => s.title === event.target.value)
                          ?.$id || null
                      );
                    }}
                  >
                    {schemaList.map((schema, index) => (
                      <MenuItem
                        key={index}
                        value={schema.title}
                      >
                        {schema.title}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>
          <Grid
            item
            xs={11}
          >
            {attributes.map((att, index) => (
              <FormControl
                key={index}
                sx={{ width: "100%", mb: 2 }}
              >
                <Controller
                  control={control}
                  name={`attributes.${index}.value`}
                  render={({ field }) => {
                    switch (att.type) {
                      case "integer":
                        return (
                          <TextField
                            {...field}
                            label={att.label}
                            type="number"
                            variant="outlined"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        );
                      case "string":
                      default:
                        return (
                          <TextField
                            {...field}
                            label={att.label}
                            type="text"
                            variant="outlined"
                          />
                        );
                    }
                  }}
                />
              </FormControl>
            ))}
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
              {errors.credential_type && (
                <Alert severity="error">Please, select a credential type</Alert>
              )}
              {isSuccess && <Alert severity="success">{successMessage}</Alert>}
              <Button
                variant="contained"
                color="primary"
                type="submit"
              >
                {submitButtonText}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export { CredentialForm };
