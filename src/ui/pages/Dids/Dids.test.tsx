import { act, fireEvent, render } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Dids } from "./Dids";
import { store } from "../../../store";
import { TabsRoutePath } from "../../../routes/paths";
import { DidCardDetails } from "../DidCardDetails";
import {
  CLEAR_STATE_DELAY,
  NAVIGATION_DELAY,
} from "../../components/CardsStack";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { filteredIdentityFix } from "../../__fixtures__/filteredIdentityFix";

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      identifiers: {
        getIdentifier: jest.fn().mockResolvedValue({}),
      },
    },
  },
}));
describe("Dids Tab", () => {
  test("Renders Dids Tab and all elements in it", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Dids />
      </Provider>
    );

    expect(getByTestId("dids-tab")).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS.identity.tab.title)).toBeInTheDocument();
    expect(getByTestId("contacts-button")).toBeInTheDocument();
    expect(getByTestId("add-button")).toBeInTheDocument();
    expect(
      getByTestId(
        `menu-button-${EN_TRANSLATIONS.identity.tab.title.toLowerCase()}`
      )
    ).toBeInTheDocument();
  });

  test("Navigate from Dids Tab to Card Details and back", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.DIDS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      identitiesCache: {
        identities: filteredIdentityFix,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    jest.useFakeTimers();
    const { getByText, getByTestId, queryByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.DIDS]}>
        <Provider store={storeMocked}>
          <Route
            path={TabsRoutePath.DIDS}
            component={Dids}
          />
          <Route
            path={TabsRoutePath.DID_DETAILS}
            component={DidCardDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    expect(
      getByText(
        filteredIdentityFix[0].id.substring(8, 13) +
          "..." +
          filteredIdentityFix[0].id.slice(-5)
      )
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("did-card-stack-index-0"));
      jest.advanceTimersByTime(NAVIGATION_DELAY);
    });

    expect(getByText(EN_TRANSLATIONS.identity.card.details.done)).toBeVisible();

    jest.advanceTimersByTime(CLEAR_STATE_DELAY);

    const doneButton = getByTestId(
      `tab-title-${EN_TRANSLATIONS.identity.card.details.done.toLowerCase()}`
    );

    act(() => {
      fireEvent.click(doneButton);
    });
    expect(queryByText(EN_TRANSLATIONS.identity.tab.title)).toBeVisible();
  });
});
