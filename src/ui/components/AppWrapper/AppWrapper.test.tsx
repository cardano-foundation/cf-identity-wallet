import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { AppWrapper } from "./AppWrapper";
import { store } from "../../../store";

jest.mock("../../../core/aries/ariesAgent", () => ({
  AriesAgent: {
    agent: {
      start: jest.fn(),
      getIdentities: jest.fn().mockResolvedValue([]),
      getConnections: jest.fn().mockResolvedValue([]),
      onConnectionStateChange: jest.fn(),
    },
  },
}));
jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: jest.fn(),
  },
}));

describe("App Wrapper", () => {
  test("renders children components", async () => {
    const { getByText } = render(
      <Provider store={store}>
        <AppWrapper>
          <div>App Content</div>
        </AppWrapper>
      </Provider>
    );

    await waitFor(() => {
      expect(getByText("App Content")).toBeInTheDocument();
    });
  });
});
