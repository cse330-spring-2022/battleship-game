import React from 'react';
let score = 7;

class Square extends React.Component {

  constructor(props) { 
    super(props); 
    this.state = { 
      isPicked: false,
      gamerooms: this.props.game_list,
      current_game: this.props.current_game,
      username: this.props.username,
      isHit: false,
      isMiss: false,
      isSub: false,
      subVal: "",
      hitVal: "",
      missVal: "",
      pickedVal: "",
      isClicked: false
    } 

    this.pick = this.pick.bind(this);
    this.attack = this.attack.bind(this);
  }

  pick(){ 
    let socketio = this.props.socket;

    socketio.emit("pick_to_server", { user: this.state.username, this_game: this.state.current_game, position: this.props.position})
  }

  attack(){
    let socketio = this.props.socket;
    //let user_index;
    let victim_index;

    if(this.state.current_game.userlist[0].name == this.state.username.name){
      // user_index = 0;
      victim_index = 1;
    }
    else{
      //user_index = 1;
      victim_index = 0;
    }
    
    socketio.emit("attack_to_server", { user: this.state.username, victim_index: victim_index, this_game: this.state.current_game, position: this.props.position});
    
  }

  render() {

    const isLabel = this.props.isLabel;
    let socketio = this.props.socket;
    const isPicked = this.state.isPicked;
    const current_game = this.state.current_game;
    const isHit = this.state.isHit;
    const isMiss = this.state.isMiss;
    const isSub = this.state.isSub;
    const isClicked = this.state.isClicked;
    const username = this.state.username;
    
    socketio.removeAllListeners("pick_to_client");
    socketio.on("pick_to_client", (data) => {
      let pi = this.state.isPicked;
      console.log("position picked: " + data.position);
      console.log("is picked " + pi);
      this.setState({
        isPicked: true,
        pickedVal: data.position,
        current_game: data.this_game,
        username: data.username
      }) 
      console.log("changed " + pi);
    });

    //socketio.removeAllListeners("hit_to_client");
    socketio.on("hit_to_client", (data) => {
      this.setState({
        isClicked: true,
        isHit: true,
        hitVal: data.position,
        current_game: data.this_game,
        username: data.username
      }) 

      console.log(data.username.name + " has a score of: " + data.username.score);
      //score = data.username.score;
    });

    socketio.removeAllListeners("miss_to_client");
    socketio.on("miss_to_client", (data) => {
      this.setState({
        isClicked: true,
        isMiss: true,
        missVal: data.position,
        current_game: data.this_game,
        username: data.username
      }) 
    })

    // duisplay for the actual victim that their ship is lost
    //socketio.removeAllListeners("sub_to_client");
    socketio.on("sub_to_client", (data) => {
      this.setState({
        isClicked: true,
        isSub: true,
        subVal: data.position,
        current_game: data.this_game,
      }) 
    })

    //   console.log(data.username.name + " has a score of: " + data.username.score);
    // });

    if(isLabel === "false"){ 

      if(isPicked){ 
        document.getElementById(this.state.pickedVal).style.backgroundColor = "blue"; 
      }

      if(isHit){ 
        document.getElementById(this.state.hitVal).style.backgroundColor = "green";  
      }

      if(isMiss){
        document.getElementById(this.state.missVal).style.backgroundColor = "red"; 
      }

      if(isSub){
        document.getElementById(this.state.subVal).style.backgroundColor = "gray"; 
      }


      if(this.props.start){
        return (
          <button className="square" id={this.props.position} key={this.props.position} onClick={() => this.attack()}>
            {this.props.value}
          </button>
        );
      }
      else{

        return (
          <button className="square" id={this.props.position} key={this.props.position} onClick={() => this.pick()}>
            {this.props.value}
          </button>
        );
      }
    }
    
    else {
      return (   
        <div className="label" key={this.props.position + "_label"}>
          {this.props.value}
        </div>
      );
    }

  }
}
export default Square;
export { score };