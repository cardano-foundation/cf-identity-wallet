import React from "react";
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs, IonRouterOutlet } from "@ionic/react";
import { Redirect, Route } from "react-router-dom";

const TabMenu = (props) => {

	return (
		<IonTabs>
			<IonRouterOutlet>

				<Route path="/tabs" exact={true}>
					<Redirect to="/tabs/tab1" />
				</Route>
				{ props.tabs.map((tab, i) => {

					const TabComponent = tab.component;

					if (tab.isTab) {
						return <Route key={ `tab_route_${ i }` } path={ tab.path } render={ (props) => <TabComponent { ...props } /> } exact={ true }/>;
					} else {

						return <Route key={ `child_tab_route_${ i }` } path={ tab.path } render={ (props) => <TabComponent {...props} /> } exact={ false } />;
					}
				})}
			</IonRouterOutlet>

			<IonTabBar slot={ props.position }>

				{ props.tabs.map((tab, i) => {

					if (tab.isTab) {

						return (
							<IonTabButton key={ `tab_button_${ i + 1 }` } tab={ `tab_${ i + 1 }` } href={ tab.path }>
								<IonIcon icon={ tab.icon } />
								{ tab.label && <IonLabel>{ tab.label }</IonLabel> }
							</IonTabButton>
						);
					}
				})}
			</IonTabBar>
		</IonTabs>
	);
}

export default TabMenu;
