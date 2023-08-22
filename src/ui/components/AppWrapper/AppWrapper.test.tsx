import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { AppWrapper } from "./AppWrapper";
import { store } from "../../../store";

jest.mock("../../../core/aries/transports/libp2p/libP2p", () => ({
  LibP2p: {
    libP2p: {
      start: jest.fn(),
    },
  },
}));
jest.mock("../../../core/aries/ariesAgent", () => ({
  AriesAgent: {
    agent: {
      start: jest.fn(),
      getIdentities: jest.fn().mockResolvedValue([]),
      initLibP2p: jest.fn(),
    },
  },
}));
jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: jest.fn()
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
