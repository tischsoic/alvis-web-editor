import { handleActions, Action } from 'redux-actions';
import { Dimension, Dimensions, DimensionsRec, GraphProject, GraphProjectRec } from '../models';
import * as Actions from '../constants/actions';

const initialState: GraphProjectRec = new GraphProjectRec({
    xml: null
});

export default handleActions<GraphProjectRec, string>({
    [Actions.GRAPH_PROJECT_SET_XML]: (state: GraphProjectRec, action: Action<string>): GraphProjectRec => {
        console.log("reducers graph:" );
        console.log(action.payload)
        return <GraphProjectRec> state.set('xml', action.payload);
    }
}, initialState)