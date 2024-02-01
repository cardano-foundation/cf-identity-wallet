import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { ResponsiveModal } from "./ResponsiveModal";
import { store } from "../../../../store";

describe("Create Identifier modal", () => {
  const mockDismiss = jest.fn();

  test("should display the modal", () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ResponsiveModal
          componentId="custom-modal"
          modalIsOpen={true}
          customClasses="custom-class"
          onDismiss={() => mockDismiss()}
        >
          <p>Child text line</p>
        </ResponsiveModal>
      </Provider>
    );
    expect(getByTestId("custom-modal")).toBeInTheDocument();
  });
});
