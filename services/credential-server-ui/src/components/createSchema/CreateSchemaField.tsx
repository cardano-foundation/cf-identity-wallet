import React from "react";
import {
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { SchemaField } from "../../constants/type";

interface FieldSectionProps {
  section: string;
  fields: SchemaField[];
  handleFieldChange: (
    section: string,
    index: number,
    field: "name" | "description" | "type" | "default" | "fields",
    value: any
  ) => void;
  handleCustomizableChange: (
    section: string,
    index: number,
    value: boolean
  ) => void;
  handleAddField: (section: string) => void;
  removeField: (section: string, index: number) => void;
}

const CreateSchemaField: React.FC<FieldSectionProps> = ({
  section,
  fields,
  handleFieldChange,
  handleCustomizableChange,
  handleAddField,
  removeField,
}) => {
  const onFieldChange = (
    section: string,
    index: number,
    field: "name" | "description" | "type" | "default" | "fields",
    value: any
  ) => {
    if (field === "type") {
      handleCustomizableChange(section, index, false);
      handleFieldChange(section, index, "default", "");
    }
    handleFieldChange(section, index, field, value);
  };

  const onCustomizableChange = (
    section: string,
    index: number,
    value: boolean
  ) => {
    if (!value) {
      handleFieldChange(section, index, "default", "");
    }
    handleCustomizableChange(section, index, value);
  };

  const handleAddNestedField = (parentIndex: number) => {
    const newField: SchemaField = {
      name: "",
      description: "",
      type: "string",
      customizable: false,
      fields: [],
    };
    const updatedFields = [...fields];
    if (!updatedFields[parentIndex].fields) {
      updatedFields[parentIndex].fields = [];
    }
    updatedFields[parentIndex].fields!.push(newField);
    handleFieldChange(
      section,
      parentIndex,
      "fields",
      updatedFields[parentIndex].fields
    );
  };

  const handleRemoveField = (section: string, index: number) => {
    removeField(section, index);
  };

  return (
    <div>
      {fields.map((field, index) => (
        <div
          key={index}
          style={{ marginBottom: "30px" }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "10px",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: "10px", flex: 1 }}>
              <TextField
                label="Name"
                variant="outlined"
                value={field.name}
                onChange={(e) =>
                  onFieldChange(section, index, "name", e.target.value)
                }
              />
              <Select
                label="Type"
                value={field.type}
                onChange={(e) =>
                  onFieldChange(
                    section,
                    index,
                    "type",
                    e.target.value as string
                  )
                }
                displayEmpty
              >
                <MenuItem value="string">String</MenuItem>
                <MenuItem value="integer">Integer</MenuItem>
                <MenuItem value="object">Object</MenuItem>
              </Select>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {field.type !== "object" && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.customizable}
                      onChange={(e) =>
                        onCustomizableChange(section, index, e.target.checked)
                      }
                    />
                  }
                  label="Customizable"
                />
              )}
              {field.type === "object" && (
                <IconButton
                  style={{ marginLeft: "10px" }}
                  onClick={() => handleAddNestedField(index)}
                >
                  <AddIcon />
                </IconButton>
              )}
              <IconButton
                onClick={() => handleRemoveField(section, index)}
                style={{ marginLeft: "10px" }}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              value={field.description}
              onChange={(e) =>
                onFieldChange(section, index, "description", e.target.value)
              }
            />
          </div>
          {field.customizable && field.type !== "object" && (
            <div style={{ marginBottom: "10px" }}>
              <TextField
                fullWidth
                label="Default"
                variant="outlined"
                type={field.type === "integer" ? "number" : "text"}
                value={field.default || ""}
                onChange={(e) =>
                  onFieldChange(
                    section,
                    index,
                    "default",
                    field.type === "integer"
                      ? parseInt(e.target.value)
                      : e.target.value
                  )
                }
              />
            </div>
          )}
          {field.fields && field.fields.length > 0 && (
            <div style={{ marginLeft: "20px" }}>
              <CreateSchemaField
                section={section}
                fields={field.fields}
                handleFieldChange={(
                  nestedSection,
                  nestedIndex,
                  nestedField,
                  nestedValue
                ) => {
                  const updatedFields = [...fields];
                  updatedFields[index].fields![nestedIndex][nestedField] =
                    nestedValue;
                  handleFieldChange(
                    section,
                    index,
                    "fields",
                    updatedFields[index].fields
                  );
                }}
                handleCustomizableChange={(
                  nestedSection,
                  nestedIndex,
                  nestedValue
                ) => {
                  const updatedFields = [...fields];
                  updatedFields[index].fields![nestedIndex].customizable =
                    nestedValue;
                  handleFieldChange(
                    section,
                    index,
                    "fields",
                    updatedFields[index].fields
                  );
                }}
                handleAddField={handleAddField}
                removeField={(nestedSection, nestedIndex) => {
                  const updatedFields = [...fields];
                  updatedFields[index].fields = updatedFields[
                    index
                  ].fields!.filter((_, i) => i !== nestedIndex);
                  handleFieldChange(
                    section,
                    index,
                    "fields",
                    updatedFields[index].fields
                  );
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CreateSchemaField;
