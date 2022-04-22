import React from 'react';
import Board from './Board';
import Room from './Room';
import Scoreboard from './Scoreboard';
import { score } from './Square';
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

      const results = [];
      
      for(let i = 0; i < this.props.current_game.userlist.length; i++){
        results.push(
          <div key={this.props.current_game.userlist[i].name}>{this.props.current_game.userlist[i].name}</div>
        )
      }

      if(start){
        results.push(
          <div className="game" key={"game"}>
                <button className="leave_button" onClick={() => socketio.emit("leave_room_to_server", { this_game: this.props.current_game, user: this.props.username }) }>Leave Game</button>
                <p>The game has started!</p>
                <Scoreboard start={true} socket={socketio}/>
                <div className="game-board">
                  <Board username={this.props.username} current_game={this.props.current_game} socket={socketio} start={true}/>
                </div>
                <div className="game-info">
                  <div>{/* status */}</div>
                </div>
              </div>
        )
      }

      // start is false
      else{
        results.push(
          <div className="game" key={"game"}>
                <button className="leave_button" onClick={() => socketio.emit("leave_room_to_server", { this_game: this.props.current_game, user: this.props.username }) }>Leave Game</button>
                <p>Select the positions of 7 ships by clicking 7 squares. Your opponent is getting ready.</p>
                <Scoreboard start={false} socket={socketio}/>
                <div className="game-board">
                  <Board username={this.props.username} current_game={this.props.current_game} socket={socketio} start={false}/>
                </div>
                <div className="game-info">
                  <div></div>
                </div>
              </div>

        )
      }
      

      return results;
    }
    
  }
}

export default Game;