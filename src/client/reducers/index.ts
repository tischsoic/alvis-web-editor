import { combineReducers } from 'redux';
import app from './app';
import project from './project';
import { IProjectRecord } from '../models/project';
import { IAppRecord } from '../models/app';

export interface RootState {
    app: IAppRecord,
    project: IProjectRecord,
}

const rootReducer = combineReducers<RootState>({
    app,
    project,
});

export default rootReducer;