import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSwitcher } from "./LanguageSwitcher";

describe("Users can switch to a different translation", () => {
  test("I can switch between languages", async () => {
    render(<LanguageSwitcher />);
    expect(screen.findByText("Cardano Foundation is the best"));
    fireEvent.click(await screen.findByText("Deutsch"));
    expect(screen.findByText("Die Cardano Foundation ist die beste"));
    fireEvent.click(await screen.findByText("English"));
    expect(screen.findByText("Cardano Foundation is the best"));
  });
});
