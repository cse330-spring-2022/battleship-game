import React from 'react';
import Square from './Square';

class Board extends React.Component {
    renderSquare(label) {
      return <Square isLabel="false" value={label} />;
    }

    renderLabel(label) {
      return <Square isLabel="true" value={label} />;
    }

    render() {
      
      const results = [];
      
      //creating row 1
      results.push(
        <div className="board-row" key={"board_label"}>
              {this.renderLabel(" ")}
              {this.renderLabel("A")}
              {this.renderLabel("B")}
              {this.renderLabel("C")}
              {this.renderLabel("D")}
              {this.renderLabel("E")}
              {this.renderLabel("F")}
              {this.renderLabel("G")}
              {this.renderLabel("H")}
              {this.renderLabel("I")}
              {this.renderLabel("J")}
        </div>
      );

      for(let i = 0; i < 10; i++){
        results.push(
          <div className="board-row" key={"board_" + i}>
            {this.renderLabel(i+1)}
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