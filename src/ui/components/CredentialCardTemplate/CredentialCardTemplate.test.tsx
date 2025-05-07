import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { shortCredsFix } from "../../__fixtures__/shortCredsFix";
import { CredentialCardTemplate } from "./CredentialCardTemplate";
import { formatShortDate } from "../../utils/formatters";

describe("Credential Card Template", () => {
  it("Renders Keri Card Template", async () => {
    const handleShowCardDetails = jest.fn();
    const cardData = shortCredsFix[3];
    const { getByText, getByTestId, getByAltText } = render(
      <Provider store={store}>
        <CredentialCardTemplate
          name="name"
          index={0}
          cardData={cardData}
          isActive={true}
          onHandleShowCardDetails={handleShowCardDetails}
        />
      </Provider>
    );

    const card = await waitFor(() =>
      getByTestId("keri-card-template-name-index-0")
    );
    expect(getByText(cardData.credentialType)).toBeInTheDocument();
    expect(
      getByText(formatShortDate(cardData.issuanceDate))
    ).toBeInTheDocument();
    expect(getByAltText(/card-logo/i)).toBeInTheDocument();
    act(() => {
      fireEvent.click(card);
    });
    expect(handleShowCardDetails).toBeCalledTimes(1);
  });

  it("Renders Rome Card Template", async () => {
    const handleShowCardDetails = jest.fn();
    const cardData = shortCredsFix[7];
    const { getByText, getByTestId, getByAltText } = render(
      <Provider store={store}>
        <CredentialCardTemplate
          name="name"
          index={0}
          cardData={cardData}
          isActive={true}
          onHandleShowCardDetails={handleShowCardDetails}
        />
      </Provider>
    );

    const card = await waitFor(() =>
      getByTestId("rome-card-template-name-index-0")
    );

    expect(
      getByText(formatShortDate(cardData.issuanceDate))
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(card);
    });

    expect(handleShowCardDetails).toBeCalledTimes(1);
  });
});
