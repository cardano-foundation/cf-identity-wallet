import { KeriCardTemplate, RareEvoCardTemplate } from "./components";
import { CredentialCardTemplateProps } from "./CredentialCardTemplate.types";

const CredentialCardTemplate = ({
  name = "default",
  ...props
}: CredentialCardTemplateProps) => {
  if (props.cardData.credentialType === "Rare EVO 2024 Attendee") {
    return (
      <RareEvoCardTemplate
        name={name}
        {...props}
      />
    );
  }

  return (
    <KeriCardTemplate
      name={name}
      {...props}
    />
  );
};

export { CredentialCardTemplate };
