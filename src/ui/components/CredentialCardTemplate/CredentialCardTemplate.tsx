import { IpexCommunicationService } from "../../../core/agent/services/ipexCommunicationService";
import { KeriCardTemplate, RareEvoCardTemplate } from "./components";
import { CredentialCardTemplateProps } from "./CredentialCardTemplate.types";

const CredentialCardTemplate = ({
  name = "default",
  ...props
}: CredentialCardTemplateProps) => {
  if (
    props.cardData.schema === IpexCommunicationService.SCHEMA_SAID_RARE_EVO_DEMO
  ) {
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
