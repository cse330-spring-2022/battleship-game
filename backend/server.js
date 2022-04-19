const http = require("http"),
    fs = require("fs");

const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors())

const server = app.listen(3001)

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
    //contains the moves list as a list of postiions
    this.movelist = [];

    this.join_room = function(user) {
        this.userlist.push(user);
    }
}

// The array of gamerooms
let gamerooms = [];

// The array of allowed users
let allowed_users = [];


//TODO: FIGURE OUT SENDING DATA WITH REQ AND REQ STUFF
app.post('/login', (req, res) => {

    let user = req.body.username;

    console.log("THIS IS THE USERNAME " + user);
    let new_user = user;

    if(!allowed_users.includes(new_user)){
        allowed_users.push(new_user);

        res.json({ message: "success" , game_list: gamerooms, username: new_user });
    }

    else{
        let msg = "User already exists!";
        res.json({ message: msg });
    }

    
})

io.sockets.on("connection", function (socket) {
    console.log("connected");

    let userId = socket.id;
    console.log("this is the user id " + userId);
    socket.join(userId);
    socket.join("not_in_a_game");

    // When it gets this message, it inserts a new room to the added to the gameroom
    socket.on('insert_room_to_server', function (data) {
        //socket.join("not_in_a_game");
        console.log("insert room of: " + data["user"] + " with the name: " + data["game_name"]);
        //Creates a game room
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
            let msg = "Gameroom with that name already exists!";
            io.sockets.to(userId).emit("error_to_client", { message: msg });
        }
        else{
            // Adds to list of gamerooms
            gamerooms.push(default_gameroom);

            // Emit this mesage to everyone not currently in a game
            io.sockets.to("not_in_a_game").emit("insert_room_to_client", { game_list: gamerooms, username: data["user"]}); // broadcast the message to other users
        }
    });

    // Joins the room ands displays the user list
    socket.on('join_room_to_server', function (data) {
       
        socket.join(`${data["this_game"].name}`);

        // Calculating the final index to use to find the specific game
        let index = 0;
        let final = -1;

        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                final = index;
                return;
            }
            index++;
        })

        // If it's not currently in the user list then add it
        if(!gamerooms[final].userlist.includes(data["user"]) && gamerooms[final].userlist.length < 2){
             // When a user joins a room they are not in a game
            socket.leave("not_in_a_game");
            gamerooms[final].userlist.push(data["user"]);
            io.sockets.to(data["this_game"].name).emit("join_room_to_client", { this_game: gamerooms[final], game_list: gamerooms, username: data["user"] });
        }
        else{
            let msg = "The limit for users in a game has already been met";
            io.sockets.to(userId).emit("error_to_client", { message: msg });
        }
    });


    // When it gets this message, it delets the user from the gameroom's userlist
    socket.on('leave_room_to_server', function(data) {

        console.log("this user: " + data["user"] + " is leaving this game: " + data["this_game"].name)
        socket.join("not_in_a_game");

        let index_game = 0;
        let index_user = 0;
        let index_user_second = 0;

        let game_index = -1;
        let user_index = -1;

        //Gets the index of the game that we want to delete the user from
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game_index = index_game;
                return;
            }
            index_game++;
        })

        //Gets the index of the user we wnat to delete for the userlist in the specific gameroom
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game.userlist.forEach(function(user){
                    if(user == data["user"]){
                        user_index = index_user_second;
                        return;
                    }
                    index_user_second++;
                })     
            }
            index_user++;
        })

        if(game_index != -1 || user_index != -1 ){
            gamerooms[game_index].userlist.splice(user_index, 1); // remove number using index
        }

        socket.leave(`${data["this_game"].name}`);

        // People still in the game would rejoin as if nothing ahnges
        io.sockets.to(`${data["this_game"].name}`).emit("join_room_to_client", { this_game: gamerooms[game_index], game_list: gamerooms }); // broadcast the message to other users

        // the specific user has to leave
        io.sockets.to(userId).emit("leave_room_to_client", { game_list: gamerooms }); // broadcast the message to other users
    });


    socket.on('pick_to_server', function(data) {

        // Calculating the final index to use to find the specific game
        let index = 0;
        let final = -1;

        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                final = index;
                return;
            }
            index++;
        })

        console.log("the position is " + data["position"]);

        // if the moveslist doesn't contain the move, then add it
        if(!gamerooms[final].movelist.includes(data["position"])){
            //pushes the move to the array of moves
            gamerooms[final].movelist.push(data["position"]);
        }

        // send out the updated list of the game and the list of gamerooms
        io.sockets.to(`${data["this_game"].name}`).emit("pick_to_client", { this_game: gamerooms[final], game_list: gamerooms, position: data["position"]});


    });



});