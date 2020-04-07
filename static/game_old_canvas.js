var socket = io();

var canvas = document.getElementById('canvas');
let widthRatio=1;
console.log("windowWidth"+window.innerWidth);
if (window.innerWidth<800){
  canvas.width = window.innerWidth*.9;
  widthRatio = window.innerWidth/800;
} else {
canvas.width = 800*.9;
}
canvas.height = 800*widthRatio*.9;
var context = canvas.getContext('2d');

const imageURL = ["./static/notrains.svg","./static/1train.svg","./static/2trains.svg","./static/3trains.svg","./static/4trains.svg","./static/less1train.svg","./static/less2trains.svg"]; // list of image URLs
const images = []; /// array to hold images.
var imageCount = 0; // number of loaded images;

// function called once all images have loaded.
function allLoaded(){
    // all images have loaded and can be rendered
    ctx.drawImage(images[1],0,0); // draw background
    ctx.drawImage(images[0],0,0); // draw foreground
}

// iterate each image URL, create, load, and add it to the images array
imageURL.forEach(src => {  // for each image url
     const image = new Image();
     image.src = src;
     image.onload = ()=>{
         imageCount += 1;
         if(imageCount === imageURL.length){ // have all loaded????
             allLoaded(); // call function to start rendering
         }
     }
     images.push(image); // add loading image to images array

});


var playerName = prompt("Please enter your name", "Name");
let showRoll=false;
var movement = {
  up: false,
  down: false,
  left: false,
  right: false
}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});

setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);




socket.emit('new player', playerName);

let sessionID;

socket.on('connect', function() {
  console.log("sid1"+socket.id);
  sessionID = socket.id;
});


var spin = ()=>{
  socket.emit('spin');
  console.log('spin');
}

var playAgain = ()=>{
  socket.emit('again');
  console.log('again');
}

function allLoaded(){
    // all images have loaded and can be rendered
    //ctx.drawImage(images[1],0,0); // draw background
    //ctx.drawImage(images[0],0,0); // draw foreground

socket.on('spinResult', function(players, whoseTurn, result) {
  let playerName;
  showRoll=true;
  for (id in players){
    let player = players[id];
    if (player.playerNumber===whoseTurn){
      playerName = player.playerName;
    }
  }

  let flashImages = setInterval(function(){
    context.clearRect(0, 80, 1000, 800);
    let imageToDraw = images[Math.floor(Math.random()*7)];
    //console.log(imageToDraw);
    context.drawImage(imageToDraw, 350, 200, 300, 300);
    context.font = "75px Verdana";
    context.textAlign = "center";
    context.fillText(playerName+"'s Turn", canvas.width*.5, 700)
    context.fill();
  },50);



  setTimeout(function(){
    clearInterval(flashImages);
    context.clearRect(0, 80, 1000, 800);
    context.drawImage(images[result], 300, 150, 400, 400);
    context.font = "75px Verdana";
    context.textAlign = "center";
    context.fillText(playerName+"'s Turn", canvas.width*.5, 700)
    context.fill();
    setTimeout(function(){
      showRoll=false;
    },1500)

  }, 1000);

});

}




var img = new Image();
img.src = "./static/train.svg";


img.onload = function(){
socket.on('state', function(players, _playerCount, _whoseTurn, _gameOver) {

  if (showRoll==true){
    document.getElementById("spin").disabled = true;
  } else {

  console.log("who's turn? "+_whoseTurn);
  console.log(players[sessionID] && players[sessionID].playerNumber );
  if (players[sessionID] && players[sessionID].playerNumber==_whoseTurn && !_gameOver){
    document.getElementById("spin").disabled = false;
    //console.log("spin should be enabled");
  } else {
    document.getElementById("spin").disabled = true;
    //console.log("spin shoud be disabled");
  };
  if (_gameOver){
    document.getElementById("again").disabled = false;
  } else {
    document.getElementById("again").disabled = true;
  }
  var ul = document.getElementById("playersList");
  while (ul.hasChildNodes()) {
  ul.removeChild(ul.firstChild);
  }

  let activePlayer = players[sessionID];
  delete players[sessionID];
  console.log("Active:");
  console.log(activePlayer);
  console.log("Rest:");
  console.log(players);
  console.log("sid: "+sessionID);
  context.clearRect(0, 0, 1000, 800);
  context.textAlign = "left";
  let yHeight=50;

  context.font = "30px Verdana";
  if (activePlayer && activePlayer.playerNumber==_whoseTurn){
    context.font = "bold 30px Verdana";
  } else {
    context.font = "30px Verdana";
  };
  context.fillText(activePlayer && activePlayer.playerName, 20, yHeight);
  context.fill();
  let activePlayerPosition = activePlayer && activePlayer.position;
  for (let i=0;i<activePlayerPosition;i++){
      context.drawImage(img, (i*60)+200, yHeight-40, 50, 50);
  }
  if (activePlayerPosition==10){
    context.fillText("WINNER!!!", 825, yHeight);
    context.fill();
  }
  yHeight+=80;
  var li = document.createElement("li");

  li.appendChild(document.createTextNode(activePlayer && activePlayer.playerName));

  for (let i=0; i<activePlayerPosition;i++){
    let imgItem = document.createElement("img");
    imgItem.src = "./static/train.svg";
    imgItem.style.height="50px";
    imgItem.style.width="50px";
    li.appendChild(imgItem);
  }
  if (activePlayerPosition==10){
    li.appendChild(document.createTextNode("WINNER"));
  }

  ul.appendChild(li);

  for (var id in players) {
    var player = players[id];
    var li = document.createElement("li");
    //console.log(li);
    li.appendChild(document.createTextNode(player.playerName));
    for (let i=0; i<player.position;i++){
      let imgItem = document.createElement("img");
      imgItem.src = "./static/train.svg";
      imgItem.style.height="50px";
      imgItem.style.width="50px";
      li.appendChild(imgItem);
    }

    ul.appendChild(li);
    if (player.playerNumber==_whoseTurn){
      context.font = "bold 30px Verdana";
    } else {
      context.font = "30px Verdana";
    };

    console.log(player.playerName+" position: "+player.position);
    context.fillText(player.playerName, 20, yHeight);
    context.fill();
    for (let i=0;i<player.position;i++){
        context.drawImage(img, (i*60)+200, yHeight-40, 50, 50);
    }
    if (player.position==10){
      context.fillText("WINNER!!!", 825, yHeight);
      context.fill();
    }
    yHeight+=80;
  }

  if (_gameOver){
    context.font = "100px Verdana";
    context.fillText("GAME OVER", 200, 350);
    context.fill();
  }


}
  });
}



window.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("spin").click();
  }
});
