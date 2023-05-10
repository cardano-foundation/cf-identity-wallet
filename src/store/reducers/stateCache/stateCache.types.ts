interface PayloadData<T = any> {
    [key: string]: T;
}
interface CurrentRouteCacheProps {
    path: string;
    payload?: { [key: string]: PayloadData };
}

interface AuthenticationCacheProps {
    loggedIn: boolean;
    time: number;
    passcodeIsSet: boolean;
}

interface StateCacheProps {
    routes: CurrentRouteCacheProps[];
    authentication: AuthenticationCacheProps;
}

export type {
    PayloadData,
    CurrentRouteCacheProps,
    AuthenticationCacheProps,
    StateCacheProps
}
