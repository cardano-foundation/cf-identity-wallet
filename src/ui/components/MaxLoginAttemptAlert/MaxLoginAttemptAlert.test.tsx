import { render, waitFor } from "@testing-library/react";
import { MaxLoginAttemptAlert } from "./MaxLoginAttemptAlert";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

const LOCK_PERIOD = [60, 300, 600, 900, 3600, 14400, 28800];

describe("Max login attempt alert", () => {
  test("Render minute", async () => {
    const { getByTestId } = render(
      <MaxLoginAttemptAlert lockDuration={LOCK_PERIOD[0] * 1000} />
    );

    await waitFor(() => {
      expect(getByTestId("alert-content").innerHTML).toBe(
        EN_TRANSLATIONS.lockpage.attemptalert.content.replace(
          "{{time}}",
          "1 minute"
        )
      );
    });
  });

  test("Render minute2", async () => {
    const { getByTestId } = render(
      <MaxLoginAttemptAlert lockDuration={LOCK_PERIOD[1] * 1000} />
    );

    await waitFor(() => {
      expect(getByTestId("alert-content").innerHTML).toBe(
        EN_TRANSLATIONS.lockpage.attemptalert.content.replace(
          "{{time}}",
          "5 minutes"
        )
      );
    });
  });

  test("Render hour", async () => {
    const { getByTestId } = render(
      <MaxLoginAttemptAlert lockDuration={LOCK_PERIOD[4] * 1000} />
    );

    await waitFor(() => {
      expect(getByTestId("alert-content").innerHTML).toBe(
        EN_TRANSLATIONS.lockpage.attemptalert.content.replace(
          "{{time}}",
          "1 hour"
        )
      );
    });
  });

  test("Render hours", async () => {
    const { getByTestId } = render(
      <MaxLoginAttemptAlert lockDuration={LOCK_PERIOD[6] * 1000} />
    );

    await waitFor(() => {
      expect(getByTestId("alert-content").innerHTML).toBe(
        EN_TRANSLATIONS.lockpage.attemptalert.content.replace(
          "{{time}}",
          "8 hours"
        )
      );
    });
  });

  test("Render hour/minute", async () => {
    const { getByTestId } = render(
      <MaxLoginAttemptAlert lockDuration={5400000} />
    );

    await waitFor(() => {
      expect(getByTestId("alert-content").innerHTML).toBe(
        EN_TRANSLATIONS.lockpage.attemptalert.content.replace(
          "{{time}}",
          "1 hour 30 minutes"
        )
      );
    });
  });

  test("Render defaul text", async () => {
    const { getByTestId } = render(<MaxLoginAttemptAlert lockDuration={0} />);

    await waitFor(() => {
      expect(getByTestId("alert-content").innerHTML).toBe(
        EN_TRANSLATIONS.lockpage.attemptalert.content.replace(
          "{{time}}",
          "1 minute"
        )
      );
    });
  });
});
