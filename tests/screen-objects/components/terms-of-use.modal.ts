import { expect } from "expect-webdriverio";
import { TermsOfUse } from "../../constants/text.constants.js";
import { BaseModal } from "./base.modal.js";

export class TermsOfUseModal extends BaseModal {
  modalName = "terms-of-use";

  async validateSubtitlesAndContent(
    sectionName: string,
    sectionIndex: number,
    sectionLength: number
  ) {
    const sectionLocator = this.returnSectionTitleLocator(
      this.modalName,
      sectionName
    );
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
    await expect(this.introTitle(this.modalName)).toHaveText(TermsOfUse.Title);
    await expect(this.introText(this.modalName)).toHaveText(TermsOfUse.Intro);
    await this.validateSubtitlesAndContent("useofproducts", 1, 7);
    await this.validateSubtitlesAndContent("yourcontent", 2, 5);
    await this.validateSubtitlesAndContent("intellectualproperty", 3, 4);
    await this.validateSubtitlesAndContent(
      "disclaimerslimitationofliability",
      4,
      4
    );
    const section5Locator = this.returnSectionTitleLocator(
      this.modalName,
      "indemnification"
    );
    await expect($(`${section5Locator}`)).toHaveText(TermsOfUse.Section5Title);
    await expect(
      await this.subsectionElement(section5Locator, "content", 1)
    ).toHaveText(TermsOfUse.Section5Content1);
    await this.validateSubtitlesAndContent("miscellaneous", 6, 2);
  }
}

export default new TermsOfUseModal();
