import React from 'react';
import Game from './Game';

class Room extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            gamerooms: this.props.game_list,
            joinedRoom: false,
            current_game: null,
            isForfeit: false,
            forfeiter: "",
        };
    }

    render() {

        const results = [];
        let socketio = this.props.socket;
        const joinedRoom = this.state.joinedRoom;
        const current_game = this.state.current_game;

        const isForfeit = this.state.isForfeit;
        const forfeiter = this.state.forfeiter;

        const menu = [];

        menu.push(
            <div className="game_name" key={"game_name"}>
                <label className="labels">Gameroom name: </label>
                <input type="text" placeholder="Type in a name for a game room..." id="room_input" />
                <button id="send_room" onClick={() => socketio.emit("insert_room_to_server", { user: this.props.username, game_name: document.getElementById("room_input").value })}>
                    Create Game Room
                </button>
            </div>
        );

        if (this.state.gamerooms.length > 0) {
            for (let i = 0; i < this.state.gamerooms.length; i++) {
                menu.push(
                    <div className="rooms" key={i}>
                        <p className="room_title">{this.state.gamerooms[i].name}</p>
                        <button className="room_button" onClick={() => socketio.emit("join_room_to_server", { this_game: this.state.gamerooms[i], user: this.props.username })}>Join Game Room</button>
                    </div>
                );
            }
        }

        results.push(
            <div id="menu" key={menu}>
                {menu}
            </div>
        )
        // Inserts a game room into the game list
        socketio.removeAllListeners("insert_room_to_client");
        socketio.on("insert_room_to_client", (data) => {
            this.setState({
                gamerooms: data.game_list
            })
        }) 

        
       
        // Allows a player to join a game room
        socketio.removeAllListeners("join_room_to_client");
        socketio.on("join_room_to_client", (data) => {
            this.setState({
                joinedRoom: true,
                current_game: data.this_game,
                isForfeit: data.isForfeit,
                forfeiter: data.forfeiter,
                hasWon: false,
            })
        })
        
        // Error message is sent when there is an issue
        socketio.removeAllListeners("error_to_client");
        socketio.on("error_to_client", (data) => {
            alert(data.message);
        });
        // Allows player to leave the game room to enter the main room again
        socketio.removeAllListeners("leave_room_to_client");
        socketio.on("leave_room_to_client", (data) => {
            this.setState({
                gamerooms: data.game_list,
                joinedRoom: false, 
                isForfeit: data.isForfeit,
                forfeiter: data.forfeiter,
                hasWon: false
            })
            
        })

      
        if(joinedRoom){
            // If the max number of players are in the game room, a game is in progress
            if(current_game.userlist.length == 2){
                console.log("2 USERS ARE IN THE ROOM");

                return (
                    <Game current_game={current_game} username={this.props.username} socket={socketio}/>
                ) 
                
            }
            else{
                console.log("forfeit state in ROOM is: "+isForfeit);
                if(isForfeit == true){
                    return (
                        <div className="forfeit_game" key={"forfeit"}>
                            <p>You are the Winner! {forfeiter} forfeited.</p>
                            <button className="after_game_leave_button" onClick={() => socketio.emit("leave_room_to_server", { this_game: current_game, user: this.props.username })}>Leave Game Room</button>
                        </div> 
                    )
                }
                else{
                    return (
                    <div className="before_game" key={"leaving"}>
                        <p>Waiting for Other Player to Join ...</p>
                        <button className="before_game_leave_button" onClick={() => socketio.emit("leave_room_to_server", { this_game: current_game, user: this.props.username })}>Leave Game Room</button>
                    </div> 
                    );
                }
            }       
        }

        else{
            return results;
        }

    }
}

export default Room;