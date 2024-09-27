import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { AnyAction, Store } from "@reduxjs/toolkit";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { CardType } from "../../globals/types";
import { SwitchCardView } from "./SwitchCardView";
import { credsFixAcdc } from "../../__fixtures__/credsFix";
import { TabsRoutePath } from "../navigation/TabsMenu";

const historyPushMock = jest.fn();
jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        createOrUpdateBasicRecord: () => Promise.resolve(),
      },
    },
  },
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    ...jest.requireActual("react-router-dom").useHistory,
    push: (params: any) => historyPushMock(params),
  }),
}));

const initialState = {
  stateCache: {
    routes: [TabsRoutePath.IDENTIFIERS],
    authentication: {
      loggedIn: true,
      time: Date.now(),
      passcodeIsSet: true,
      passwordIsSet: true,
    },
  },
  identifierViewTypeCacheCache: {
    viewType: null,
  },
};
let mockedStore: Store<unknown, AnyAction>;
const dispatchMock = jest.fn();

describe("Card switch view list Tab", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();

    mockedStore = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
  });

  test("Renders switch view: identifier", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={mockedStore}>
        <SwitchCardView
          cardTypes={CardType.IDENTIFIERS}
          cardsData={identifierFix}
          title="title"
          name="allidentifiers"
        />
      </Provider>
    );

    expect(getByText("title")).toBeInTheDocument();

    await waitFor(() => {
      expect(getByTestId("card-stack")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("list-header-second-icon"));
    });

    expect(getByTestId("card-list")).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId("card-item-" + identifierFix[0].id));
    });

    await waitFor(() => {
      expect(historyPushMock).toBeCalledWith({
        pathname: `/tabs/identifiers/${identifierFix[0].id}`,
      });
    });
  });

  test("Renders switch view: cred", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={mockedStore}>
        <SwitchCardView
          cardTypes={CardType.CREDENTIALS}
          cardsData={credsFixAcdc.map((cred) => ({
            ...cred,
            credentialType: cred.s.title,
            issuanceDate: cred.a.dt,
          }))}
          title="title"
          name="allidentifiers"
        />
      </Provider>
    );

    expect(getByText("title")).toBeInTheDocument();

    await waitFor(() => {
      expect(getByTestId("card-stack")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("list-header-second-icon"));
    });

    expect(getByTestId("card-list")).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId("card-item-" + credsFixAcdc[0].id));
    });

    await waitFor(() => {
      expect(historyPushMock).toBeCalledWith({
        pathname: `${TabsRoutePath.CREDENTIALS}/${credsFixAcdc[0].id}`,
      });
    });

    act(() => {
      fireEvent.click(getByTestId("list-header-first-icon"));
    });

    await waitFor(() => {
      expect(getByTestId("card-stack")).toBeInTheDocument();
    });
  });
});
