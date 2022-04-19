import React from 'react';
import io from 'socket.io-client'
import Room from './components/Room';
import './App.css';


//Citated from: reactjs.org

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

    const data = { 'username': name }

    fetch("http://localhost:3001/login", {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' }
    })
      .then(response => response.json())
      .then((data) => {

        if (data.message === "success") {
          console.log("this login was successful")
          this.setState({
            isLoggedOn: true,
            username: name,
            gamerooms: data.game_list
          })
        }
        
        else {
          alert(data.message);
        }
      })
      .catch(err => console.error('Error:', err));
  }

  render() {
    console.log("render")
    const isLoggedOn = this.state.isLoggedOn;

    if (isLoggedOn) {
      let socketio = io.connect();
      console.log("we are testing here")

      return (
        <Room username={this.state.username} game_list={this.state.gamerooms} socket={socketio} />
      );
    }

    else {
      return (
        <div className="App">
          <label>Username:</label>
          <input id="username" type="text" />
          <button onClick={() => this.login(document.getElementById("username").value)}>
            Log on
          </button>
        </div>
      );
    }
  }
}

export default App;
