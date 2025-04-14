import { OptionalFeature } from "../../core/configuration/configurationService.types";
import { checkFeatureAvailable } from "./featureAvailableChecker";

jest.mock("../../core/configuration", () => ({
  ...jest.requireActual("../../core/configuration"),
  ConfigurationService: {
    env: {
      features: {
        cut: [OptionalFeature.ConnectWallet],
      },
    },
  },
}));

describe("Can access permisson", () => {
  it("Get permisson", () => {
    expect(checkFeatureAvailable(OptionalFeature.ConnectWallet)).toEqual(false);
  });

  it("Find not exist key", () => {
    expect(checkFeatureAvailable("not-exist-key" as OptionalFeature)).toEqual(
      true
    );
  });
});
