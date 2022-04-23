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

const max_ships = 7;

// Here define the Gameroom object
function Gameroom(owner, name){
    this.name = name;
    this.owner = owner;
    this.userlist = [];

    //contains the moves list as a list of postiions
    this.movelist = [];

}

function User(name){
    this.name = name;
    this.movelist = [];
    this.ships = [];
    this.score = 0;
    this.ready = false;
    this.socket = "";
}

// The array of gamerooms
let gamerooms = [];

// The array of allowed users
let allowed_users = [];

//let current_user;


//TODO: FIGURE OUT SENDING DATA WITH REQ AND REQ STUFF
app.post('/login', (req, res) => {

    let user = req.body.username;

    //console.log("THIS IS THE USERNAME " + user);
    let new_user = new User(user);
    //current_user = new_user;
   // console.log("the surrent user has been set to: " + current_user.name);

    if(!allowed_users.includes(new_user.name)){
        allowed_users.push(new_user.name);

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
    //console.log("this is the user id " + userId);
    socket.join(userId);
    socket.join("not_in_a_game");

    // When it gets this message, it inserts a new room to the added to the gameroom
    socket.on('insert_room_to_server', function (data) {
        //socket.join("not_in_a_game");
        console.log("insert room of: " + data["user"].name + " with the name: " + data["game_name"]);
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

        // If the chatroom exists, then alert the user
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
      
        //  Clears the shiplist
        data["user"].ships = [];
        data["user"].socket = userId;


        // If it's not currently in the user list then add it
        if(!gamerooms[final].userlist.includes(data["user"]) && gamerooms[final].userlist.length < 2){
             // When a user joins a room they are not in a game
            socket.leave("not_in_a_game");
            gamerooms[final].userlist.push(data["user"]);
            io.sockets.to(data["this_game"].name).emit("join_room_to_client", { this_game: gamerooms[final], 
                game_list: gamerooms, username: data["user"]});
        }
        else{
            let msg = "The limit for users in a game has already been met";
            io.sockets.to(userId).emit("error_to_client", { message: msg });
        }
    });


    // When it gets this message, it delets the user from the gameroom's userlist
    socket.on('leave_room_to_server', function(data) {

        //console.log("this user: " + data["user"] + " is leaving this game: " + data["this_game"].name)
        socket.join("not_in_a_game");

        let index_game = 0;
        let index_user = 0;
        let index_user_second = 0;

        let game_index = -1;
        let user_index = -1;

        let forfeit = false;

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
                    if(user.name == data["user"].name){
                        user_index = index_user_second;
                        return;
                    }
                    index_user_second++;
                })     
            }
            index_user++;
        })

        if(gamerooms[game_index].userlist.length == 2){
            forfeit = true;
        }

        //console.log("the state of forfeit is : " + forfeit);

        if(game_index != -1 || user_index != -1 ){
            gamerooms[game_index].userlist.splice(user_index, 1); // remove number using index
        }


        socket.leave(`${data["this_game"].name}`);

        // People still in the game would rejoin as if nothing ahnges
        io.sockets.to(`${data["this_game"].name}`).emit("join_room_to_client", { this_game: gamerooms[game_index], 
            game_list: gamerooms, isForfeit: forfeit, forfeiter: data["user"].name }); // broadcast the message to other users

        // the specific user has to leave
        io.sockets.to(userId).emit("leave_room_to_client", { game_list: gamerooms, isForfeit: forfeit, forfeiter: data["user"].name }); // broadcast the message to other users
    });

    // When it gets this message, it delets the user from the gameroom's userlist
    socket.on('leave_all_to_server', function(data) {

        console.log("leave allll")

        socket.join("not_in_a_game");

        let index_game = 0;

        let game_index = -1;

        //Gets the index of the game that we want to delete the user from
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game_index = index_game;
                return;
            }
            index_game++;
        })

        gamerooms[game_index].userlist = [];

        console.log("current game: " + data["this_game"].name);
        console.log("the user list: " + gamerooms[game_index].userlist[0]);

        //gamerooms.splice(game_index, 1);
        
        // the specific user has to leave
        io.sockets.to(`${data["this_game"].name}`).emit("leave_all_to_client", { game_list: gamerooms }); // broadcast the message to other users
       // socket.leave(`${data["this_game"].name}`);
    });


    socket.on('pick_to_server', function(data) {

        
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

        //Gets the index of the user we wnat to delete for the userlist in the specific chatroom
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game.userlist.forEach(function(user){
                    if(user.name == data["user"].name){
                        user_index = index_user_second;
                        return;
                    }
                    index_user_second++;
                })     
            }
            index_user++;
        })

        
        // Checks if the limit of ships picked is reached
        let isLimitReached = false;
        //console.log("this is the name of the user when picked: " + data["user"].name);

        if(gamerooms[game_index].userlist[user_index].ships.length == max_ships){
          //
          return;
        }

        // If the number of ships that the user has picked is less than 7, then add to the array
        if(gamerooms[game_index].userlist[user_index].ships.length < max_ships){
            if(!gamerooms[game_index].userlist[user_index].ships.includes(data["position"])){
                gamerooms[game_index].userlist[user_index].ships.push(data["position"]);
            }
        }

        if(gamerooms[game_index].userlist[user_index].ships.length == max_ships){
                    gamerooms[game_index].userlist[user_index].ready = true;
                    isLimitReached = true;
            if((gamerooms[game_index].userlist[0].ready == true) && (gamerooms[game_index].userlist[1].ready == true)){
                
                let msg = "Both players are ready";
                //console.log(msg);
                io.sockets.to(`${data["this_game"].name}`).emit("ready_to_client", { message: msg });
            }
            
        }

        //console.log("ready status of: " +  gamerooms[game_index].userlist[user_index].name + " is " + gamerooms[game_index].userlist[user_index].ready);
       
        //console.log("the value of isLimitReached: " + isLimitReached);

        
        // send out the updated list of the game and the list of gamerooms
        io.sockets.to(userId).emit("pick_to_client", { username: gamerooms[game_index].userlist[user_index], 
            this_game: gamerooms[game_index], position: data["position"], status: isLimitReached });

    
    });

    socket.on('attack_to_server', function(data) {

        let index_game = 0;
        let index_user = 0;
        let index_user_second = 0;

        let game_index = -1;
        let user_index = -1;

        let winner = "";
        let hasWon = false;

        //Gets the index of the game that we want to delete the user from
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game_index = index_game;
                return;
            }
            index_game++;
        })

        //Gets the index of the user we wnat to delete for the userlist in the specific chatroom
        gamerooms.forEach(function(game){
            if(game.name == data["this_game"].name){
                game.userlist.forEach(function(user){
                    if(user.name == data["user"].name){
                        user_index = index_user_second;
                        return;
                    }
                    index_user_second++;
                })     
            }
            index_user++;
        })

        //console.log("this is the name of the user when picked: " + data["user"].name);

        let victim_index = data["victim_index"];

        for(let i = 0; i < gamerooms[game_index].userlist[victim_index].ships.length; i++){
            if(gamerooms[game_index].userlist[victim_index].ships[i] == data["position"]){

                gamerooms[game_index].userlist[user_index].score++;
                if(gamerooms[game_index].userlist[user_index].score == 7){
                   
                    winner = gamerooms[game_index].userlist[user_index].name;
                    hasWon = true;

                    console.log("WE HAVE A WINNER: " + winner);
                }

                gamerooms[game_index].userlist[victim_index].ships.splice(i, 1); // remove number using index
                
                let victimId = gamerooms[game_index].userlist[victim_index].socket;

                io.sockets.to(userId).emit("hit_to_client", { username: gamerooms[game_index].userlist[user_index], 
                    this_game: gamerooms[game_index], position: data["position"]});
                io.sockets.to(victimId).emit("sub_to_client", { username: gamerooms[game_index].userlist[user_index], 
                    this_game: gamerooms[game_index], position: data["position"]});

                if(hasWon){
                    gamerooms[game_index].userlist[user_index].ships = [];
                    gamerooms[game_index].userlist[user_index].ready = false;
                    gamerooms[game_index].userlist[user_index].score = 0;
                    gamerooms[game_index].userlist[user_index].movelist = [];
                    
                    gamerooms.splice(game_index, 1);

                    
                    io.in(`${data["this_game"].name}`).socketsJoin("not_in_a_game");
                    io.sockets.to(`${data["this_game"].name}`).emit("win_to_client", { winner: winner, game_list: gamerooms });
                    io.in(`${data["this_game"].name}`).socketsLeave(`${data["this_game"].name}`);
                }

                return;
            }
        }

        
        // send out the updated list of the game and the list of gamerooms
        io.sockets.to(`${data["this_game"].name}`).emit("miss_to_client", { username: gamerooms[game_index].userlist[user_index], 
            this_game: gamerooms[game_index], position: data["position"]});

     

    });



});