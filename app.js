var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
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
    userArr.push({name:username,id:socket.id});

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
        type:data
      });
    });

      socket.on('send message', (data) => { 
        socket.broadcast.emit('typing to all', {
          data:socket.username+ ' is typing.....',
          type:data
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


