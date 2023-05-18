import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import { PageLayout } from "./PageLayout";
import { store } from "../../../../store";
import { RoutePath } from "../../../../routes";

describe("Page Layout", () => {
  test("Renders Page Layout", () => {
    const mockCloseButton = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <PageLayout
          header={true}
          backButton={true}
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

  test("clicking on back button invokes handleOnBack function", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: ["/"],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const mockCloseButton = jest.fn();

    const { getByTestId } = render(
      <MemoryRouter initialEntries={[RoutePath.ONBOARDING]}>
        <Provider store={storeMocked}>
          <PageLayout
            header={true}
            backButton={true}
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
      </MemoryRouter>
    );
    expect(getByTestId("back-button")).toBeInTheDocument();
    expect(mockCloseButton).not.toHaveBeenCalled();
    fireEvent.click(getByTestId("back-button"));
    expect(storeMocked.dispatch).not.toHaveBeenCalled();
  });
});
