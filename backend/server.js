// // Require the packages we will use:
// const { Console } = require("console");
const http = require("http"),
    fs = require("fs");
// const port = 3000;

// const file = "my-app/public/index.html";
// // Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html, on port 3456:
// const server = http.createServer(function (req, res) {
//     // This callback runs when a new connection is made to our HTTP server.

//     fs.readFile(file, function (err, data) {
//         // This callback runs when the client.html file has been read from the filesystem.

//         if (err) return res.writeHead(500);
//         res.writeHead(200);
//         res.end(data);
//     });
// });

//const client = require("./my-app/public/index");

const express = require('express');
const app = express()

//TODO: FIGURE OUT SENDING DATA WITH REQ AND REQ STUFF
app.get('/login', (req, res) => {

    // let id = socket.id;
    let new_user = new User(data["username"]);

    if(!allowed_users.includes(new_user.name)){
        allowed_users.push(new_user.name);

        socket.join(`${data["username"]}`); 
        socket.join("not_in_a_Game");

        io.sockets.to(data["username"]).emit("login_to_client", { game_list: gamerooms, username: new_user}) // broadcast the message to other users  
    }

    else{
        let msg = "User already exists!";
        io.sockets.to(id).emit("error_to_client", { message: msg });
    }

    console.log(data["username"] + " ");

  res.send("he")
})

const server = app.listen(3001)

// server.listen(port);

// Import Socket.IO and pass our HTTP server object to it.
const socketio = require("socket.io")(http, {
    wsEngine: 'ws'
});

const io = socketio.listen(server);

// Here define the Gameroom object
function Gameroom(owner, name){
    this.name = name;
    this.owner = owner;
    this.userlist = [];
    this.banned_userlist = [];
    this.password = "";

    this.join_room = function(user) {
        this.userlist.push(user);
    }
}

function User(name, socket_id){

    // The name of the user
    this.name = name;

    // The socket id of each user
    this.socket_id = socket_id;

    this.is_kicked = 0;
}

// The array of gamerooms
let gamerooms = [];

// The array of allowed users
let allowed_users = [];


io.sockets.on("connection", function (socket) {
    console.log("connected");

    // When it gets this message, it creates a new user to be added to the Gameroom
    socket.on('login_to_server', function (data) { 
    
        let id = socket.id;
        let new_user = new User(data["username"], id);

        if(!allowed_users.includes(new_user.name)){
            allowed_users.push(new_user.name);

            socket.join(`${data["username"]}`); 
            socket.join("not_in_a_Game");

            io.sockets.to(data["username"]).emit("login_to_client", { game_list: gamerooms, username: new_user}) // broadcast the message to other users  
        }

        else{
            let msg = "User already exists!";
            io.sockets.to(id).emit("error_to_client", { message: msg });
        }

        console.log(data["username"] + " " + id)
    });

    // When it gets this message, it inserts a new room to the added to the chatroom
    socket.on('insert_room_to_server', function (data) {

        console.log("insert room");
        //Creates a chat room
        let default_gameroom = new Gameroom(data["user"], data["game_name"]);

        //Sets the password to the specified password variable
        default_gameroom.password = data["password"];

        // Iterate through the list of gamerooms and if it already exists then alert the user of that
        let match = false;
        for(let i = 0; i < gamerooms.length; i++){
            if(gamerooms[i].name == default_gameroom.name){
                match = true;
            }
        }

        // If the chtroom exists, then alert the user
        if(match){
            let msg = "Chatroom with that name already exists!";
            io.sockets.to(data["user"].socket_id).emit("error_to_client", { message: msg });
        }
        else{
            // Adds to list of gamerooms
            gamerooms.push(default_gameroom);

            // Emit this mesage to everyone not currently in a chat
            io.sockets.to("not_in_a_chat").emit("insert_room_to_client", { game_list: gamerooms, username: data["user"]}); // broadcast the message to other users
        }
        
    });
});