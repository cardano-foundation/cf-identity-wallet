import { config } from "../config";
import { CredentialIssueRequest } from "./credential.types";
import { httpInstance } from "./http";

const CredentialService = {
  revoke: async (contactId: string, credId: string) => {
    return httpInstance.post(config.path.revokeCredential, {
      credentialId: credId,
      holder: contactId,
    });
  },
  issue: async (data: CredentialIssueRequest) => {
    return httpInstance.post(
      `${config.endpoint}${config.path.issueAcdcCredential}`,
      data
    );
  },
};

export { CredentialService };
