import { IpexCommunicationService } from "../../../core/agent/services";
import { KeriCardTemplate } from "./components";
import { RomeCardTemplate } from "./components/RomeCardTemplate";
import { CredentialCardTemplateProps } from "./CredentialCardTemplate.types";

const CredentialCardTemplate = ({
  name = "default",
  ...props
}: CredentialCardTemplateProps) => {
  if (props.cardData.schema == IpexCommunicationService.SCHEMA_SAID_ROME_DEMO) {
    return (
      <RomeCardTemplate
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
