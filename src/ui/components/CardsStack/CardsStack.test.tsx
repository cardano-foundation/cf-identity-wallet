import { act, fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { CardsStack, NAVIGATION_DELAY } from "./CardsStack";
import { didsMock } from "../../__mocks__/didsMock";
import { store } from "../../../store";
import { DidCardDetails } from "../../pages/DidCardDetails";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { credsMock } from "../../__mocks__/credsMock";
import { CredCardDetails } from "../../pages/CredCardDetails";

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

  test("It renders correct shadow on Did card", () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <CardsStack
          cardsType="dids"
          cardsData={didsMock}
        />
      </Provider>
    );
    const firstCard = getByTestId("did-card-stack-index-0");
    expect(firstCard).toHaveClass("bottom-shadow");
    const secondCard = getByTestId("did-card-stack-index-1");
    expect(secondCard).toHaveClass("top-shadow");
  });

  test("It renders correct shadow on Cred card", () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <CardsStack
          cardsType="creds"
          cardsData={credsMock}
        />
      </Provider>
    );
    const firstCard = getByTestId("cred-card-stack-index-0");
    expect(firstCard).toHaveClass("bottom-shadow");
    const secondCard = getByTestId("cred-card-stack-index-1");
    expect(secondCard).toHaveClass("top-shadow");
  });

  test("It navigates to Did Card Details", () => {
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

    const firstCard = getByTestId("did-card-stack-index-0");
    expect(firstCard).not.toHaveClass("active");

    act(() => {
      fireEvent.click(firstCard);
      jest.advanceTimersByTime(NAVIGATION_DELAY);
    });

    expect(firstCard).toHaveClass("active");
  });

  test("It navigates to Cred Card Details", () => {
    jest.useFakeTimers();
    const { getByTestId } = render(
      <MemoryRouter>
        <Provider store={store}>
          <CardsStack
            cardsType="creds"
            cardsData={credsMock}
          />
          <Route
            path={TabsRoutePath.CRED_DETAILS}
            component={CredCardDetails}
          />
        </Provider>
      </MemoryRouter>
    );

    const firstCard = getByTestId("cred-card-stack-index-0");
    expect(firstCard).not.toHaveClass("active");

    act(() => {
      fireEvent.click(firstCard);
      jest.advanceTimersByTime(NAVIGATION_DELAY);
    });

    expect(firstCard).toHaveClass("active");
  });
});
