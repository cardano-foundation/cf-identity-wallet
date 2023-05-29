import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { TabLayout } from "./TabLayout";
import { store } from "../../../../store";
import { TabsRoutePath } from "../../navigation/TabsMenu";
import { OtherButtons } from "../../../pages/Dids";

describe("Tab Layout", () => {
  test("Renders Tab Layout", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <TabLayout
          currentPath={TabsRoutePath.DIDS}
          header={true}
          title="Identities"
          menuButton={true}
          otherButtons={<OtherButtons />}
        >
          <p>Content</p>
        </TabLayout>
      </Provider>
    );

    expect(getByText("Identities")).toBeInTheDocument();
    expect(getByTestId("contacts-button")).toBeInTheDocument();
    expect(getByTestId("add-button")).toBeInTheDocument();
    expect(getByTestId("menu-button")).toBeInTheDocument();
    expect(getByText("Content")).toBeInTheDocument();
  });
});
