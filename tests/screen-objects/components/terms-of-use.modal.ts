import { expect } from "expect-webdriverio";
import { TermsOfUse } from "../../constants/text.constants.js";

export class TermsOfUseModal {
  get closeButton() {
    return $("[data-testid=\"close-button\"]");
  }

  get introText() {
    return $("[data-testid=\"terms-of-use-modal-intro-text\"]");
  }

  get introTitle() {
    return $("[data-testid=\"termsofuse\"]");
  }

  returnSectionTitleLocator = (sectionName: string) =>
    `[data-testid="terms-of-use-modal-section-${sectionName}"`;

  async subsectionElement(locator: string, type: string, index: number) {
    return $(`${locator.slice(0, -1)}-${type}-${index}` + "\"]");
  }

  async validateSectionText(
    sectionName: string,
    sectionIndex: number,
    sectionLength: number
  ) {
    const sectionLocator = this.returnSectionTitleLocator(sectionName);
    await expect($(`${sectionLocator}`)).toHaveText(
      TermsOfUse[`Section${sectionIndex}Title` as keyof typeof TermsOfUse]
    );
    for (let i = 1; i <= sectionLength; i++) {
      await expect(
        await this.subsectionElement(sectionLocator, "subtitle", i)
      ).toHaveText(
        TermsOfUse[
          `Section${sectionIndex}Subtitle${i}` as keyof typeof TermsOfUse
        ]
      );
      await expect(
        await this.subsectionElement(sectionLocator, "content", i)
      ).toHaveText(
        TermsOfUse[
          `Section${sectionIndex}Content${i}` as keyof typeof TermsOfUse
        ]
      );
    }
  }

  async loads() {
    await expect(this.introTitle).toHaveText(TermsOfUse.Title);
    await expect(this.introText).toHaveText(TermsOfUse.Intro);
    await this.validateSectionText("useofproducts", 1, 7);
    await this.validateSectionText("yourcontent", 2, 5);
    await this.validateSectionText("intellectualproperty", 3, 4);
    await this.validateSectionText("disclaimerslimitationofliability", 4, 4);
    const section5Locator = this.returnSectionTitleLocator("indemnification");
    await expect($(`${section5Locator}`)).toHaveText(TermsOfUse.Section5Title);
    await expect(
      await this.subsectionElement(section5Locator, "content", 1)
    ).toHaveText(TermsOfUse.Section5Content1);
    await this.validateSectionText("miscellaneous", 6, 2);
  }
}

export default new TermsOfUseModal();
