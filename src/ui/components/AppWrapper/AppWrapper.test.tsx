import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { AppWrapper } from "./AppWrapper";
import { store } from "../../../store";

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      start: jest.fn(),
      identifiers: {
        getIdentifiers: jest.fn().mockResolvedValue([]),
      },
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
