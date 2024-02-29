import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../../../store";
import { ScrollablePageLayout } from "./ScrollablePageLayout";
import { PageHeader } from "../../PageHeader";

describe("Page Layout", () => {
  test("Renders Page Layout", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <ScrollablePageLayout
          pageId="page-id"
          header={<PageHeader title="Title" />}
        >
          <p>Content</p>
        </ScrollablePageLayout>
      </Provider>
    );

    expect(getByTestId("page-id-page")).toBeInTheDocument();
    expect(getByText("Title")).toBeInTheDocument();
    expect(getByText("Content")).toBeInTheDocument();
  });
});
