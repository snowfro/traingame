var socket = io();

var canvas = document.getElementById('canvas');

  canvas.width = 300;
  canvas.height = 350;

var context = canvas.getContext('2d');


const imageURL = ["./static/notrains.svg","./static/1train.svg","./static/2trains.svg","./static/3trains.svg","./static/4trains.svg","./static/less1train.svg","./static/less2trains.svg","./static/train.svg"]; // list of image URLs
const images = []; /// array to hold images.
var imageCount = 0; // number of loaded images;


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
const trainImages = []; /// array to hold images.
var trainImageCount = 0;

for (let i=0;i<20;i++){
  const image = new Image();
  image.src = "./static/train.svg";
  image.onload = ()=>{
      trainImageCount += 1;
      if(trainImageCount ==20){ // have all loaded????
          trainsLoaded(); // call function to start rendering
      }
      trainImages.push(image);

    }
  }

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
  //console.log("sid1"+socket.id);
  sessionID = socket.id;
});


var spin = ()=>{
  socket.emit('spin');
  //console.log('spin');
}

var playAgain = ()=>{
  socket.emit('again');
  //console.log('again');
}

function allLoaded(){


  context.clearRect(0, 0, 300, 350);
  context.drawImage(images[7], 0, 50, 300, 300);
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
    context.clearRect(0, 0, 300, 350);
    let imageToDraw = images[Math.floor(Math.random()*7)];
    //console.log(imageToDraw);
    context.drawImage(imageToDraw, 50, 50, 200, 200);
    context.font = "30px Verdana";
    context.textAlign = "center";
    context.fillText(playerName+"'s Turn", canvas.width*.5, 335)
    context.fill();
  },50);



  setTimeout(function(){
    clearInterval(flashImages);
    context.clearRect(0, 0, 300, 350);
    context.drawImage(images[result], 0, 0, 300, 300);
    context.font = "30px Verdana";
    context.textAlign = "center";
    context.fillText(playerName+"'s Turn", canvas.width*.5, 335)
    context.fill();
    setTimeout(function(){
      showRoll=false;
    },1000)

  }, 1500);

});

}


function trainsLoaded(){
socket.on('state', function(players, _playerCount, _whoseTurn, _gameOver) {


  if (showRoll==true){
    document.getElementById("spin").disabled = true;
  } else {

  //console.log("who's turn? "+_whoseTurn);
  //console.log(players[sessionID] && players[sessionID].playerNumber );
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


  let activePlayer = players[sessionID];
  delete players[sessionID];
  console.log("Active:");
  console.log(activePlayer);
  console.log("Rest:");
  console.log(players);
  //console.log("sid: "+sessionID);

  let activePlayerPosition = activePlayer && activePlayer.position;

  let playerListDiv = document.getElementById('playerListDiv');
  while (playerListDiv.hasChildNodes()) {
  playerListDiv.removeChild(playerListDiv.firstChild);
  }

  var activePlayerListDiv = document.createElement("div");
  activePlayerListDiv.setAttribute("class","alert alert-secondary");
  activePlayerListDiv.setAttribute("role","alert");
  playerListDiv.appendChild(activePlayerListDiv);

  var activePlayerName = document.createElement("p");
  activePlayerName.setAttribute("class","alert-heading");
  activePlayerName.innerHTML = activePlayer && activePlayer.playerName;
  activePlayerListDiv.appendChild(activePlayerName);
  activePlayerListDiv.appendChild(document.createElement("hr"));

  let activePlayerPlaceholder = document.createElement("h6");
  activePlayerPlaceholder.setAttribute("class","mt-2");
  activePlayerPlaceholder.setAttribute("style","height:25")
  activePlayerListDiv.appendChild(activePlayerPlaceholder);


  for (let i=0; i<activePlayerPosition;i++){
    let trainImage = trainImages[i+10];
    trainImage.setAttribute("class","img");
    trainImage.style.height="40px";
    trainImage.style.width="40px";
    activePlayerPlaceholder.appendChild(trainImage);
  }



  if (activePlayerPosition==10){
    activePlayerListDiv.setAttribute("class","alert alert-success");
    activePlayerPlaceholder.appendChild( document.createTextNode( '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0' ) );
    activePlayerPlaceholder.appendChild(document.createTextNode("WINNER"));
    if (_gameOver){
      context.clearRect(0, 0, 300, 350);
      context.font = "30px Verdana";
      context.textAlign = "center";
      context.fillText("GAME OVER", 150, 175);
      context.fillText(activePlayer.playerName+" wins!", 150, 225);

      context.fill();
    }
  }

  if (activePlayer && activePlayer.playerNumber==_whoseTurn){
    activePlayerListDiv.setAttribute("class","alert alert-primary");
  }



  for (var id in players) {
    var player = players[id];
    //console.log(players);

    var inactivePlayerListDiv = document.createElement("div");
    inactivePlayerListDiv.setAttribute("class","alert alert-secondary");
    inactivePlayerListDiv.setAttribute("role","alert");
    playerListDiv.appendChild(inactivePlayerListDiv);

    var inactivePlayerName = document.createElement("p");
    inactivePlayerName.setAttribute("class","alert-heading");
    inactivePlayerName.innerHTML = player.playerName;
    inactivePlayerListDiv.appendChild(inactivePlayerName);
    inactivePlayerListDiv.appendChild(document.createElement("hr"));

    let inactivePlayerPlaceholder = document.createElement("h6");
    inactivePlayerPlaceholder.setAttribute("class","mt-2");
    inactivePlayerPlaceholder.setAttribute("style","height:25")
    inactivePlayerListDiv.appendChild(inactivePlayerPlaceholder);

    for (let i=0; i<player.position;i++){

      let trainImage = trainImages[i];

      trainImage.setAttribute("class","img");
      trainImage.style.height="40px";
      trainImage.style.width="40px";

      inactivePlayerPlaceholder.appendChild(trainImage);
    }
    if (player.position==10){
      inactivePlayerListDiv.setAttribute("class","alert alert-success");
      inactivePlayerPlaceholder.appendChild(document.createTextNode( '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0' ));
      inactivePlayerPlaceholder.appendChild(document.createTextNode("WINNER"));
      if (_gameOver){
        context.clearRect(0, 0, 300, 350);
        context.font = "30px Verdana";
        context.textAlign = "center";
        context.fillText("GAME OVER", 150, 1750);context.fillText(activePlayer.playerName+" wins!", 150, 225);

        context.fill();
      }
    }

    if (player.playerNumber==_whoseTurn){
      inactivePlayerListDiv.setAttribute("class","alert alert-primary");
    }

}


}});

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
