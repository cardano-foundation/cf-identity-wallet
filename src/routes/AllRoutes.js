//	Main Tabs
import Tab1 from "../../pages/Tab1"
import Tab2 from "../../pages/Tab2";
import Tab3 from "../../pages/Tab3";

//  Side Menus
import { tab1SideMenu, tab2SideMenu, tab3SideMenu } from "../PageSideMenus";

//  Main tab children
import Settings from "../../pages/Settings";

//  Sub pages
import InboxItem from "../../pages/InboxItem";

//	Tab icons
import { personOutline, mailOutline, mapOutline } from "ionicons/icons";

//  Import custom tab menu
import TabMenu from "../TabMenu";
import SubRoutes from "./SubRoutes";

//	Array of objects representing tab pages
//  These will be the main tabs across the app

//  *   PARAMS per tab object   *
//  isTab = true will make the tab appear
//  default = the default tab page to open and be redirected to at "/" 
//  NOTE: there should only be one default tab (default: true)
//  label = the label to show with the tab
//  component = the component related to this tab page
//  icon = icon to show on the tab bar menu
//  path = the path which the tab is accessible
export const tabRoutes = [

    { label: "Profile", component: Tab1, icon: personOutline, path: "/tabs/tab1", default: true, isTab: true, sideMenu: true, sideMenuOptions: tab1SideMenu },
    { label: "Inbox", component: Tab2, icon: mailOutline, path: "/tabs/tab2", default: false, isTab: true, sideMenu: true, sideMenuOptions: tab2SideMenu },
    { label: "Places", component: Tab3, icon: mapOutline, path: "/tabs/tab3", default: false, isTab: true, sideMenu: true, sideMenuOptions: tab3SideMenu }
];

//  Array of objects representing children pages of tabs

//  *   PARAMS per tab object   *
//  isTab = should always be set to false for these
//  component = the component related to this tab page
//  path = the path which the tab is accessible

//  These pages should be related to tab pages and be held within the same path
//  E.g. /tabs/tab1/child
const tabChildrenRoutes = [

    { component: InboxItem, path: "/tabs/tab2/:id", isTab: false },
];

//  Array of objects representing sub pages

//  *   PARAMS per tab object   *
//  component = the component related to this sub page
//  path = the path which the sub page is accessible

//  This array should be sub pages which are not directly related to a tab page
//  E.g. /child
const subPageRoutes = [

    { component: Settings, path: "/settings" },
];

//  Let's combine these together as they need to be controlled within the same IonRouterOutlet
const tabsAndChildrenRoutes = [ ...tabRoutes, ...tabChildrenRoutes ];

//  Render sub routes
export const SubPages = () => ( <SubRoutes routes={ subPageRoutes } /> );

//	Render tab menu
export const Tabs = () => ( <TabMenu tabs={ tabsAndChildrenRoutes } position="bottom" /> );