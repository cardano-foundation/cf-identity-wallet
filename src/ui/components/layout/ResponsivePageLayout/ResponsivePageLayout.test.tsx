import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../../../store";
import { ResponsivePageLayout } from "./ResponsivePageLayout";
import { PageHeader } from "../../PageHeader";

describe("Page Layout", () => {
  test("Renders Page Layout", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <ResponsivePageLayout
          pageId="page-id"
          header={<PageHeader title="Title" />}
        >
          <p>Content</p>
        </ResponsivePageLayout>
      </Provider>
    );

    expect(getByTestId("page-id-page")).toBeInTheDocument();
    expect(getByText("Title")).toBeInTheDocument();
    expect(getByText("Content")).toBeInTheDocument();
  });
});
