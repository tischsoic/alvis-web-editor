import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import { configureStore } from './store';

import { App } from './containers/App'
import { Hello } from "./components/Hello";
import { GameBoard } from "./components/GameBoard";

const store = configureStore();

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("game-container")
);

if ((module as any).hot) {
  (module as any).hot.accept()
}

