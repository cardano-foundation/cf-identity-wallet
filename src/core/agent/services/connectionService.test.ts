import {
  Agent,
  OutOfBandInvitation,
  OutOfBandRecord,
  OutOfBandRole,
  OutOfBandState,
} from "@aries-framework/core";
import { ConnectionService } from "./connectionService";

const agent = jest.mocked({
  oob: {
    receiveInvitationFromUrl: jest.fn(),
    createInvitation: jest.fn(),
  },
  connections: {
    acceptRequest: jest.fn(),
  },
});
const connectionService = new ConnectionService(agent as any as Agent);

const oobi = new OutOfBandInvitation({
  label: "label",
  services: ["http://localhost:5341"],
});
const oobRecord = new OutOfBandRecord({
  outOfBandInvitation: oobi,
  role: OutOfBandRole.Sender,
  state: OutOfBandState.PrepareResponse,
});
const oobUrlStart =
  "didcomm://invite?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOi";
const oobUrlEnd =
  "iLCJsYWJlbCI6ImxhYmVsIiwic2VydmljZXMiOlsiaHR0cDovL2xvY2FsaG9zdDo1MzQxIl19";

// Callbacks need to be tested at an integration/e2e test level
describe("Connection service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("can receive an OOBI", async () => {
    const oobi = "http://localhost?oob=3423";
    await connectionService.receiveInvitationFromUrl(oobi);
    // We aren't too concerned with testing the config passed
    expect(agent.oob.receiveInvitationFromUrl).toBeCalledWith(
      oobi,
      expect.any(Object)
    );
  });

  test("can accept a request by connection id", async () => {
    const connectionId = "connectionId";
    await connectionService.acceptRequest(connectionId);
    expect(agent.connections.acceptRequest).toBeCalledWith(connectionId);
  });

  test("can create an invitation via the mediator", async () => {
    agent.oob.createInvitation = jest.fn().mockResolvedValue(oobRecord);
    const invitation = await connectionService.createMediatorInvitation();
    expect(invitation.invitation).toBe(oobi);
    expect(invitation.record).toBe(oobRecord);
    expect(invitation.invitationUrl.startsWith(oobUrlStart)).toBe(true);
    expect(invitation.invitationUrl.endsWith(oobUrlEnd)).toBe(true);
  });

  test("errors appropriately if we invitation is wrong", async () => {
    await expect(
      connectionService.createMediatorInvitation()
    ).rejects.toThrowError(ConnectionService.COULD_NOT_CREATE_OOB_VIA_MEDIATOR);
  });
});
