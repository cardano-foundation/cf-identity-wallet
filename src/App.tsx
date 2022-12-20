
import React, {useRef, useState} from "react";
import {
    IonApp,
    IonIcon,
    IonRouterOutlet,
    IonSplitPane,
    IonTabBar,
    IonTabButton,
    IonTabs,
    setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { useEffect } from "react";
import Menu from './components/Menu';
import TabMenu from './routes/TabMenu';
import All from './screens/All';
import ActionSheet from './screens/ActionSheet';
import Alert from './screens/Alert';
import Loading from './screens/Loading';
import Modal from './screens/Modal';
import Picker from './screens/Picker';
import Popover from './screens/Popover';
import Toast from './screens/Toast';
import {
    addCircle,
    addCircleOutline,
    chatbubble,
    home, homeOutline, notifications,
    notificationsOutline,
    person,
    personOutline,
    search,
    searchOutline
} from 'ionicons/icons';

setupIonicReact();
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/custom-tab-bar.css';

export const Tabs = () => ( <TabMenu tabs={ [
    { label: "Profile", component: ActionSheet, icon: personOutline, path: "/tabs/tab1", default: true, isTab: true, sideMenu: true, sideMenuOptions: false }
] } position="bottom" /> );

const App = () => {

    const pages = [

        {
            label: "Tabs",
            url: "/tabs",
            component: Tabs
        },

        {
            label: "All",
            url: "/overlay/all",
            component: All
        },
        {
            label: "Action Sheet",
            url: "/overlay/action-sheet",
            component: ActionSheet
        },
        {
            label: "Alert",
            url: "/overlay/alert",
            component: Alert
        },
        {
            label: "Loading",
            url: "/overlay/loading",
            component: Loading
        },
        {
            label: "Modal",
            url: "/overlay/modal",
            component: Modal
        },
        {
            label: "Picker",
            url: "/overlay/picker",
            component: Picker
        },
        {
            label: "Popover",
            url: "/overlay/popover",
            component: Popover
        },
        {
            label: "Toast",
            url: "/overlay/toast",
            component: Toast
        }
    ];

    const tabs = [

        {
            name: "Home",
            url: "/home",
            activeIcon: home,
            icon: homeOutline,
            component: All
        },
        {
            name: "Search",
            url: "/search",
            activeIcon: search,
            icon: searchOutline,
            component: ActionSheet
        },
        {
            name: "Add",
            url: "/add",
            activeIcon: addCircle,
            icon: addCircleOutline,
            component: Alert
        },
        {
            name: "Account",
            url: "/account",
            activeIcon: person,
            icon: personOutline,
            component: Loading
        },
        {
            name: "Notifications",
            url: "/notifications",
            activeIcon: notifications,
            icon: notificationsOutline,
            component: Modal
        }
    ];

    const [ activeTab, setActiveTab ] = useState(tabs[0].name);

    const useIsMounted = () => {
        const isMounted = useRef(false)
        // @ts-ignore
        useEffect(() => {
            isMounted.current = true
            return () => (isMounted.current = false)
        }, [])
        return isMounted
    }

    const isMounted = useIsMounted();

    useEffect(() => {
        const init = async () => {
        }
        if (isMounted.current) {
            // call the function
            init()
                // make sure to catch any error
                .catch(console.error)
        }
    }, [])


    return (
        <IonApp>

            <IonReactRouter>
                <IonSplitPane contentId="main">
                    <Menu pages={ pages } />
                    <IonRouterOutlet id="main">
                        <Route path="/" exact={true}>
                            <Redirect to="/overlay/all" />
                        </Route>
                        <Route path="/tabs" render={ () => <Tabs />} />

                        { pages.map((page, index) => {

                            const pageComponent = page.component;

                            return (

                                <Route key={ index } path={ page.url } exact={ true } component={ pageComponent } />
                            );
                        })}
                    </IonRouterOutlet>
                </IonSplitPane>
            </IonReactRouter>

        </IonApp>
    )
};

export default App;
