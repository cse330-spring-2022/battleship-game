import React from 'react';
import Board from './Board';
import Room from './Room';
class Game extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      gamerooms: this.props.game_list,
      leftroom: false,
      start: false
    };

  }

  
    
  

  render() {
    let socketio = this.props.socket;
    const leftroom = this.state.leftroom;
    const start = this.state.start;

    socketio.removeAllListeners("leave_room_to_client");
    socketio.on("leave_room_to_client", (data) => {
      // when you leave all the board is cleared visually
      // for(let i = 0; i < document.getElementsByClassName("square").length; i++){
      //   document.getElementsByClassName("square")[i].style.backgroundColor = "white";
      // }

      this.setState({
        gamerooms: data.game_list,
        leftroom: true
      })
    })

    socketio.removeAllListeners("ready_to_client");
    socketio.on("ready_to_client", (data) => {
     console.log("START GAME");
      this.setState({
        start: true
      })
    });

    if(leftroom){
      return (
        <Room username={this.props.username} game_list={this.state.gamerooms} socket={socketio} />
      )
    }
    else{
      
      if(start){
        console.log("the game started!!!");
      }

      const results = [];
      
      for(let i = 0; i < this.props.current_game.userlist.length; i++){
        results.push(
          <div key={this.props.current_game.userlist[i].name}>{this.props.current_game.userlist[i].name}</div>
        )
      }

      results.push(
        <div className="game" key={"game"}>
              <button className="leave_button" onClick={() => socketio.emit("leave_room_to_server", { this_game: this.props.current_game, user: this.props.username }) }>Leave Game</button>
              <p>Select the positions of 7 ships by clicking 7 squares</p>
              <div className="game-board">
                <Board username={this.props.username} current_game={this.props.current_game} socket={socketio}/>
              </div>
              <div className="game-info">
                <div>{/* status */}</div>
                <ol>{/* TODO */}</ol>
              </div>
            </div>

      )
      

      return results;
    }
    
  }
}

export default Game;