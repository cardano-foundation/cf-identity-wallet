import { Button, TextField } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { config } from "../../config";
import { GENERATE_SCHEMA_BLUEPRINT } from "../../utils/schemaBlueprint";

const GenerateSchemaForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credentialType, setCredentialType] = useState("");

  const handleGenerateSchema = async (values: any) => {
    const schema = GENERATE_SCHEMA_BLUEPRINT;

    schema.title = title;
    schema.description = description;
    schema.credentialType = credentialType;

    const response = await axios.post(
      `${config.endpoint}${config.path.generateSchema}`,
      schema,
    );
  };

  return (
    <>
      <form onSubmit={handleGenerateSchema}>
        <TextField
          id="credential-title"
          label="Title"
          variant="outlined"
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          id="credential-description"
          label="Description"
          variant="outlined"
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          id="credential-type"
          label="Type"
          variant="outlined"
          onChange={(e) => setCredentialType(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateSchema}
        >
          Request Credential
        </Button>
      </form>
    </>
  );
};

export { GenerateSchemaForm };
