import { Provider } from "react-redux";
import { act, render, waitFor } from "@testing-library/react";
import { ionFireEvent as fireEvent } from "@ionic/react-test-utils";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { store } from "../../../store";
import { CreatePassword } from "./CreatePassword";

describe("Create Password Page", () => {
  test("Renders Create Password page", () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <CreatePassword />
      </Provider>
    );
    const createPasswordValue = getByTestId("createPasswordValue");
    const confirmPasswordValue = getByTestId("createPasswordValue");
    const createHintValue = getByTestId("createPasswordValue");
    expect(createPasswordValue).toBeInTheDocument();
    expect(confirmPasswordValue).toBeInTheDocument();
    expect(createHintValue).toBeInTheDocument();
  });
});
