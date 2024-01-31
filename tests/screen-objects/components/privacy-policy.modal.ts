import { expect } from "expect-webdriverio";
import { PrivacyPolicy } from "../../constants/text.constants.js";
import { BaseModal } from "./base.modal.js";

export class PrivacyPolicyModal extends BaseModal {
  modalName = "privacy-policy";

  async validateSectionContent(
    sectionName: string,
    sectionIndex: number,
    sectionLength: number
  ) {
    const sectionLocator = this.returnSectionTitleLocator(
      this.modalName,
      sectionName
    );
    await expect($(`${sectionLocator}`)).toHaveText(
      PrivacyPolicy[`Section${sectionIndex}Title` as keyof typeof PrivacyPolicy]
    );
    for (let i = 1; i <= sectionLength; i++) {
      await expect(
        await this.subsectionElement(sectionLocator, "content", i)
      ).toHaveText(
        PrivacyPolicy[
          `Section${sectionIndex}Content${i}` as keyof typeof PrivacyPolicy
        ]
      );
    }
  }

  async loads() {
    await expect(this.introTitle(this.modalName)).toHaveText(
      PrivacyPolicy.Title
    );
    await expect(this.introText(this.modalName)).toHaveText(
      PrivacyPolicy.Intro
    );
    await this.validateSectionContent("datacontrollerandcontactdetails", 1, 1);
    await this.validateSectionContent("typesofdatacollected", 2, 6);
    await this.validateSectionContent("howwecollectyourpersonaldata", 3, 5);
    await this.validateSectionContent("useofpersonaldata", 4, 6);
    await this.validateSectionContent("datasecurityandtransfer", 5, 4);
    await this.validateSectionContent("retention", 6, 4);
    await this.validateSectionContent("datadisclosure", 7, 11);
    await this.validateSectionContent("yourrights", 8, 10);
    await this.validateSectionContent("thirdpartylinks", 9, 2);
    await this.validateSectionContent("changes", 10, 2);
    await this.validateSectionContent("dataprivacycontact", 11, 1);
  }
}

export default new PrivacyPolicyModal();
