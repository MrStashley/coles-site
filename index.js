const express = require('express') //Imports express dependency
const path = require('path') //Imports Path dependency

const port = process.env.PORT || 3000;

const app = express() //Creates express object
const http = require('http').Server(app);
app.set('views', path.join(__dirname,'views')) //sets views path to views file
app.set('view engine', 'mustache')// sets views engine to mustache
app.engine('mustache', require('hogan-middleware').__express) //sets up hogan middle ware
app.use(express.static(path.join(__dirname, 'public')))

/*

const mysql = require('mysql') //database configuration

const con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password:"Baseball1",
	port: 3306,
	database: "colesdb"
})

con.connect(function(err){
	if(err){
		console.error("Error Connecting" + err.stack)
	}
	console.log("Connected as id " + con.threadId)

con.query("SELECT * FROM userinfo", function(err, result){
	if(err){
		console.error(err.stack)
	}
	console.log(result)
})

})
*/


const indexRouter = require('./routes/index')
app.use('/',indexRouter)

http.listen(port, function(){
  console.log('listening on *:' + port);
});
 // Connects server to port; Typical Ports: 3000, 5000, 8000, 8080

module.exports = app


//BouncyBall starts here

var io = require('socket.io')(http);

var users = [];
var balls = [];
var GRAVITY = .6;
var friction = .99;
var ballCap = 50;
const CANVAS_HEIGHT = 800;
const CANVAS_WIDTH = 1280;

//user class
function user(ip,username,mouseX,mouseY,color){
	this.ip = ip;
	this.username = username;
	this.mouseX = mouseX;
	this.mouseY = mouseY;
	this.color = color;
}

user.prototype.mouseUpdate = function(clientX,clientY){
	this.mouseX = clientX;
	this.mouseY = clientY;
}

//ball class
function ball(x,y,vy,vx,ax,ay,color){
	this.x = x;
	this.y = y;
	this.vy = vy;
	this.vx = vx;
	this.ax = ax;
	this.ay = ay;
	this.color = color;
	this.count = 0;
}

ball.prototype.move = function(){
	
	this.vy += this.ay;
	this.vx += this.ax;
	
	this.x += this.vx;
	this.y += this.vy;
	
	if(this.y > CANVAS_HEIGHT-10)
		this.y = CANVAS_HEIGHT-10;
	else if (this.y < 10)
		this.y = 10;
	
	if(this.x > CANVAS_WIDTH-10)
		this.x = CANVAS_WIDTH-10;
	else if(this.x < 10)
		this.x = 10;
	
	if((this.y >= (CANVAS_HEIGHT-10)) || (this.y <= 10)){
		this.vy = -this.vy * friction;
	}
	if((this.x >= (CANVAS_WIDTH-10)) || (this.x <= 10)){
		this.vx = -this.vx * friction;
	}
}

ball.prototype.isOutOfPlay = function(){
	if((this.x >= (CANVAS_WIDTH-10)) || (this.x < 10)){
		return true;
	}
	else if((this.y >= (CANVAS_HEIGHT-10)) || (this.y < 10)){
		return true;
	}
	else{
		return false;
	}
	
	
}


io.on('connection', function(socket){
	  var name;
	  var index;
	  var color;
  socket.on('username', function(username){
	    r = Math.floor((Math.random() * 255) + 1);
		g = Math.floor((Math.random() * 255) + 1);
		b = Math.floor((Math.random() * 255) + 1);
		name = username;
		color = "rgb("+r+","+g+","+b+")";
		users[users.length] = new user(socket.handshake.address,name,0,0,color);
		index = users.length-1;
		socket.emit('index', index);
		io.emit('username', index, users[index].username, users[index].color);
		console.log(users);
  });
 
 socket.on('request user', function(index){
	 socket.emit('request user', index, users[index].username, users[index].mouseX, users[index].mouseY, users[index].color);
 });
  
  socket.on('mousepos', function(index, mouseX,mouseY){
	  users[index].mouseUpdate(mouseX,mouseY);
	  io.emit('mousepos', index, mouseX, mouseY);
  });
  
  socket.on('chat message', function(msg,username,color){
    io.emit('chat message',msg,username,color);
  });
  
  socket.on('user disconnect', function(UIndex){
	  if(index > UIndex){
		index--; 
	  }
  });
  
  socket.on('disconnect', function(){
	  io.emit('user disconnect', index);
	  users.splice(index,1);
  });
  
  socket.on('createball', function(mouseX, mouseY){
	  if(balls.length <= ballCap)
			balls[balls.length] = new ball(mouseX,mouseY,0,0,0,GRAVITY,"rgb("+Math.floor((Math.random() * 255) + 1)+","+Math.floor((Math.random() * 255) + 1)+","+Math.floor((Math.random() * 255) + 1)+")");
  });
  

  
});

  function updateBall(){  
		for (var j = balls.length-1; j>=0; j--){
			balls[j].move();
			if(balls[j].isOutOfPlay()){
				balls[j].count++;
			}
			else{
				balls[j].count = 0;
			}
			if(balls[j].count >= 10){
				balls.splice(j,1);
				io.emit('removeball',j);
			}
		}
  
	io.emit('ballupdate', balls);  
  }
  setInterval(updateBall,20);
  
  //Bouncy Ball ends here */
