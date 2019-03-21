var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const iplocation = require("iplocation").default;
var port = process.env.PORT || 3001;

var userArr=[];
var userAdminArr=[];

app.use(express.static('public'))

server.listen(port, () => {
    console.log('Server listening at port %d', port);
  });
  
  io.on('connection', (socket) => {
  socket.on('user list', (data) => { 
    socket.username=data.user;
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
    if(data.type=='admin'){
      socket.join('Common room');
      userAdminArr.push({name:data.user,id:socket.id,count:0,ip:ip,country:country,connectedUser:''});
    }else{
      userArr.push({name:data.user,id:socket.id,count:0,ip:ip,country:country,connectedAdmin:''}); 
    }
    // console.log(userArr,'---',userAdminArr);
    io.emit('update count', {
        count: userArr.length,
        countAdmin: userAdminArr.length,
        user:userArr,
      });

      socket.broadcast.emit('common message', {
        username:data.user,
        type:'added',
        userType:data.type
      });

  });
    socket.on('disconnect', () => { 
      userArr.forEach(function(entry,index) {
        if(entry.id==socket.id){         
          userArr.splice(index, 1); 
          io.emit('update count', {
            count: userArr.length,
            countAdmin: userAdminArr.length,
            user:userArr,
          });      
          socket.broadcast.emit('common message', {
            username:entry.name,
            type:'left',
            userType:'client'
          });                        
        }
    });

    userAdminArr.forEach(function(entry,index) {
      if(entry.id==socket.id){         
        userAdminArr.splice(index, 1);    
        io.emit('update count', {
          count: userArr.length,
          countAdmin: userAdminArr.length,
          user:userArr,
        });      
        socket.broadcast.emit('common message', {
          username:entry.name,
          type:'left',
          userType:'admin'
        });        
      }
  });


  
  
});


socket.on('send message to room', (data) => {
  io.sockets.in('Common room').emit('send message to room client', {
    msg:data.msg,
    clientId:data.socketId,
    datetime:dateTime(),
    username:data.username
  });

});

socket.on('send message to specific client', (data) => {
  io.to(data.clientId).emit('send message to specific server', {
    clientId:data.socketId,
    msg:data.msg,
    username:data.username,   
    datetime:dateTime()
  });     
});

socket.on('send message to room specific admin', (data) => {
  io.to(data.clientId).emit('send message to specific server admin', {
    clientId:data.socketId,
    msg:data.msg,
    username:data.username,   
    datetime:dateTime()
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