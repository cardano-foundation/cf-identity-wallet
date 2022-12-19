
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
                <IonTabs>
                    <IonRouterOutlet>
                        <Route exact path="/tab1">
                            <All />
                        </Route>
                        <Route exact path="/tab2">
                            <All />
                        </Route>
                        <Route path="/tab3">
                            <All />
                        </Route>
                        <Route path="/tab4">
                            <All />
                        </Route>
                        <Route exact path="/">
                            <Redirect to="/tab1" />
                        </Route>
                    </IonRouterOutlet>
                    <IonTabBar slot="bottom">
                        <IonTabButton tab="tab1" href="/tab1">
                            <IonIcon icon={ home } />
                        </IonTabButton>
                        <IonTabButton tab="tab2" href="/tab2">
                            <IonIcon icon={ search } />
                        </IonTabButton>
                        <IonTabButton tab="tab3" href="/tab3">
                            <IonIcon icon={ chatbubble } />
                        </IonTabButton>

                        <IonTabButton tab="tab4" href="/tab4">
                            <IonIcon icon={ person } />
                        </IonTabButton>
                    </IonTabBar>
                </IonTabs>
            </IonReactRouter>
        </IonApp>
    )
};

export default App;
