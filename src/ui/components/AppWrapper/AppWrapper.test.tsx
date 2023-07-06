import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { AppWrapper } from "./AppWrapper";
import { store } from "../../../store";
jest.mock("../../../core/aries/ariesAgent.ts", () => ({
  AriesAgent: {
    agent: {
      getIdentities: jest.fn().mockResolvedValue([]),
    },
  },
}));
describe("App Wrapper", () => {
  test("renders children components", () => {
    const { getByText } = render(
      <Provider store={store}>
        <AppWrapper>
          <div>App Content</div>
        </AppWrapper>
      </Provider>
    );

    expect(getByText("App Content")).toBeInTheDocument();
  });
});
