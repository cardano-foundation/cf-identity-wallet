import { fireEvent, render } from "@testing-library/react";
import { PageLayout } from "./PageLayout";

describe("Page Layout", () => {
  test("Renders Page Layout", () => {
    const mockCloseButton = jest.fn();
    const { getByText, getByTestId } = render(
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
    );

    expect(getByText("Title")).toBeInTheDocument();
    expect(getByText("Content")).toBeInTheDocument();

    fireEvent.click(getByTestId("close-button"));
    expect(mockCloseButton.mock.calls.length).toEqual(1);
  });
});
