import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { Settings } from "./Settings";
import { store } from "../../../store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { OperationType } from "../../globals/types";

describe("Settings page", () => {
  test("Renders Settings page", () => {
    store.dispatch(setCurrentOperation(OperationType.SHOW_SETTINGS));
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Settings />
      </Provider>
    );

    expect(getByTestId("settings-page")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.security.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.security.changepin)
    ).toBeInTheDocument();
    expect(
      getByText(
        EN_TRANSLATIONS.settings.sections.security.manageoperationspassword
      )
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.security.seedphrase)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.contact)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.troubleshooting)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.learnmore)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.terms)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.settings.sections.support.version)
    ).toBeInTheDocument();
  });
});
