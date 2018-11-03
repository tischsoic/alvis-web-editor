import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { configureStore } from './store';

import { AppContainer } from './containers/App';
import { BrowserRouter } from 'react-router-dom';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter basename="/client">
      <AppContainer />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);

if ((module as any).hot) {
  (module as any).hot.accept();
}
