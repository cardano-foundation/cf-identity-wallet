import Store from '.';

export const setAccount = (account) => {
	Store.update((s) => {
		s.account = account;
	});
};

export const setAccountHistory = (history) => {
	Store.update((s) => {
		s.account.history = history;
	});
};

export const setIsDarkTheme = (isDark) => {
	Store.update((s) => {
		s.settings = {
			...s.settings,
			darkTheme: isDark,
		};
	});
};

export const setSettings = (settings) => {
	Store.update((s) => {
		s.settings = settings;
	});
};

export const setPlatform = (platform) => {
	Store.update((s) => {
		s.platform = platform;
	});
};

export const setCurrentPath = ({path, payload}) => {
	Store.update((s) => {
		s.router.history = [...s.router.history, s.router.currentPath];
		s.router.currentPath = path;
		s.router.payload = payload;
	});
};
export const setLanguage = (lang) => {
	Store.update((s) => {
		s.settings.language = lang;
	});
};

export const setBlockfrostUrl = (url) => {
	Store.update((s) => {
		s.settings.network.blockfrost = {
			...s.settings.network.blockfrost,
			url,
		};
	});
};
export const setBlockfrostToken = (token) => {
	Store.update((s) => {
		s.settings.network.blockfrost = {
			...s.settings.network.blockfrost,
			token,
		};
	});
};
export const setBlockfrostNetwork = (net) => {
	Store.update((s) => {
		s.settings.network = {
			...s.settings.network,
			net,
		};
	});
};

export const setSubmitUrl = (url) => {
	Store.update((s) => {
		s.settings.network = {
			...s.settings.network,
			submit: url,
		};
	});
};
