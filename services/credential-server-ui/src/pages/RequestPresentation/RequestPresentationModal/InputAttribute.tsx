import { Box } from "@mui/material";
import { InputAttributeProps } from "./RequestPresentationModal.types";
import { CredentialTypeAttributes } from "../../../const";
import { AppInput } from "../../../components/AppInput";
import { i18n } from "../../../i18n";

const InputAttribute = ({
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
