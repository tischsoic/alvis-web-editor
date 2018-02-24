import { createStore, applyMiddleware, Store } from 'redux';
import thunk from 'redux-thunk';
import { logger } from '../middlewares';
import rootReducer, { RootState } from '../reducers';

export function configureStore(initialState?: RootState): Store<RootState> {
  const create = (window as any).devToolsExtension
    ? (window as any).devToolsExtension()(createStore)
    : createStore;

  const createStoreWithMiddleware = applyMiddleware(thunk)(create);

  const store = createStoreWithMiddleware(rootReducer, initialState) as Store<
    RootState
  >;

  if ((module as any).hot) {
    (module as any).hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
