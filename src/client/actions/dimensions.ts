import * as redux from 'redux';
import { createAction, Action } from 'redux-actions';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Dimension, Dimensions } from '../models';
import * as Actions from '../constants/actions';

const setXDimension = createAction<Dimension, Dimension>(
    Actions.CHANGE_X_DIM,
    (value: Dimension) => value
);

const getYDimensionFromServer = ():((dispatch: redux.Dispatch<any>) => void) => {
    return (dispatch: redux.Dispatch<any>) => {
        axios.get('http://localhost:3000/server/').then((response: AxiosResponse) => {
            console.log(response);
            dispatch(setYDimension(response.data.asdf));
        })
        .catch((error: AxiosError) => {
            console.log(error);
        })
    }
}

const setYDimension = createAction<Dimension, Dimension>(
    Actions.CHANGE_Y_DIM,
    (value: Dimension) => value
);

export {
    setXDimension,
    setYDimension,
    getYDimensionFromServer
};