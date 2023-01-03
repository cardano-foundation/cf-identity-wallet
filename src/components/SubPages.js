import { Route } from "react-router-dom";

const SubPages = (props) => {

	return (
            <>
                { props.routes.map((route, i) => {

                    const RouteComponent = route.component;

                    return <Route key={ i } path={ route.path } render={ (props) => <RouteComponent { ...props } /> } exact={ false } />;
                })}
            </>
	);
}

export default SubPages;