import React from 'react';
import {Route} from 'react-router-dom';

const SubRoutes = (props) => {
	return (
		<>
			{props.routes.map((route, i) => {
				const RouteComponent = route.component;

				return (
					<Route
						key={i}
						path={route.path}
						render={(props) => (
							<RouteComponent
								{...props}
								sideMenu={route.sideMenu ? true : false}
								sideMenuOptions={
									route.sideMenuOptions ? route.sideMenuOptions : false
								}
							/>
						)}
						exact={false}
					/>
				);
			})}
		</>
	);
};

export default SubRoutes;
