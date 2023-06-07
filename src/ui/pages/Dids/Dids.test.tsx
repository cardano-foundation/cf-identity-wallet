import { act, fireEvent, render } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { Dids } from "./Dids";
import { store } from "../../../store";
import { TabsRoutePath } from "../../../routes/paths";
import { CardDetails } from "../CardDetails";
import { didsMock } from "../../__mocks__/didsMock";
import {
  CLEAR_STATE_DELAY,
  NAVIGATION_DELAY,
} from "../../components/CardsStack";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Dids Tab", () => {
  test("Renders Dids Tab", () => {
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
    jest.useFakeTimers();
    const { getByText, getByTestId, queryByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.DIDS]}>
        <Provider store={store}>
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

    const firstCardId = getByText(didsMock[0].id);

    act(() => {
      fireEvent.click(firstCardId);
      jest.advanceTimersByTime(NAVIGATION_DELAY);
    });

    expect(getByText(EN_TRANSLATIONS["card.details.done"])).toBeVisible();

    jest.advanceTimersByTime(CLEAR_STATE_DELAY);
    const firstCard = getByTestId("card-stack-index-0");
    expect(firstCard).not.toHaveClass("active");

    const tabTitle = getByTestId("tab-title");

    act(() => {
      fireEvent.click(tabTitle);
    });

    expect(queryByText(EN_TRANSLATIONS["card.details.done"])).toBeNull();
  });
});
