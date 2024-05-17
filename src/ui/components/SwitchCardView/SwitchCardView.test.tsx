import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { CardType } from "../../globals/types";
import { SwitchCardView } from "./SwitchCardView";
import { credsFixAcdc } from "../../__fixtures__/credsFix";

const historyPushMock = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    ...jest.requireActual("react-router-dom").useHistory,
    push: (params: any) => historyPushMock(params),
  }),
}));

describe("Card switch view list Tab", () => {
  test("Renders switch view: identifier", async () => {
    const { getByText, getByTestId } = render(
      <SwitchCardView
        cardTypes={CardType.IDENTIFIERS}
        cardsData={identifierFix}
        title="title"
        name="allidentifiers"
      />
    );

    expect(getByText("title")).toBeInTheDocument();

    await waitFor(() => {
      expect(getByTestId("card-stack")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("list-header-second-icon"));
    });

    expect(getByTestId("card-list")).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId("card-item-" + identifierFix[0].id));
    });

    await waitFor(() => {
      expect(historyPushMock).toBeCalledWith({
        pathname: `/tabs/identifiers/${identifierFix[0].id}`,
      });
    });
  });

  test("Renders switch view: cred", async () => {
    const { getByText, getByTestId } = render(
      <SwitchCardView
        cardTypes={CardType.CREDENTIALS}
        cardsData={credsFixAcdc}
        title="title"
        name="allidentifiers"
      />
    );

    expect(getByText("title")).toBeInTheDocument();

    await waitFor(() => {
      expect(getByTestId("card-stack")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getByTestId("list-header-second-icon"));
    });

    expect(getByTestId("card-list")).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId("card-item-" + credsFixAcdc[0].id));
    });

    await waitFor(() => {
      expect(historyPushMock).toBeCalledWith({
        pathname: `/tabs/creds/${credsFixAcdc[0].id}`,
      });
    });

    act(() => {
      fireEvent.click(getByTestId("list-header-first-icon"));
    });

    await waitFor(() => {
      expect(getByTestId("card-stack")).toBeInTheDocument();
    });
  });
});
