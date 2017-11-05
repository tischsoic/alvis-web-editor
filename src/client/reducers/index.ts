import { combineReducers } from 'redux';
import dim from './dim';
import graph from './graph';
import project from './project';
import { DimensionsRec, GraphProjectRec } from '../models';
import {
    IProjectRecord,
} from '../models/project';

export interface RootState {
    dim: DimensionsRec,
    graph: GraphProjectRec,
    project: IProjectRecord,
}

const rootReducer = combineReducers<RootState>({
    dim,
    graph,
    project,
});

export default rootReducer;