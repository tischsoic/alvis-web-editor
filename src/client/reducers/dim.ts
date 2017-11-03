import { handleActions, Action } from 'redux-actions';
import { Dimension, Dimensions, DimensionsRec } from '../models';
import * as Actions from '../constants/actions';

const initialState: DimensionsRec = new DimensionsRec({
    xDim: 1,
    yDim: 1
});

export default handleActions<DimensionsRec, Dimension>({
    [Actions.CHANGE_X_DIM]: (state: DimensionsRec, action: Action<Dimension>): DimensionsRec => {
        return <DimensionsRec> state.set('xDim', action.payload);
    },

    [Actions.CHANGE_Y_DIM]: (state: DimensionsRec, action: Action<Dimension>): DimensionsRec => {
        return <DimensionsRec> state.set('yDim', action.payload);
    }
}, initialState)