import { fireEvent, render } from "@testing-library/react";import { act } from "react";
import { Provider } from "react-redux";
import { CredentialCardTemplate } from "./CredentialCardTemplate";
import { store } from "../../../store";
import { shortCredsFix } from "../../__fixtures__/shortCredsFix";
import { formatShortDate } from "../../utils/formatters";


describe("Credential Card Template", () => {
  it("Renders Rare Evo Card Template", async () => {
    const handleShowCardDetails = jest.fn();
    const { getByText, getByTestId, getByAltText } = render(
      <Provider store={store}>
        <CredentialCardTemplate
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
});
