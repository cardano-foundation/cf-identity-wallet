import { act, fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { IdentifiersList } from "./IdentifiersList";
import { IdentifierShortDetails } from "../../../../core/agent/services/identifier.types";
import { connectionsFix } from "../../../__fixtures__/connectionsFix";
import { filteredIdentifierFix } from "../../../__fixtures__/filteredIdentifierFix";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../globals/constants";
import { TabsRoutePath } from "../../../../routes/paths";

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

  test("Renders Identifiers List and items", () => {
    const pendingIdentifiers: IdentifierShortDetails[] = [
      {
        id: "ECHG-cxboMQ78Hwlm2-w6OS3iU275bAKkqC1LjwICPyi",
        displayName: "Test MS",
        createdAtUTC: "2024-03-07T11:54:56.886Z",
        theme: 4,
        isPending: true,
        signifyName: "Test",
      },
    ];
    const handleClick = jest.fn();
    const { getByText, getByTestId } = render(
      <Provider store={mockedStore}>
        <IdentifiersList
          identifiers={pendingIdentifiers}
          showDate={true}
          handleClick={handleClick}
        />
      </Provider>
    );

    expect(getByTestId("identifiers-list")).toBeInTheDocument();
    expect(getByTestId("identifier-item-0")).toBeInTheDocument();
    expect(getByTestId("identifier-miniature-0")).toBeInTheDocument();
    expect(getByText("Test MS")).toBeInTheDocument();
    expect(getByTestId("identifier-info-0")).toBeInTheDocument();
    fireEvent.click(getByTestId("identifier-item-0"));
    expect(handleClick).toBeCalledWith(pendingIdentifiers[0]);
  });
});
