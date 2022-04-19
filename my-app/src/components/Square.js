import React from 'react';
class Square extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isPicked: false,
      gamerooms: this.props.game_list,
      pickedVal: ""
    }

    this.pick = this.pick.bind(this);
  }

  pick(){
    let socketio = this.props.socket;
    socketio.emit("pick_to_server", { user: this.props.username, this_game: this.props.current_game, position: this.props.position});

  }

  render() {

    const isLabel = this.props.isLabel;
    let socketio = this.props.socket;
    const isPicked = this.state.isPicked;
    
    socketio.removeAllListeners("pick_to_client");
    socketio.on("pick_to_client", (data) => {
      console.log("position picked: " + data.position);

      this.setState({
        isPicked: true,
        pickedVal: data.position

      })

      for(let i = 0; i < data.this_game.movelist.length; i++){
        console.log(data.this_game.movelist[i]);
      }
    });

    if(isLabel === "false"){
      if(isPicked){
        console.log("when picked: " + this.state.pickedVal);
        document.getElementById(this.state.pickedVal).style.backgroundColor = "red";
      }
     
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