import * as redux from 'redux';
import { createAction, Action } from 'redux-actions';
import axios, { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
import * as Actions from '../constants/appActions';

const openApp = createAction<boolean, boolean>(
    Actions.APP_OPEN_APP,
    (value: boolean) => value
);

const setBearerToken = createAction<string, string>(
    Actions.APP_SET_BEARER_TOKEN,
    (value: string) => value
);

const setDuringSigningIn = createAction<boolean, boolean>(
    Actions.APP_SET_DURING_SIGNINGIN,
    (value: boolean) => value
);

const setDuringRegistration = createAction<boolean, boolean>(
    Actions.APP_SET_DURING_SIGNINGIN,
    (value: boolean) => value
);

const signIn = (email: string, password: string): ((dispatch: redux.Dispatch<any>) => AxiosPromise) => {
    return (dispatch: redux.Dispatch<any>): AxiosPromise => {
        dispatch(setDuringSigningIn(true));

        const promise = axios.post('http://localhost:3000/server/auth', {
            email, password
        });

        promise
            .then((response: AxiosResponse) => {
                console.log(response);

                const responseData = response.data,
                    success = responseData.success,
                    message = responseData.message,
                    token = responseData.token;

                if (success) {
                    dispatch(setBearerToken(token));
                    dispatch(openApp(true));
                }
                dispatch(setDuringSigningIn(false));
            })
            .catch((error: AxiosError) => {
                console.log(error);

                dispatch(setDuringSigningIn(false));
            });

        return promise;
    }
}

export {
    openApp,
    setBearerToken, setDuringSigningIn, setDuringRegistration,
    signIn,
};
