import { combineReducers } from 'redux';
import dim from './dim';
import graph from './graph';
import project from './project';
import { DimensionsRec, GraphProjectRec } from '../models';

export interface RootState {
    dim: DimensionsRec,
    graph: GraphProjectRec
}

const rootReducer = combineReducers<RootState>({
    dim,
    graph,
    project,
});

export default rootReducer;