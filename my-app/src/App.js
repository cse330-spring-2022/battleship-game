import React from 'react';
import io from 'socket.io-client'
import Room from './Room';

//==============================================================================================================================
//Citated from: reactjs.org
let socketio = io.connect();
let current_user = "";


//End of cited work 
//=============================================================================================================================
class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoggedOn: false, 
      username: null,
      gamerooms: []
    };
    
    this.login = this.login.bind(this);
  }

  login(name) {
    // socketio.emit("login_to_server", { username : name });  

    // socketio.removeAllListeners("login_to_client");
    // socketio.on("login_to_client", (data) => {
    //   this.setState({
    //       isLoggedOn: true,
    //       username: name,
    //       gamerooms: data.gamerooms
    //   })

    //   current_user = name;

    //   console.log("heyy the current user is " + current_user);
    // })

    const data = { 'username': name }

    fetch("http://localhost:3001/login", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(function (data) {
          this.setState({
            isLoggedOn: true,
            username: name,
            gamerooms: data.gamerooms
          })
        })
        .catch(err => console.error('Error:', err));
    
    
    socketio.removeAllListeners("error_to_client");
    socketio.on("error_to_client", function (data) {   
      alert(data.message);
      //render_chatrooms();
    });
  }

  render(){
    const isLoggedOn = this.state.isLoggedOn;
    
    if(isLoggedOn) {
      return (
       <Room socket={socketio}/>
      );
    }

    else{
      return (
        <div className="App">
          <label>Username:</label>
          <input id="username" type="text"/>
          <button onClick={() => this.login(document.getElementById("username").value)}> 
            Log on
          </button>
        </div>
      );
    }  
  }
}
//------------------------------------------------------------------------------

//=============================================================================================================================
//More cited work
// ReactDOM.render(
//   <Game />,
//   document.getElementById('root')
// );
//=============================================================================================================================
//end of cited work
export default App;
