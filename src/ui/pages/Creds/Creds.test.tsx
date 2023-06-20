import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Creds } from "./Creds";
import { TabsRoutePath } from "../../../routes/paths";
import { filteredCredsMock } from "../../__mocks__/filteredCredsMock";

describe("Creds Tab", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();

  const initialStateEmpty = {
    stateCache: {
      routes: [TabsRoutePath.CREDS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
      },
    },
    seedPhraseCache: {},
    credsCache: {
      creds: [],
    },
  };

  const initialStateFull = {
    stateCache: {
      routes: [TabsRoutePath.CREDS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
      },
    },
    seedPhraseCache: {},
    credsCache: {
      creds: filteredCredsMock,
    },
  };

  test("Renders Creds Tab", () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <Creds />
      </Provider>
    );

    expect(getByTestId("creds-tab")).toBeInTheDocument();
    expect(getByText("Credentials")).toBeInTheDocument();
    expect(getByTestId("menu-button")).toBeInTheDocument();
  });

  test("Renders Creds Card placeholder", () => {
    const storeMocked = {
      ...mockStore(initialStateEmpty),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Creds />
      </Provider>
    );

    expect(getByTestId("cards-placeholder")).toBeInTheDocument();
  });

  test("Renders Creds Card", () => {
    const storeMocked = {
      ...mockStore(initialStateFull),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Creds />
      </Provider>
    );

    expect(getByTestId("card-stack-index-0")).toBeInTheDocument();
  });
});
