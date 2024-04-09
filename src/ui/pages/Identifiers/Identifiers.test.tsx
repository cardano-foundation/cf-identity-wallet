import { act, fireEvent, render } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { Identifiers } from "./Identifiers";
import { TabsRoutePath } from "../../../routes/paths";
import { IdentifierDetails } from "../IdentifierDetails";
import {
  CLEAR_STATE_DELAY,
  NAVIGATION_DELAY,
} from "../../components/CardsStack";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../globals/constants";
import { connectionsFix } from "../../__fixtures__/connectionsFix";

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      identifiers: {
        getIdentifier: jest.fn().mockResolvedValue({}),
        checkMultisigComplete: jest.fn().mockResolvedValue(true),
      },
      genericRecords: {
        findById: jest.fn(),
      },
    },
  },
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
  seedPhraseCache: {
    seedPhrase160:
      "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
    seedPhrase256: "",
    selected: FIFTEEN_WORDS_BIT_LENGTH,
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
    favourites: [
      {
        id: filteredIdentifierFix[0].id,
        time: 1,
      },
    ],
  },
  connectionsCache: {
    connections: connectionsFix,
  },
};

let mockedStore: Store<unknown, AnyAction>;
describe("Identifiers Tab", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const mockStore = configureStore();
    const dispatchMock = jest.fn();

    mockedStore = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
  });

  test("Renders favourites in Identifiers", () => {
    const { getByText } = render(
      <Provider store={mockedStore}>
        <Identifiers />
      </Provider>
    );

    expect(getByText(EN_TRANSLATIONS.creds.tab.favourites)).toBeInTheDocument();
  });

  test("Renders Identifiers Tab and all elements in it", () => {
    const { getByText, getByTestId } = render(
      <Provider store={mockedStore}>
        <Identifiers />
      </Provider>
    );

    expect(getByTestId("identifiers-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.identifiers.tab.title)
    ).toBeInTheDocument();
    expect(getByTestId("connections-button")).toBeInTheDocument();
    expect(getByTestId("add-button")).toBeInTheDocument();
    expect(getByTestId("identifiers-list")).toBeInTheDocument();
    expect(getByTestId("identifier-item-0")).toBeInTheDocument();
  });

  test("Navigate from Identifiers Tab to Card Details and back", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      identifiersCache: {
        identifiers: filteredIdentifierFix,
      },
      connectionsCache: {
        connections: connectionsFix,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    jest.useFakeTimers();
    const { getByText, getByTestId, queryByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.IDENTIFIERS}
            component={Identifiers}
          />
          <Route
            path={TabsRoutePath.IDENTIFIER_DETAILS}
            component={IdentifierDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    expect(
      getByText(
        filteredIdentifierFix[0].id.substring(0, 5) +
          "..." +
          filteredIdentifierFix[0].id.slice(-5)
      )
    ).toBeVisible();

    act(() => {
      fireEvent.click(
        getByTestId("identifier-card-template-allidentifiers-index-0")
      );
      jest.advanceTimersByTime(NAVIGATION_DELAY);
    });

    expect(
      getByText(EN_TRANSLATIONS.identifiers.card.details.done)
    ).toBeVisible();

    jest.advanceTimersByTime(CLEAR_STATE_DELAY);

    const doneButton = getByTestId("close-button");

    act(() => {
      fireEvent.click(doneButton);
    });
    expect(queryByText(EN_TRANSLATIONS.identifiers.tab.title)).toBeVisible();
  });
});
