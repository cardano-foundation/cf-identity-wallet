export class AlertModal {
  confirmAlertLocator = "#confirm-alert-button";

  get cancelAlertButton() {
    return $("#cancel-alert-button");
  }

  get confirmAlertButton() {
    return $(this.confirmAlertLocator);
  }

  get confirmAlertButtons() {
    return $$(this.confirmAlertLocator);
  }
}

export default new AlertModal();
