import * as React from "react";
import {fromJS} from "immutable";
import * as _ from "underscore";

export interface GameBoardProps { m: number, n: number }
export interface GameBoardState {  }


export class GameBoard extends React.Component<GameBoardProps, GameBoardState> {
    constructor(props: GameBoardProps) {
        super(props);
        this.state = {compiler: "asdf"};
    }
    render(): JSX.Element {
        const {m, n} = this.props;

        const rows = _.range(m).map<JSX.Element>((m: number) => {
            const cells = _.range(n).map<JSX.Element>((n: number) => {
                return <div key={n} className="cell"></div>
            });

            return <div key={m} className="row"> { cells } </div>;
        });

        return <div className="board"> {rows} </div>;
    }
}