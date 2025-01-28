import { KeriCardTemplate } from "./components";
import { CredentialCardTemplateProps } from "./CredentialCardTemplate.types";

const CredentialCardTemplate = ({
  name = "default",
  ...props
}: CredentialCardTemplateProps) => {
  return (
    <KeriCardTemplate
      name={name}
      {...props}
    />
  );
};

export { CredentialCardTemplate };
