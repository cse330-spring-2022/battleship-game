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
    this.easy = false;

}

// Making a user object
function User(name){
    this.name = name;
    this.movelist = [];
    this.ships = [];
    this.correct_ships = [];
    this.score = 0;
    this.ready = false;
    this.socket = "";
}

// The array of gamerooms
let gamerooms = [];

// The array of allowed users
let allowed_users = [];

//TODO: FIGURE OUT SENDING DATA WITH REQ AND REQ STUFF
app.post('/login', (req, res) => {

    let user = req.body.username;

    if(user == ""){
        let msg = "User can't be blank!";
        res.json({ message: msg });
        return;
    }

    let new_user = new User(user);

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

    socket.join(userId);
    socket.join("not_in_a_game");

    // When it gets this message, it inserts a new room to the added to the gameroom
    socket.on('insert_room_to_server', function (data) {

        if(data["game_name"] == ""){
            let msg = "Game Room can't be blank!";
            io.sockets.to(userId).emit("error_to_client", { message: msg });
            return;
        }

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
            let msg = "Game Room with that name already exists!";
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

        let victim_index = data["victim_index"];

        for(let i = 0; i < gamerooms[game_index].userlist[victim_index].ships.length; i++){
            if(gamerooms[game_index].userlist[victim_index].ships[i] == data["position"]){

                
                if(!gamerooms[game_index].userlist[user_index].correct_ships.includes(data["position"])){
                    gamerooms[game_index].userlist[user_index].correct_ships.push(data["position"]);
                    gamerooms[game_index].userlist[user_index].score++;
                }
                
                if(gamerooms[game_index].userlist[user_index].score == 7){
                    winner = gamerooms[game_index].userlist[user_index].name;
                    hasWon = true;

                    console.log("WE HAVE A WINNER: " + winner);
                }
                
                let victimId = gamerooms[game_index].userlist[victim_index].socket;

                io.sockets.to(userId).emit("hit_to_client", { username: gamerooms[game_index].userlist[user_index], 
                    this_game: gamerooms[game_index], position: data["position"]});
                io.sockets.to(victimId).emit("sub_to_client", { username: gamerooms[game_index].userlist[user_index], 
                    this_game: gamerooms[game_index], position: data["position"]});

                if(hasWon){
                    gamerooms[game_index].userlist[user_index].ships = [];
                    gamerooms[game_index].userlist[user_index].correct_ships = [];
                    gamerooms[game_index].userlist[user_index].ready = false;
                    gamerooms[game_index].userlist[user_index].score = 0;
                    gamerooms[game_index].userlist[user_index].movelist = [];
                    
                    // deletes the game room when the user has won
                    gamerooms.splice(game_index, 1);

                    //send to everybody in the room that there is a win
                    io.in(`${data["this_game"].name}`).socketsJoin("not_in_a_game");
                    io.sockets.to(`${data["this_game"].name}`).emit("win_to_client", { winner: winner, game_list: gamerooms });
                    io.in(`${data["this_game"].name}`).socketsLeave(`${data["this_game"].name}`);
                }

                return;
            }
        }

        
        let position_letter = data["position"][0];
        let index = 0;
        //Citation for ascii conversion: https://www.techiedelight.com/character-to-ascii-code-javascript/
        let ascii = position_letter.charCodeAt(index);
        console.log("position_letter is: " + position_letter + ". the character val is: " + ascii);

        let position = data["position"];
        //Citation for regex: https://stackoverflow.com/questions/10003683/how-can-i-extract-a-number-from-a-string-in-javascript
        let position_num = position.replace(/\D/g, "");
        console.log("this is position_num: " + position_num); 

        for(let i = 0; i < gamerooms[game_index].userlist[victim_index].ships.length; i++){ 
            
            let ship_position = gamerooms[game_index].userlist[victim_index].ships[i];
            let ship_position_num = ship_position.replace(/\D/g, "");

            let ship_position_letter = gamerooms[game_index].userlist[victim_index].ships[i][0]
            let ship_index = 0;
            let ship_ascii = ship_position_letter.charCodeAt(ship_index);

            // calculates what it's going to be for a close horizontal miss
            if(ship_position_letter == position_letter){
                if(Math.abs(position_num - ship_position_num) == 1){
                    console.log("this is 1 off and should be yellow for horizontal");
                    // send out the updated list of the game and the list of gamerooms
                    io.sockets.to(userId).emit("close_to_client", { username: gamerooms[game_index].userlist[user_index], 
                        this_game: gamerooms[game_index], position: data["position"]});
                    return;
                }
            }

            // calculates what it's going to be for a close vertical miss
            else if(ship_position_num == position_num){
                if(Math.abs(ship_ascii - ascii) == 1){
                    console.log("this is 1 off and should be yellow for vertical");
                    // send out the updated list of the game and the list of gamerooms
                    io.sockets.to(userId).emit("close_to_client", { username: gamerooms[game_index].userlist[user_index], 
                        this_game: gamerooms[game_index], position: data["position"]});
                    return;
                }
            }
        }
        let victimId = gamerooms[game_index].userlist[victim_index].socket;
        // send out the updated list of the game and the list of gamerooms
        io.sockets.to(userId).emit("miss_to_client", { username: gamerooms[game_index].userlist[user_index], 
            this_game: gamerooms[game_index], position: data["position"]});
        io.sockets.to(victimId).emit("opponent_miss_to_client", { username: gamerooms[game_index].userlist[user_index], 
            this_game: gamerooms[game_index], position: data["position"]});
    });

});