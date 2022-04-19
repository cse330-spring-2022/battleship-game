import React from 'react';
import Game from './Game';

class Room extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            gamerooms: this.props.game_list,
            joinedRoom: false,
            current_game: null
        };
    }

    render() {

        console.log("this is the username we want: " + this.props.username);

        const results = [];
        let socketio = this.props.socket;
        const joinedRoom = this.state.joinedRoom;
        const current_game = this.state.current_game;

        results.push(
            <div className="game_name" key={"game_name"}>
                <label className="labels">Gameroom name: </label>
                <input type="text" placeholder="Type in a name for a chatroom..." id="room_input" />
                <button id="send_room" onClick={() => socketio.emit("insert_room_to_server", { user: this.props.username, game_name: document.getElementById("room_input").value })}>
                    Create Gameroom
                </button>
            </div>
        );

        socketio.removeAllListeners("insert_room_to_client");
        socketio.on("insert_room_to_client", (data) => {
            this.setState({
                gamerooms: data.game_list
            })
        })


        if (this.state.gamerooms.length > 0) {
            for (let i = 0; i < this.state.gamerooms.length; i++) {
                results.push(
                    <div className="rooms" key={i}>
                        <p className="room_title">{this.state.gamerooms[i].name}</p>
                        <button className="room_button" onClick={() => socketio.emit("join_room_to_server", { this_game: this.state.gamerooms[i], user: this.props.username })}>Join Game Room</button>
                    </div>
                );
            }
        }
        
        socketio.removeAllListeners("join_room_to_client");
        socketio.on("join_room_to_client", (data) => {

            // // when you leave all the board is cleared visually
            // for(let i = 0; i < document.getElementsByClassName("square").length; i++){
            //     document.getElementsByClassName("square")[i].style.backgroundColor = "white";
            // }

            console.log("this user: " + data.username + " joined this chat: " + data.this_game.name);

            this.setState({
                joinedRoom: true,
                current_game: data.this_game
            })
        })

        socketio.removeAllListeners("error_to_client");
        socketio.on("error_to_client", (data) => {
            alert(data.message);
        });

        if(joinedRoom){
            return (
                <Game current_game={current_game} username={this.props.username} socket={socketio}/>
            )
        }

        else{
            return results;
        }

    }
}

export default Room;