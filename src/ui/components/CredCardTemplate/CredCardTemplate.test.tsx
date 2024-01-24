import { act, fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { CredCardTemplate } from "./CredCardTemplate";
import { shortCredsFix } from "../../__fixtures__/shortCredsFix";

describe("CredCardTemplate", () => {
  it("renders University Degree Credential", async () => {
    const handleShowCardDetails = jest.fn();
    const { getByText, getByTestId, getByAltText } = render(
      <Provider store={store}>
        <CredCardTemplate
          name="name"
          index={0}
          shortData={shortCredsFix[0]}
          isActive={true}
          onHandleShowCardDetails={() => handleShowCardDetails(0)}
        />
      </Provider>
    );
    const card = getByTestId("cred-card-template-name-index-0");
    expect(getByText("University Degree Credential")).toBeInTheDocument();
    expect(getByText("Bachelor Degree")).toBeInTheDocument();
    expect(getByText("24/01/2024")).toBeInTheDocument();
    expect(card.classList.contains("card-body-generic")).toBe(true);
    expect(getByAltText(/w3c-card-background/i)).toBeInTheDocument();
    expect(getByAltText(/card-logo/i)).toBeInTheDocument();
    act(() => {
      fireEvent.click(card);
    });
    expect(handleShowCardDetails).toBeCalledTimes(1);
  });
  it("renders Access Pass Credential", async () => {
    const handleShowCardDetails = jest.fn();
    const { getByText, getByTestId, getByAltText } = render(
      <Provider store={store}>
        <CredCardTemplate
          name="name"
          index={0}
          shortData={shortCredsFix[1]}
          isActive={true}
          onHandleShowCardDetails={() => handleShowCardDetails(0)}
        />
      </Provider>
    );
    const card = getByTestId("cred-card-template-name-index-0");
    expect(getByText("Access Pass Credential")).toBeInTheDocument();
    expect(getByText("Access Pass")).toBeInTheDocument();
    expect(getByText("02/11/2023 - 02/11/2023")).toBeInTheDocument();
    expect(card.classList.contains("access-pass-credential")).toBe(true);
    expect(getByAltText(/summit-background/i)).toBeInTheDocument();
    expect(getByAltText(/card-logo/i)).toBeInTheDocument();
    expect(document.getElementById("react-qrcode-logo")).toBeInTheDocument;
    act(() => {
      fireEvent.click(card);
    });
    expect(handleShowCardDetails).toBeCalledTimes(1);
  });
  it("renders Permanent Resident Card", async () => {
    const handleShowCardDetails = jest.fn();
    const { getByText, getByTestId, getByAltText } = render(
      <Provider store={store}>
        <CredCardTemplate
          name="name"
          index={0}
          shortData={shortCredsFix[2]}
          isActive={true}
          onHandleShowCardDetails={() => handleShowCardDetails(0)}
        />
      </Provider>
    );
    const card = getByTestId("cred-card-template-name-index-0");
    expect(getByText("Permanent Resident Card")).toBeInTheDocument();
    expect(getByText("John Smith")).toBeInTheDocument();
    expect(getByText("The Bahamas")).toBeInTheDocument();
    expect(getByText("12/12/2025")).toBeInTheDocument();
    expect(getByText("C09")).toBeInTheDocument();
    expect(getByText("10/10/2022")).toBeInTheDocument();
    expect(card.classList.contains("permanent-resident-card")).toBe(true);
    expect(getByAltText(/us-immigration-background/i)).toBeInTheDocument();
    expect(getByAltText(/card-logo/i)).toBeInTheDocument();
    act(() => {
      fireEvent.click(card);
    });
    expect(handleShowCardDetails).toBeCalledTimes(1);
  });
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
    expect(card.classList.contains("card-body-generic")).toBe(true);
    expect(getByAltText(/card-logo/i)).toBeInTheDocument();
    act(() => {
      fireEvent.click(card);
    });
    expect(handleShowCardDetails).toBeCalledTimes(1);
  });
});
