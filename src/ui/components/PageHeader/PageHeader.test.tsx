import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { PageHeader } from "./PageHeader";
import { RoutePath } from "../../../routes";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../globals/constants";

describe("Page Header", () => {
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
    seedPhraseCache: {
      seedPhrase160: "",
      seedPhrase256: "",
      selected: FIFTEEN_WORDS_BIT_LENGTH,
    },
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("Renders Page Header elements part 1", () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <PageHeader
          backButton={true}
          currentPath={RoutePath.GENERATE_SEED_PHRASE}
          progressBar={true}
          progressBarValue={0.66}
          progressBarBuffer={1}
        />
      </Provider>
    );

    expect(getByTestId("back-button")).toBeInTheDocument();
    expect(getByTestId("progress-bar")).toBeInTheDocument();
    expect(getByTestId("progress-bar")).toHaveAttribute("value", "0.66");
    expect(getByTestId("progress-bar")).toHaveAttribute("buffer", "1");
  });

  test("Renders Page Header elements part 2", () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <PageHeader
          closeButton={true}
          title="Title"
          actionButton={true}
          actionButtonLabel="Action"
        />
      </Provider>
    );

    expect(getByTestId("close-button")).toBeInTheDocument();
    expect(getByText("Title")).toBeInTheDocument();
    expect(getByTestId("action-button")).toBeInTheDocument();
    expect(getByTestId("action-button")).toHaveTextContent("Action");
  });

  test("clicking on action button invokes handleOnAction function", async () => {
    const mockActionButton = jest.fn();

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <PageHeader
          closeButton={true}
          title="Title"
          actionButton={true}
          actionButtonLabel="Action"
          actionButtonAction={mockActionButton}
        />
      </Provider>
    );
    expect(getByTestId("action-button")).toBeInTheDocument();
    expect(mockActionButton).not.toHaveBeenCalled();
    fireEvent.click(getByTestId("action-button"));
    expect(storeMocked.dispatch).not.toHaveBeenCalled();
  });

  test("clicking on close button invokes handleOnClose function", async () => {
    const mockCloseButton = jest.fn();

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <PageHeader
          closeButton={true}
          title="Title"
          actionButton={true}
          actionButtonLabel="Action"
          actionButtonAction={mockCloseButton}
        />
      </Provider>
    );
    expect(getByTestId("close-button")).toBeInTheDocument();
    expect(mockCloseButton).not.toHaveBeenCalled();
    fireEvent.click(getByTestId("close-button"));
    expect(storeMocked.dispatch).not.toHaveBeenCalled();
  });

  test("clicking on back button invokes handleOnBack function", async () => {
    const mockCloseButton = jest.fn();

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <PageHeader
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
        </PageHeader>
      </Provider>
    );
    expect(getByTestId("back-button")).toBeInTheDocument();
  });
});
