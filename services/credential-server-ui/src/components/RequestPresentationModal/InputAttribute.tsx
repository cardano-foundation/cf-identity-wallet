import { Box } from "@mui/material";
import { InputAttributeProps } from "./RequestPresentationModal.types";
import { CredentialTypeAttributes } from "../../const";
import { AppInput } from "../AppInput";
import { i18n } from "../../i18n";
const InputAttribute = ({
  attributeOptional,
  credentialType,
  value,
  setValue,
}: InputAttributeProps) => {
  if (!credentialType) return null;

  const attributes = CredentialTypeAttributes[credentialType];

  return (
    <Box className="input-attribute">
      {attributes.map((attribute) => {
        return (
          <AppInput
            key={attribute.key}
            fullWidth
            label={i18n.t(
              `pages.credentialDetails.issueCredential.inputAttribute.label.${attribute.label.toLowerCase()}`
            )}
            optional={attributeOptional}
            value={value[attribute.key] || ""}
            onChange={(e) => setValue(attribute.key, e.target.value)}
            placeholder={i18n.t(
              "pages.credentialDetails.issueCredential.inputAttribute.placeholder"
            )}
          />
        );
      })}
    </Box>
  );
};

export { InputAttribute };
