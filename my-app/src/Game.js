import React from 'react';
import Board from './Board';
import Room from './Room';
class Game extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      gamerooms: this.props.game_list,
      leftroom: false
    };
  }

  render() {
    let socketio = this.props.socket;
    const leftroom = this.state.leftroom;

    socketio.removeAllListeners("leave_room_to_client");
    socketio.on("leave_room_to_client", (data) => {
      this.setState({
        gamerooms: data.game_list,
        leftroom: true
      })
    })

    if(leftroom){
      return (
        <Room username={this.props.username} game_list={this.state.gamerooms} socket={socketio} />
      )
    }

    else{
      return (
            <div className="game" key={"game"}>
              <button className="leave_button" onClick={() => socketio.emit("leave_room_to_server", { this_game: this.props.current_game, user: this.props.username }) }>Leave Game</button>
              <div className="game-board">
                <Board />
              </div>
              <div className="game-info">
                <div>{/* status */}</div>
                <ol>{/* TODO */}</ol>
              </div>
            </div>
      );
    }
    
  }
}

export default Game;