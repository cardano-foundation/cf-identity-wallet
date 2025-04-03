import { Features } from "../globals/accessPermission";
import { canAccessFeature } from "./accessPermission";

jest.mock("../../core/configuration", () => ({
  ...jest.requireActual("../../core/configuration"),
  ConfigurationService: {
    accessConfigs: {
      [Features.ConnectWallet]: {
        active: true,
      },
    },
  },
}));

describe("Can access permisson", () => {
  const errorLogMock = jest.fn();
  const dispatch = jest.fn();

  it("Get permisson", () => {
    expect(canAccessFeature(Features.ConnectWallet)).toEqual(true);
  });

  it("Find not exist key", () => {
    expect(canAccessFeature("not-exist-key")).toEqual(false);
  });
});
