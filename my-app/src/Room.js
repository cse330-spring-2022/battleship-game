import React from 'react';
import io from 'socket.io-client'
// let socketio = io.connect();
class Room extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        username: "current_user",
        gamerooms: []
      };
      
    }
  
    render() {
      const results = [];
      let socketio = this.props.socket;
      //document.getElementById("room_input").value
      results.push(
        <div className="game_name" key={"game_name"}>
            <label className="labels">Chatroom name: </label>
            <input type="text" placeholder="Type in a name for a chatroom..." id="room_input"/>
            <button id="send_room" onClick={() => socketio.emit("insert_room_to_server", { user : "current_user", game_name: "pop"}) }>
              Create GameRoom
            </button>
        </div>
      );
  
      socketio.on("login_to_client", (data) => {
        this.setState({
            gamerooms: data.game_list
        })
  
        console.log("game room created, we called it: " + data.game_list[0].name);
      })

  
      if(this.state.gamerooms.length > 0){
        for(let i = 0; i < this.state.gamerooms.length; i++) {
          results.push(
            <div className="rooms" key={i}> 
              <p className="room_title">hey</p>
              <button className="room_button">Join Game Room</button>
            </div>
          );
        }
      }
  
      return results;
      
    }
}

export default Room;