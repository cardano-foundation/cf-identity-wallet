
export const returnButtonLocator = (text: string)=> `android=new UiSelector().text("${text}").className("android.widget.Button")`;

export const returnXpathLocator = (id: string)=> `//*[@resource-id="${id}"]`;

export const returnXpathIosLocator = (xcUiElement: string, name: string, hasAChild = true)=> `//${xcUiElement}[@name="${name}"]${hasAChild ? "/*" : ""}`;

export const returnTextViewContainsLocator = (text: string)=> `android=new UiSelector().textContains("${text}").className("android.widget.TextView")`;

export const returnTextViewLocator = (text: string)=> `android=new UiSelector().text("${text}").className("android.widget.TextView")`;

export const returnViewLocator = (text: string)=> `android=new UiSelector().text("${text}").className("android.view.View")`;
