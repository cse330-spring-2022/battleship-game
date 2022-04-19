import React from 'react';
import Square from './Square';

class Board extends React.Component {
    renderSquare(label, position) {
      return <Square isLabel="false" value={label} position={position}/>;
    }

    renderLabel(label) {
      return <Square isLabel="true" value={label} />;
    }

    render() {
      
      const results = [];
      const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
      //const numbers = ["1", "2", "3", "4", "5", "6", ]
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
            {this.renderSquare(" ", letters[0] + (i+1))}
            {this.renderSquare(" ", letters[1] + (i+1))}
            {this.renderSquare(" ", letters[2] + (i+1))}
            {this.renderSquare(" ", letters[3] + (i+1))}
            {this.renderSquare(" ", letters[4] + (i+1))}
            {this.renderSquare(" ", letters[5] + (i+1))}
            {this.renderSquare(" ", letters[6] + (i+1))}
            {this.renderSquare(" ", letters[7] + (i+1))}
            {this.renderSquare(" ", letters[8] + (i+1))}
            {this.renderSquare(" ", letters[9] + (i+1))}
          </div>
        )
      }

      return results;
    }
}

export default Board;