var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const iplocation = require("iplocation").default;
var port = process.env.PORT || 3001;

var userArr=[];
var totalNumberOfUser=0;
app.use(express.static('public'))

server.listen(port, () => {
    console.log('Server listening at port %d', port);
  });
  
  io.on('connection', (socket) => {
  socket.on('user list', (username) => {
    socket.username=username;
    totalNumberOfUser=totalNumberOfUser+1;
    var ip = socket.handshake.address;
    var country="";
    if(ip=='::1'){
      ip="103.211.19.251";
    }
    iplocation(ip)
    .then((res) => {
      country=res.city + " ( "+res.country+" )";
      userArr.forEach(function(entry, index) {
        if(entry.id==socket.id){   
          entry.country=country;
        }
        io.emit('update country', {
          id: socket.id,
          country:country,
        });
    });
    })
    .catch(err => {
    });
    userArr.push({name:username,id:socket.id,count:0,ip:ip,country:country});
    io.emit('update count', {
        count: totalNumberOfUser,
        user:userArr,
      });
      socket.broadcast.emit('common message', {
        username:username,
        type:'added'
      });
      
  });
  
  socket.on('typing', (data) => { 
      socket.broadcast.emit('typing to all', {
        data:socket.username+ ' is typing.....',
        type:data,
      });
    });
    socket.on('status of tab', () => { 
      socket.broadcast.emit('status of tab client','');
    });
   

      socket.on('send message', (data) => {
        userArr.forEach(function(entry, index) {
          if(entry.id==socket.id){   
            entry.count=entry.count+1;
          }
      });
        socket.broadcast.emit('send message to all', {
          data:socket.username+ ' is typing.....',
          msg:data,
          user:userArr,
          datetime:dateTime()
        });
      
  });
  socket.on('disconnect', () => {
      userArr.forEach(function(entry,index) {
        if(entry.id==socket.id){         
          userArr.splice(index, 1);
          totalNumberOfUser--;
          io.emit('update count', {
            count: totalNumberOfUser,
            user:userArr,
          });
          socket.broadcast.emit('common message', {
            username:entry.name,
            type:'left'
          });
        }
    });
});
});
function dateTime(){
  var resp="";
  var d = new Date();
  var h = addZero(d.getHours());
  var m = addZero(d.getMinutes());
  var s = addZero(d.getSeconds());
  resp = h + ":" + m + ":" + s;
  return resp
}

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}