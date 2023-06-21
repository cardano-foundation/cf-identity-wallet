import { act, fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { CardsStack, NAVIGATION_DELAY } from "./CardsStack";
import { didsMock } from "../../__mocks__/didsMock";
import { store } from "../../../store";
import { DidCardDetails } from "../../pages/DidCardDetails";
import { TabsRoutePath } from "../navigation/TabsMenu";

describe("Cards Stack Component", () => {
  test("It renders Cards Stack", () => {
    const { getByText } = render(
      <Provider store={store}>
        <CardsStack
          cardsType="dids"
          cardsData={didsMock}
        />
      </Provider>
    );
    const firstCardId = getByText(didsMock[0].id);
    expect(firstCardId).toBeInTheDocument();
  });

  test("It navigates to Card Details", () => {
    jest.useFakeTimers();
    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <Provider store={store}>
          <CardsStack
            cardsType="dids"
            cardsData={didsMock}
          />
          <Route
            path={TabsRoutePath.DID_DETAILS}
            component={DidCardDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    const firstCard = getByTestId("card-stack-index-0");
    expect(firstCard).not.toHaveClass("active");

    const firstCardId = getByText(didsMock[0].id);

    act(() => {
      fireEvent.click(firstCardId);
      jest.advanceTimersByTime(NAVIGATION_DELAY);
    });

    expect(firstCard).toHaveClass("active");
  });
});
