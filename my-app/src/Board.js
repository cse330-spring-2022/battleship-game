import React from 'react';
import Square from './Square';

class Board extends React.Component {
    renderSquare(i) {
      return <Square value={i} />;
    }
    render() {
      
      const results = [];

      for(let i = 0; i < 11; i++){
        results.push(
          <div className="board-row" key={"board_" + i}>
            {this.renderSquare(" ")}
            {this.renderSquare(" ")}
            {this.renderSquare(" ")}
            {this.renderSquare(" ")}
            {this.renderSquare(" ")}
            {this.renderSquare(" ")}
            {this.renderSquare(" ")}
            {this.renderSquare(" ")}
            {this.renderSquare(" ")}
            {this.renderSquare(" ")}
            {this.renderSquare(" ")}
          </div>
        )
      }

      return results;
    }
}

export default Board;