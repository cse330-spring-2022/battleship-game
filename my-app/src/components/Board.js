import React from 'react';
import Square from './Square';

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.renderSquare = this.renderSquare.bind(this);
    this.renderLabel = this.renderLabel.bind(this);
  }

  renderSquare(label, position) {
    console.log("WE ARE IUN BOARD AND THE VALUE OF START IS: " + this.props.start);
    return <Square username={this.props.username} isLabel="false" value={label} 
                   position={position} current_game={this.props.current_game} 
                   socket={this.props.socket} start={this.props.start}/>;
  }

  renderLabel(label) {
    return <Square isLabel="true" value={label} socket={this.props.socket}/>;
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