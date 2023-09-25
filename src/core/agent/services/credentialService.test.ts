import { Agent } from "@aries-framework/core";
import { CredentialService } from "./credentialService";

const agent = jest.mocked({
  credentials: {
    acceptOffer: jest.fn(),
  },
  events: {
    on: jest.fn(),
  },
});
const credentialService = new CredentialService(agent as any as Agent);

// Callbacks need to be tested at an integration/e2e test level
describe("Credential service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("can accept a credential", async () => {
    const credentialRecordId = "connection1";
    await credentialService.acceptCredentialOffer(credentialRecordId);
    expect(agent.credentials.acceptOffer).toBeCalledWith({
      credentialRecordId,
    });
  });
});
