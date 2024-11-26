import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import { store } from "../../../../../store";
import { RareEvoCardTemplate } from "./RareEvoCardTemplate";
import { shortCredsFix } from "../../../../__fixtures__/shortCredsFix";
import { formatShortDate } from "../../../../utils/formatters";

describe("Rare Evo Card Template", () => {
  it("renders Rare Evo Card Template", async () => {
    const handleShowCardDetails = jest.fn();
    const { getByText, getByTestId, getByAltText } = render(
      <Provider store={store}>
        <RareEvoCardTemplate
          name="name"
          index={0}
          cardData={shortCredsFix[5]}
          isActive={true}
          onHandleShowCardDetails={() => handleShowCardDetails(0)}
        />
      </Provider>
    );
    const card = getByTestId("rare-card-template-name-index-0");
    expect(getByText(shortCredsFix[5].credentialType)).toBeInTheDocument();
    expect(
      getByText(formatShortDate(shortCredsFix[5].issuanceDate))
    ).toBeInTheDocument();
    expect(getByAltText(/card-logo/i)).toBeInTheDocument();
    act(() => {
      fireEvent.click(card);
    });
    expect(handleShowCardDetails).toBeCalledTimes(1);
  });

  it("Click pending card", async () => {
    const handleShowCardDetails = jest.fn();
    const { getByTestId } = render(
      <Provider store={store}>
        <RareEvoCardTemplate
          name="name"
          index={0}
          cardData={shortCredsFix[6]}
          isActive={true}
          onHandleShowCardDetails={() => handleShowCardDetails(0)}
        />
      </Provider>
    );
    const card = getByTestId("rare-card-template-name-index-0");

    act(() => {
      fireEvent.click(card);
    });

    expect(handleShowCardDetails).toBeCalledTimes(0);

    await waitFor(() => {
      expect(getByTestId("alert-confirm")).toBeInTheDocument();
    });
  });

  it("In active card status", async () => {
    const handleShowCardDetails = jest.fn();
    const { getByTestId } = render(
      <Provider store={store}>
        <RareEvoCardTemplate
          name="name"
          index={0}
          cardData={shortCredsFix[6]}
          isActive={false}
          onHandleShowCardDetails={() => handleShowCardDetails(0)}
        />
      </Provider>
    );
    const card = getByTestId("rare-card-template-name-index-0");

    expect(card.classList.contains("active")).toBe(false);
  });
});
