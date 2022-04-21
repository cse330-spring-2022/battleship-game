import React from 'react';
class Square extends React.Component {

  constructor(props) { 
    super(props); 
    this.state = { 
      isPicked: false,
      gamerooms: this.props.game_list,
      current_game: this.props.current_game,
      username: this.props.username,
      pickedVal: ""
    } 

    this.pick = this.pick.bind(this);
  }

  pick(){ 
    let socketio = this.props.socket;
    socketio.emit("pick_to_server", { user: this.state.username, this_game: this.state.current_game, position: this.props.position}); 
  }

  render() {

    const isLabel = this.props.isLabel;
    let socketio = this.props.socket;
    const isPicked = this.state.isPicked;
    const current_game = this.state.current_game;
    const username = this.state.username;
 
    
    socketio.removeAllListeners("pick_to_client");
    socketio.on("pick_to_client", (data) => {
      console.log("position picked: " + data.position);

      // if they haven't picked 7
      //if(!data["status"]){
        this.setState({
          isPicked: true,
          pickedVal: data.position,
          current_game: data.this_game,
          username: data.username
        })
      //}

      // when it's ready
      //else{
      // if(data.username.ships.length == 7){
      //   this.setState({
      //     isPicked: false,
      //     pickedVal: "",
      //     current_game: data.this_game,
      //     username: data.username
      //   })  
      // }

      //console.log("this.props.username = " + this.props.username.name + " data.username = " + data.username.name);
      
      //data.username.movelist.push(data.position);
      
      
    });

    socketio.removeAllListeners("display_to_client");
    
    socketio.on("display_to_client", (data) => {
     //console.log("position picked: " + data.position);
     if(!data["status"]){
        this.setState({
          isPicked: true,
          pickedVal: data.position

        })
      }
    });

 
   
    if(isLabel === "false"){ 

      if((current_game.userlist[0].ready == true) && (current_game.userlist[1].ready == true)){
        console.log("this.props.current_game.userlist[0].ready = " + current_game.userlist[0].ready);
        console.log("this.props.current_game.userlist[1].ready = " + current_game.userlist[1].ready);

        // socketio.emti
      }

      if(isPicked){ 
        console.log("we picked something");
        console.log("pickedVAL: " + this.state.pickedVal);
        document.getElementById(this.state.pickedVal).style.backgroundColor = "red"; 

        for(let i = 0; i < username.ships.length; i++){
          console.log(username.name + " picked: " + username.ships[i]);
        }

        // if(username.ships.length == 7){
        //  document.getElementById(this.state.pickedVal).style.backgroundColor = "gray"; 
        //   //  this.setState({
        //   //   isPicked: false,
        //   //   pickedVal: ""
        //   //  }}
          

        //   console.log("YO WE REACHED TH ELIMIT");
        // }
      }
      // else{
      //   console.log("when not picked in the else: " + this.props.position);
      //   document.getElementById(this.props.position).style.backgroundColor = "white";
      // }\

      return (
        <button className="square" id={this.props.position} key={this.props.position} onClick={() => this.pick()}>
          {this.props.value}
        </button>
      );
    }
    else {
      console.log("in the else: " + this.props.position);
      // this.setState({
      //   isPicked: false,
      //   pickedVal: ""
      // })

      // document.getElementById(this.state.pickedVal).style.backgroundColor = "white";
      return (   
        <div className="label" key={this.props.position + "_label"}>
          {this.props.value}
        </div>
      );
    }

  }
}

export default Square;