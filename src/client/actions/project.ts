import * as redux from 'redux';
import { createAction, Action } from 'redux-actions';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Dimension, Dimensions } from '../models';
import * as Actions from '../constants/actions';

const setProjectXML = createAction<string, string>(
    Actions.PROJECT_SET_XML,
    (value: string) => value
);

const fetchProjectXML = (): ((dispatch: redux.Dispatch<any>) => void) => {
    return (dispatch: redux.Dispatch<any>) => {
        axios.get('http://localhost:3000/server/projects')
            .then((response: AxiosResponse) => {
                console.log(response);
                dispatch(setProjectXML(response.data.projectXML));
            })
            .catch((error: AxiosError) => {
                console.log(error);
            })
    }
}

export {
    setProjectXML,
    fetchProjectXML,
};
