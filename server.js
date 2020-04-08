// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 3000);
app.use('/static', express.static(__dirname + '/static'));


// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Add the WebSocket handlers


server.listen(3000, function() {
  console.log('Starting server on port 3000');
});

var whoseTurn = 0;
var players = {};
let playerCount=0;
let maxPlayers=10;
let gameOver=false;
let lastSpin=null;

//console.log("players: "+playerCount);

io.on('connection', function(socket) {
  socket.on('disconnect', function () {
    console.log('A user disconnected'+socket.id);
    if (players[socket.id]){
    playerNumberLeaving = players[socket.id].playerNumber;
      console.log("Leaving: #"+playerNumberLeaving);
      for (var id in players){
        let player = players[id];
        if (player.playerNumber>playerNumberLeaving){
          player.playerNumber--;
        }
      }
      if (playerNumberLeaving==playerCount-1){
        whoseTurn=0;
      }
      delete players[socket.id];
      playerCount--;

    }

   });
  socket.on('new player', function(data) {
    if (playerCount<maxPlayers){
    players[socket.id] = {
      playerNumber:playerCount,
      playerName: data,
      position:0
    };
    playerCount++;
    console.log("pc"+playerCount);
    console.log("id"+socket.id);

  } else {

  console.log("no more players");
  console.log("playerCount: "+playerCount);
}

});



  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x>5?player.x -= 5:player.x -=0;
    }
    if (data.up) {
      player.y>5?player.y -= 5:player.y -=0;
    }
    if (data.right) {
      player.x<1000?player.x += 5:player.x +=0;
    }
    if (data.down) {
      player.y<800?player.y += 5:player.y +=0;
    }
  });



  socket.on('spin', function(){

    if (players[socket.id].playerNumber==whoseTurn){

      console.log("spin");
      let val = Math.floor(Math.random()*80);

      console.log("spin result: "+val);

      switch (true){
        case (val<5):
        console.log('roll 0');
        console.log("pos"+players[socket.id].position);
          players[socket.id].position=0;
          lastSpin=0;
          break;
        case (val>=5 && val<25):
        console.log('roll 1');
        console.log("pos"+players[socket.id].position);
          if (players[socket.id].position<10){
            players[socket.id].position++;
          } else {
            players[socket.id].position = 10;
          };
          lastSpin=1;
          break;
        case (val>=25 && val<40):
        console.log('roll 2');
          if (players[socket.id].position<9){
            players[socket.id].position+=2;
          } else {
            players[socket.id].position = 10;
          };
          lastSpin=2;
          break;
        case (val>=40 && val<50):
        console.log('roll 3');
          if (players[socket.id].position<8){
            players[socket.id].position+=3;
          } else {
            players[socket.id].position = 10;
          };
          lastSpin=3;
          break;
        case (val>=50 && val<57):
        console.log('roll 4');
          if (players[socket.id].position<7){
            players[socket.id].position+=4;
          } else {
            players[socket.id].position = 10;
          };
          lastSpin=4;
          break;
        case (val>=57 && val<69):
        console.log('roll 5');
          if (players[socket.id].position>0){
            players[socket.id].position--;
          } else {
            players[socket.id].position = 0;
          };
          lastSpin=5;
          break;
        case (val>=69 && val<80):
        console.log('roll 6');
          if (players[socket.id].position>1){
            players[socket.id].position-=2;
          } else {
            players[socket.id].position = 0;
          };
          lastSpin=6;
      }

      io.sockets.emit('spinResult',players, whoseTurn, lastSpin);


      if (players[socket.id].position == 10){
        gameOver = !gameOver;
        console.log("game over");
      }

      if (whoseTurn<playerCount-1){
      whoseTurn++;
    } else {
      whoseTurn=0;
    }


    }


  }
  );

socket.on('again', function(){
if (gameOver){
  for (id in players) {
    let player=players[id];
    player.position=0;
  }
  whoseTurn=Math.floor(Math.random()*playerCount);
  gameOver = !gameOver;
}
setTimeout(()=>{
  io.sockets.emit('render');
},500);



});

});

setInterval(function(){
  console.log(players);
  console.log("Who's turn?" + whoseTurn);
  console.log(gameOver?"GAME OVER":"ACTIVE GAME");
}, 3000);



setInterval(function() {
  io.sockets.emit('state', players, playerCount, whoseTurn, gameOver);

}, 1000/60);






// Starts the server.
