import { config } from "../config";
import { httpInstance } from "./http";

const CredentialService = {
  revoke: async (contactId: string, credId: string) => {
    return httpInstance.post(config.path.revokeCredential, {
      credentialId: credId,
      holder: contactId,
    });
  },
};

export { CredentialService };
