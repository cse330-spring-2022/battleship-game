import React from 'react';

class Scoreboard extends React.Component {
  
    constructor(props) {
      super(props);
      this.state = {
        own_score: 0,
        opp_score: 0
      };
    }
  
    render() {
        let socketio = this.props.socket;

        const own_score = this.state.own_score; 
        const opp_score = this.state.opp_score;

        socketio.on("hit_to_client", (data) => {
            console.log("hey i got this!!");
            this.setState({
                own_score: data.username.score
            }) 

            console.log(data.username.name + "'s own score is: " + data.username.score);
        });

        socketio.on("sub_to_client", (data) => {
            this.setState({
                opp_score: data.username.score
            }) 
            console.log(data.username.name + "'s own score is hmmm: " + data.username.score);
        })

        if(this.props.start){
            return(
                <div className='scoreboard' key={"scoreboard"}>
                    <p key={"your_score"}>Your score: {this.state.own_score}</p>
                    <p key={"oppenent_score"}>Opponent score: {this.state.opp_score}</p>
                </div>
            )
        }
        else{
            return;
        }
    }
}


export default Scoreboard;