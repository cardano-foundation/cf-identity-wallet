import { ElementSelector } from '../definitions';

export function findElementIOS({ text }: ElementSelector) {
  if (text) {
    return $(
      `-ios class chain:**/XCUIElementTypeAny[\`label == "${text}" OR value == "${text}"\`]`
    );
  } else {
    throw new Error('Unknown selector strategy');
  }
}
