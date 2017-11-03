import { Record } from 'immutable';
export type Dimension = number;

export type Dimensions = {
    xDim: Dimension,
    yDim: Dimension
};

export class DimensionsRec extends Record({xDim: 0, yDim: 0}) {
    xDim: Dimension;
    yDim: Dimension;

    constructor(params: Dimensions) {
        params ? super(params) : super();
    }

    with(values: Dimensions) {
        return this.merge(values) as this;
    }
}

export type GraphProject = {
    xml: Dimension,
};

export class GraphProjectRec extends Record({xml: null}) {
    xml: string;

    constructor(params: GraphProject) {
        params ? super(params) : super();
    }

    with(values: GraphProject) {
        return this.merge(values) as this;
    }
}