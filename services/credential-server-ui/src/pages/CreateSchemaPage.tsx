import React, { useState } from "react";
import {
  Button,
  TextField,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Box,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { config } from "../config";
import {
  GENERATE_SCHEMA_BLUEPRINT,
  ATTRIBUTES_BLOCK,
  EDGES_BLOCK,
  RULES_BLOCK,
} from "../utils/schemaBlueprint";
import CreateSchemaField from "../components/createSchema/CreateSchemaField";
import { SchemaField } from "../constants/type";

const CreateSchemaPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credentialType, setCredentialType] = useState("");
  const [edges, setEdges] = useState<SchemaField[]>([]);
  const [rules, setRules] = useState<SchemaField[]>([]);
  const [attributes, setAttributes] = useState<SchemaField[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSchema, setGeneratedSchema] = useState<any>(null);

  const handleGenerateSchema = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSuccess(false);
    setError(null);

    if (!title || !description || !credentialType) {
      setError("Title, Description, and Type fields must be filled.");
      return;
    }

    const allFieldNames = [...attributes, ...edges, ...rules].map(
      (field) => field.name
    );
    const uniqueFieldNames = new Set(allFieldNames);

    if (allFieldNames.length !== uniqueFieldNames.size) {
      setError("All extra field names must be unique.");
      return;
    }

    const schema: any = JSON.parse(JSON.stringify(GENERATE_SCHEMA_BLUEPRINT));

    schema.title = title;
    schema.description = description;
    schema.credentialType = credentialType;

    const addFieldsToSchema = (
      fields: SchemaField[],
      schemaProperties: any,
      requiredFields: string[]
    ) => {
      fields.forEach((field) => {
        if (field.name && field.description) {
          const fieldSchema: any = {
            description: field.description,
            type: field.type,
          };

          if (field.customizable) {
            fieldSchema.customizable = field.customizable;
            if (
              field.default !== undefined &&
              field.default !== "" &&
              !Number.isNaN(field.default)
            ) {
              fieldSchema.default = field.default;
            }
          }

          if (field.type === "object" && field.fields) {
            fieldSchema.properties = {};
            fieldSchema.required = [];
            addFieldsToSchema(
              field.fields,
              fieldSchema.properties,
              fieldSchema.required
            );
          }

          schemaProperties[field.name] = fieldSchema;
          requiredFields.push(field.name);
        }
      });
    };

    // Process attributes
    if (attributes.length > 0) {
      const attributesBlock = JSON.parse(
        JSON.stringify(ATTRIBUTES_BLOCK.oneOf[1])
      );
      addFieldsToSchema(
        attributes,
        attributesBlock.properties,
        attributesBlock.required
      );
      schema.properties.a = {
        oneOf: [
          { description: "Attributes block SAID", type: "string" },
          attributesBlock,
        ],
      };
      schema.required.push("a");
    }

    // Process edges
    if (edges.length > 0) {
      const edgesBlock = JSON.parse(JSON.stringify(EDGES_BLOCK.oneOf[1]));
      addFieldsToSchema(edges, edgesBlock.properties, edgesBlock.required);
      schema.properties.e = {
        oneOf: [
          { description: "Edges block SAID", type: "string" },
          edgesBlock,
        ],
      };
      schema.required.push("e");
    }

    // Process rules
    if (rules.length > 0) {
      const rulesBlock = JSON.parse(JSON.stringify(RULES_BLOCK.oneOf[1]));
      addFieldsToSchema(rules, rulesBlock.properties, rulesBlock.required);
      schema.properties.r = {
        oneOf: [
          { description: "Rules block SAID", type: "string" },
          rulesBlock,
        ],
      };
      schema.required.push("r");
    }

    setGeneratedSchema(schema);
  };

  const saveSchema = async () => {
    try {
      const response = await axios.post(
        `${config.endpoint}${config.path.saveSchema}`,
        generatedSchema
      );
      console.log("Schema saved successfully:", response.data);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error saving schema:", error);
      setError("Error saving schema");
    }
  };

  const handleAddField = (section: string) => {
    const newField: SchemaField = {
      name: "",
      description: "",
      type: "string",
      customizable: false,
      fields: [],
    };

    if (section === "edges") {
      setEdges((prevEdges) => [...prevEdges, newField]);
      console.log("Edges:", edges);
    } else if (section === "rules") {
      setRules((prevRules) => [...prevRules, newField]);
    } else if (section === "attributes") {
      setAttributes((prevAttributes) => [...prevAttributes, newField]);
    }
  };

  const handleFieldChange = (
    section: string,
    index: number,
    field: "name" | "description" | "type" | "default" | "fields",
    value: any
  ) => {
    const updateFields = (fields: SchemaField[]) => {
      const newFields = [...fields];
      if (field === "fields") {
        newFields[index].fields = value as SchemaField[];
      } else {
        newFields[index][field] = value as any;
      }
      return newFields;
    };

    if (section === "edges") {
      setEdges(updateFields(edges));
    } else if (section === "rules") {
      setRules(updateFields(rules));
    } else if (section === "attributes") {
      setAttributes(updateFields(attributes));
    }
  };

  const handleCustomizableChange = (
    section: string,
    index: number,
    value: boolean
  ) => {
    const updateFields = (fields: SchemaField[]) => {
      const newFields = [...fields];
      newFields[index].customizable = value;
      return newFields;
    };

    if (section === "edges") {
      setEdges(updateFields(edges));
    } else if (section === "rules") {
      setRules(updateFields(rules));
    } else if (section === "attributes") {
      setAttributes(updateFields(attributes));
    }
  };

  const removeField = (section: string, index: number) => {
    const updateFields = (fields: SchemaField[]) =>
      fields.filter((_, i) => i !== index);

    if (section === "edges") {
      setEdges(updateFields(edges));
    } else if (section === "rules") {
      setRules(updateFields(rules));
    } else if (section === "attributes") {
      setAttributes(updateFields(attributes));
    }
  };

  return (
    <>
      <Typography
        component="h1"
        variant="h4"
        align="center"
      >
        Generate Schema
      </Typography>
      <Box>
        <form onSubmit={handleGenerateSchema}>
          <Grid
            container
            spacing={2}
            justifyContent="center"
          >
            <Grid
              item
              xs={10}
            >
              <TextField
                id="credential-title"
                label="Title"
                variant="outlined"
                fullWidth
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={10}
            >
              <TextField
                id="credential-description"
                label="Description"
                variant="outlined"
                fullWidth
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={10}
            >
              <TextField
                id="credential-type"
                label="Type"
                variant="outlined"
                fullWidth
                onChange={(e) => setCredentialType(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
            >
              <Divider style={{ margin: "20px 0" }} />
            </Grid>
            <Grid
              item
              xs={12}
            >
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Extra Fields</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <h4>Attributes</h4>
                      <Tooltip title="A top-level field map within an ACDC that provides a property of an entity that is inherent or assigned to the entity.">
                        <IconButton>
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                    <IconButton
                      onClick={() => handleAddField("attributes")}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </div>
                  <CreateSchemaField
                    section="attributes"
                    fields={attributes}
                    handleFieldChange={handleFieldChange}
                    handleCustomizableChange={handleCustomizableChange}
                    handleAddField={handleAddField}
                    removeField={removeField}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <h4>Edges</h4>
                      <Tooltip title="A top-level field map within an ACDC that provides edges that connect to other ACDCs, forming a labeled property graph (LPG).">
                        <IconButton>
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                    <IconButton
                      onClick={() => handleAddField("edges")}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </div>
                  <CreateSchemaField
                    section="edges"
                    fields={edges}
                    handleFieldChange={handleFieldChange}
                    handleCustomizableChange={handleCustomizableChange}
                    handleAddField={handleAddField}
                    removeField={removeField}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <h4>Rules</h4>
                      <Tooltip title="A top-level field map within an ACDC that provides a legal language as a Ricardian Contract, which is both human and machine-readable and referenceable by a cryptographic digest.">
                        <IconButton>
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                    <IconButton
                      onClick={() => handleAddField("rules")}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </div>
                  <CreateSchemaField
                    section="rules"
                    fields={rules}
                    handleFieldChange={handleFieldChange}
                    handleCustomizableChange={handleCustomizableChange}
                    handleAddField={handleAddField}
                    removeField={removeField}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>
            <Grid
              item
              xs={12}
            >
              <Box sx={{ display: "flex", justifyContent: "right" }}>
                {error && (
                  <Alert
                    severity="error"
                    sx={{ marginRight: 2 }}
                  >
                    {error}
                  </Alert>
                )}
                {isSuccess && (
                  <Alert
                    severity="success"
                    sx={{ marginRight: 2 }}
                  >
                    Schema create successfully
                  </Alert>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Create Schema
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
        {generatedSchema && (
          <Grid
            item
            xs={12}
          >
            <Box sx={{ marginTop: 4 }}>
              <Typography variant="h6">Create Schema</Typography>
              <pre
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              >
                {JSON.stringify(generatedSchema, null, 2)}
              </pre>
              <Box
                sx={{ display: "flex", justifyContent: "right", marginTop: 2 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={saveSchema}
                >
                  Save Schema
                </Button>
              </Box>
            </Box>
          </Grid>
        )}
      </Box>
    </>
  );
};

export { CreateSchemaPage };
