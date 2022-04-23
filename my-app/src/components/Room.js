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
            hasWon: false,
            winner: ""
        };
    }

    render() {

        console.log("this is the username we want: " + this.props.username.name);

        const results = [];
        let socketio = this.props.socket;
        const joinedRoom = this.state.joinedRoom;
        const current_game = this.state.current_game;

        const isForfeit = this.state.isForfeit;
        const forfeiter = this.state.forfeiter;

        const hasWon = this.state.hasWon;

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
            this.setState({
                joinedRoom: true,
                current_game: data.this_game,
                isForfeit: data.isForfeit,
                forfeiter: data.forfeiter
            })
        })
        
        
        socketio.removeAllListeners("error_to_client");
        socketio.on("error_to_client", (data) => {
            alert(data.message);
        });

        socketio.removeAllListeners("leave_room_to_client");
        socketio.on("leave_room_to_client", (data) => {
            this.setState({
                gamerooms: data.game_list,
                joinedRoom: false, 
                isForfeit: data.isForfeit,
                forfeiter: data.forfeiter
            })

            if(this.state.hasWon == true){
                this.setState({
                    hasWon: false
                })
            }
        })

        socketio.removeAllListeners("win_to_client");
        socketio.on("win_to_client", (data) => {
            this.setState({
                hasWon: true,
                winner: data.winner
            })
        })

        if(joinedRoom){

            if(hasWon){
                return(
                    <div className="win_game" key={"win"}>
                        <p>{this.state.winner} has won!</p>
                        <button className="after_game_leave_button" onClick={() => socketio.emit("leave_room_to_server", { this_game: current_game, user: this.props.username })}>Leave Game Room</button>
                    </div> 
                )
            }

            else if(current_game.userlist.length == 2){
                console.log("2 USERS ARE IN THE ROOM");
                return (
                    <Game current_game={current_game} username={this.props.username} socket={socketio}/>
                ) 
                
            }
            else{
                console.log("forfeit state in ROOM is: "+isForfeit);
                if(isForfeit == true && hasWon == false){
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