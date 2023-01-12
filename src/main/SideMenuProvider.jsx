import React, {useContext, useState} from 'react';

const SideMenuContext = React.createContext();
const SideMenuUpdateContext = React.createContext();

export function useSideMenu() {
	return useContext(SideMenuContext);
}

export function useSideMenuUpdate() {
	return useContext(SideMenuUpdateContext);
}

export function SideMenuProvider({children}) {
	const [sideMenuOptions, setSideMenuOptions] = useState({
		options: [],
		side: '',
		pageName: '',
	});

	const setSideMenu = (menuOptions) => {
		setSideMenuOptions(menuOptions);
	};

	return (
		<SideMenuContext.Provider value={sideMenuOptions}>
			<SideMenuUpdateContext.Provider value={setSideMenu}>
				{children}
			</SideMenuUpdateContext.Provider>
		</SideMenuContext.Provider>
	);
}
