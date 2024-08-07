import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { AnyAction, Store } from "@reduxjs/toolkit";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { CardType } from "../../globals/types";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { CardSlider } from "./CardSlider";
import { shortCredsFix } from "../../__fixtures__/shortCredsFix";

const historyPushMock = jest.fn();
const createOrUpdateBasicRecordMock = jest.fn();
jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        createOrUpdateBasicRecord: () => createOrUpdateBasicRecordMock(),
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
    favouriteIndex: 0,
  },
};
let mockedStore: Store<unknown, AnyAction>;
const dispatchMock = jest.fn();

describe("Card slider", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();

    mockedStore = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
  });

  test("Render", async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <Provider store={mockedStore}>
        <CardSlider
          cardType={CardType.IDENTIFIERS}
          cardsData={[identifierFix[0]]}
          title="title"
          name="allidentifiers"
        />
      </Provider>
    );

    expect(getByText("title")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        getByTestId(`card-slide-container-${identifierFix[0].id}`)
      ).toBeInTheDocument();
    });

    expect(queryByTestId("slide-pagination-0")).toBe(null);

    act(() => {
      fireEvent.click(
        getByTestId("identifier-card-template-allidentifiers-index-0")
      );
    });

    expect(historyPushMock).toBeCalled();
  });

  test("Click to pagination", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={mockedStore}>
        <CardSlider
          cardType={CardType.CREDENTIALS}
          cardsData={shortCredsFix}
          title="title"
          name="creds"
        />
      </Provider>
    );

    expect(getByText("title")).toBeInTheDocument();

    await waitFor(() => {
      expect(getByTestId("slide-pagination-1")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("slide-pagination-1"));
    });

    await waitFor(() => {
      expect(createOrUpdateBasicRecordMock).toBeCalled();
    });

    act(() => {
      fireEvent.click(getByTestId("keri-card-template-creds-index-1"));
    });

    expect(historyPushMock).toBeCalled();
  });
});
