import { Store } from 'redux';
import { RootState } from '../reducers';
import { Action } from 'redux-actions';
import { APP_INITIALIZE, APP_SET_BEARER_TOKEN } from '../constants/appActions';
import { getServerPublicApi } from '../serverApi';
import { setBearerToken, setDuringSigningIn, openApp } from '../actions/app';

const localStorageTokenKey = 'token';

export default function loggerMiddleware(store: Store<RootState>) {
  return (next: any) => (action: Action<void | string>) => {
    const { dispatch } = store;

    switch (action.type) {
      case APP_INITIALIZE:
        try {
          const token = localStorage.getItem(localStorageTokenKey);
          const publicApi = getServerPublicApi();

          dispatch(setDuringSigningIn(true));

          publicApi.verifyToken(token).then(
            () => {
              dispatch(setBearerToken(token));
              dispatch(openApp(true));
              dispatch(setDuringSigningIn(false));
            },
            () => {
              dispatch(setDuringSigningIn(false));
            },
          );
        } catch {
          return next(action);
        }
        break;
      case APP_SET_BEARER_TOKEN:
        try {
          const token = <string>action.payload;

          localStorage.setItem(localStorageTokenKey, token);
        } catch {
          return next(action);
        }
        break;
    }

    return next(action);
  };
}
