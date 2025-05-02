import { fireEvent, render } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { shortCredsFix } from "../../__fixtures__/shortCredsFix";
import { CredentialCardTemplate } from "./CredentialCardTemplate";
import { formatShortDate } from "../../utils/formatters";

describe("Credential Card Template", () => {
  it("Renders Keri Card Template", async () => {
    const handleShowCardDetails = jest.fn();
    const { getByText, getByTestId, getByAltText } = render(
      <Provider store={store}>
        <CredentialCardTemplate
          name="name"
          index={0}
          cardData={shortCredsFix[3]}
          isActive={true}
          onHandleShowCardDetails={() => handleShowCardDetails(0)}
        />
      </Provider>
    );

    const card = getByTestId("keri-card-template-name-index-0");
    expect(getByText("Qualified vLEI Issuer Credential")).toBeInTheDocument();
    expect(getByText("22/01/2024")).toBeInTheDocument();
    expect(getByAltText(/card-logo/i)).toBeInTheDocument();
    act(() => {
      fireEvent.click(card);
    });
    expect(handleShowCardDetails).toBeCalledTimes(1);
  });

  it("Renders Rome Card Template", async () => {
    const handleShowCardDetails = jest.fn();
    const { getByText, getByTestId, getByAltText } = render(
      <Provider store={store}>
        <CredentialCardTemplate
          name="name"
          index={0}
          cardData={shortCredsFix[7]}
          isActive={true}
          onHandleShowCardDetails={() => handleShowCardDetails(0)}
        />
      </Provider>
    );
    const card = getByTestId("rome-template-name-index-0");
    expect(getByText(shortCredsFix[7].credentialType)).toBeInTheDocument();
    expect(
      getByText(formatShortDate(shortCredsFix[7].issuanceDate))
    ).toBeInTheDocument();
    expect(getByAltText(/card-logo/i)).toBeInTheDocument();
    act(() => {
      fireEvent.click(card);
    });
    expect(handleShowCardDetails).toBeCalledTimes(1);
  });
});
