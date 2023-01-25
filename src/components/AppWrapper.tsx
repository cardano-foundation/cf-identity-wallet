import {setupIonicReact} from '@ionic/react';
import React, {useEffect, useRef} from 'react';
import CardanoModule from '../lib/CardanoModule';
import {useTranslation} from 'react-i18next';
import {CardanoApi} from "../lib/ CardanoAPI";

const AppWrapper = (props: {children: any}) => {
	const {t, i18n} = useTranslation();

	const useIsMounted = () => {
		const isMounted = useRef(false);

		// @ts-ignore
		useEffect(() => {
			isMounted.current = true;
			return () => (isMounted.current = false);
		}, []);
		return isMounted;
	};

	const isMounted = useIsMounted();

	useEffect(() => {
		const init = async () => {
			await initApp();
		};
		if (isMounted.current) {
			// call the function
			init()
				// make sure to catch any error
				.catch(console.error);
		}
	}, []);

	const initApp = async () => {};

	useEffect(() => {
		const init = async () => {

			await CardanoApi.init();

			// Init Redux
		};
		if (isMounted.current) {
			// call the function
			init()
				// make sure to catch any error
				.catch(console.error);
		}
	}, []);

	return (
		<div
			id="appWrapper"
			data-theme="light">
			{props.children}
		</div>
	);
};

export default AppWrapper;
