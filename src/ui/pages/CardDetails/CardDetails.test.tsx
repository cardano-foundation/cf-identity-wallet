import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { didsMock } from "../../__mocks__/didsMock";
import { store } from "../../../store";
import { CardDetails } from "./CardDetails";
import { TabsRoutePath } from "../../components/navigation/TabsMenu";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

const path = TabsRoutePath.DIDS + "/" + didsMock[0].id;

afterEach(() => {
  jest.restoreAllMocks();
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: didsMock[0].id,
  }),
  useRouteMatch: () => ({ url: path }),
}));

describe("Cards Details page", () => {
  test("It renders Card Details", async () => {
    const { getByText, getByTestId, getAllByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CardDetails}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(getByTestId("card-stack")).toBeInTheDocument();
    expect(getByText(didsMock[0].id)).toBeInTheDocument();
    expect(getByTestId("share-identity-modal").getAttribute("is-open")).toBe(
      "false"
    );
    expect(getByTestId("edit-identity-modal").getAttribute("is-open")).toBe(
      "false"
    );
    expect(getAllByTestId("verify-password")[0].getAttribute("is-open")).toBe(
      "false"
    );
  });

  test("It copies id to clipboard", async () => {
    Clipboard.write = jest
      .fn()
      .mockImplementation(async (text: string): Promise<void> => {
        return;
      });
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(getByTestId("copy-button-id"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({ string: didsMock[0].id });
    });
  });

  test("It copies type to clipboard", async () => {
    Clipboard.write = jest
      .fn()
      .mockImplementation(async (text: string): Promise<void> => {
        return;
      });
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(getByTestId("copy-button-type"));
    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: didsMock[0].keyType,
      });
    });
  });

  test("It copies controller to clipboard", async () => {
    Clipboard.write = jest
      .fn()
      .mockImplementation(async (text: string): Promise<void> => {
        return;
      });
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(getByTestId("copy-button-controller"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: didsMock[0].controller,
      });
    });
  });

  test("It copies publicKeyBase58 to clipboard", async () => {
    Clipboard.write = jest
      .fn()
      .mockImplementation(async (text: string): Promise<void> => {
        return;
      });
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(getByTestId("copy-button-publicKeyBase58"));

    await waitFor(() => {
      expect(Clipboard.write).toHaveBeenCalledWith({
        string: didsMock[0].publicKeyBase58,
      });
    });
  });

  test("It opens the sharing modal", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("share-button"));
    });

    expect(getByTestId("share-identity-modal").getAttribute("is-open")).toBe(
      "true"
    );
  });

  test("It opens the edit modal", async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("edit-button"));
    });

    expect(getByTestId("edit-identity-modal").getAttribute("is-open")).toBe(
      "true"
    );
  });

  test("It shows the editor", async () => {
    const { getByTestId, getAllByText, getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("edit-button"));
    });

    await waitFor(() => {
      expect(getByTestId("edit-identity-edit-button")).toBeInTheDocument();
    });
  });

  test("It deletes the did using the button in the modal", async () => {
    const { getByTestId, getByText, getAllByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("edit-button"));
    });

    await waitFor(() => {
      expect(getByTestId("edit-identity-delete-button")).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(getAllByText(EN_TRANSLATIONS["editidentity.delete"])[0]);
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS["dids.card.details.delete.alert.title"])
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS["dids.card.details.delete.alert.confirm"])
      );
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS["verifypassword.title"])).toBeVisible();
    });
  });

  test("It deletes the did using the big button", async () => {
    const { getByTestId, getByText, queryByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={path}
            component={CardDetails}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("card-details-delete-button"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS["dids.card.details.delete.alert.title"])
      ).toBeVisible();
    });
  });
});
