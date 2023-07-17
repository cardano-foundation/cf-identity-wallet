export interface ElementActionOptions {
  /**
   * How long to wait (in ms) for the element to be visible before
   * the test fails. Default: 5000 ms
   */
  visibilityTimeout?: number;
}

export interface ElementSelector {
  text?: string;
}
