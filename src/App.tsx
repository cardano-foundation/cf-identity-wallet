
import React, {useRef} from "react";
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
import All from './screens/All';
import ActionSheet from './screens/ActionSheet';
import Alert from './screens/Alert';
import Loading from './screens/Loading';
import Modal from './screens/Modal';
import Picker from './screens/Picker';
import Popover from './screens/Popover';
import Toast from './screens/Toast';
import { chatbubble, home, person, search } from 'ionicons/icons';

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

const App = () => {

    const pages = [

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
