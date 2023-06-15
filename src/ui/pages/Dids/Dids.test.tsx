import { act, fireEvent, render } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Dids } from "./Dids";
import { store } from "../../../store";
import { TabsRoutePath } from "../../../routes/paths";
import { CardDetails } from "../CardDetails";
import {
  CLEAR_STATE_DELAY,
  NAVIGATION_DELAY,
} from "../../components/CardsStack";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { filteredDidsMock } from "../../__mocks__/filteredDidsMock";

describe("Dids Tab", () => {
  test("Renders Dids Tab and all elements in it", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Dids />
      </Provider>
    );

    expect(getByTestId("dids-tab")).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS["dids.tab.title"])).toBeInTheDocument();
    expect(getByTestId("contacts-button")).toBeInTheDocument();
    expect(getByTestId("add-button")).toBeInTheDocument();
    expect(getByTestId("menu-button")).toBeInTheDocument();
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
      didsCache: {
        dids: [filteredDidsMock[0]],
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
            component={CardDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    const firstCardId = getByText(filteredDidsMock[0].id);

    act(() => {
      fireEvent.click(firstCardId);
      jest.advanceTimersByTime(NAVIGATION_DELAY);
    });

    expect(getByText(EN_TRANSLATIONS["card.details.done"])).toBeVisible();

    jest.advanceTimersByTime(CLEAR_STATE_DELAY);

    const firstCardDetailsId = getByTestId("card-stack");
    expect(firstCardDetailsId).not.toHaveClass("active");

    const doneButton = getByTestId(
      `tab-title-${EN_TRANSLATIONS["card.details.done"].toLowerCase()}`
    );

    act(() => {
      fireEvent.click(doneButton);
    });
    expect(queryByText(EN_TRANSLATIONS["dids.tab.title"])).toBeVisible();
  });
});
