import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { CredCardTemplate } from "./CredCardTemplate";
import { shortCredsFix } from "../../__fixtures__/shortCredsFix";

describe("CredCardTemplate", () => {
  it("renders ACDC card", async () => {
    const handleShowCardDetails = jest.fn();
    const { getByText, getByTestId, getByAltText } = render(
      <Provider store={store}>
        <CredCardTemplate
          name="name"
          index={0}
          shortData={shortCredsFix[3]}
          isActive={true}
          onHandleShowCardDetails={() => handleShowCardDetails(0)}
        />
      </Provider>
    );
    const card = getByTestId("cred-card-template-name-index-0");
    expect(getByText("Qualified vLEI Issuer Credential")).toBeInTheDocument();
    expect(getByText("22/01/2024")).toBeInTheDocument();
    expect(card.classList.contains("card-body-w3c-generic")).toBe(true);
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
        <CredCardTemplate
          name="name"
          index={0}
          shortData={shortCredsFix[4]}
          isActive={true}
          onHandleShowCardDetails={() => handleShowCardDetails(0)}
        />
      </Provider>
    );
    const card = getByTestId("cred-card-template-name-index-0");

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
        <CredCardTemplate
          name="name"
          index={0}
          shortData={shortCredsFix[4]}
          isActive={false}
          onHandleShowCardDetails={() => handleShowCardDetails(0)}
        />
      </Provider>
    );
    const card = getByTestId("cred-card-template-name-index-0");

    expect(card.classList.contains("active")).toBe(false);
  });
});
