import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { PageLayout } from "./PageLayout";
import { store } from "../../../../store";

describe("Page Layout", () => {
  test("Renders Page Layout", () => {
    const mockCloseButton = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <PageLayout
          header={true}
          backButton={true}
          backButtonPath={"/path"}
          currentPath={"/"}
          closeButton={true}
          closeButtonAction={mockCloseButton}
          progressBar={true}
          progressBarValue={0.5}
          progressBarBuffer={1}
          title={"Title"}
        >
          <p>Content</p>
        </PageLayout>
      </Provider>
    );

    expect(getByText("Title")).toBeInTheDocument();
    expect(getByText("Content")).toBeInTheDocument();

    fireEvent.click(getByTestId("close-button"));
    expect(mockCloseButton.mock.calls.length).toEqual(1);
  });
});
