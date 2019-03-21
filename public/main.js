var socket = io('localhost:3001');
var connected=0;
var clientId="";
$(function() {
    socket.on('connect', function() {
        socket.on('disconnect', () => {
            console.log('you have been disconnected');
        });

        socket.on('reconnect', () => {
          console.log('you have been disconnected');
            $(".connecting").html('<p  style="color: green">Reconnected</p>');
            $(".connecting").hide();
            $("#indian").show();
        });

        socket.on('reconnect_error', () => {
          console.log('you have been disconnected');
            $("#indian").hide();
            $(".connecting").html('<p  style="color: red">Disconnected....... trying to connect</p>');
        });

    })
    $('#pwd').focus();
    $('#pwd').keydown(function(e) {
        if (e.which == 13) {    
            var user = $("#pwd").val();     
            if(user){
            $('#login').hide();
            $('#frame').show();
            $('#message-text').focus();
            $('#me').text(user);
            }else{
                alert('Please enter name');
                e.preventDefault();
                return false;
            }
            if (user) {
                socket.emit('user list',{user:user,type:'client'});
            }
            e.preventDefault();
        }
    });
    
    socket.on('update country', (data) => {
        $('#ip_'+data.id).text(data.country);
    });

    socket.on('send message to specific server', (data) => {
        connected=1;
        clientId=data.clientId;
        var msg = '<li class="sent"><img src="mikeross.png" alt="" /><p>' + data.msg + '</p><div class="time">'+data.datetime+'</div>'+data.username+'</li>';
        messagetext(msg);
    });

    

    socket.on('update count', (data) => {
        $("#count").text(data.count);
       
    });

    $('#message-text').keydown(function(e) { 
    if (e.which == 13) {
        sendMessage();
        e.preventDefault();
    }
});

});
const messagetext = (message1) => {
    $("#message").append(message1);
    scrollToBottom();
}
const scrollToBottom = () => {
    $(".messages").stop().animate({
        scrollTop: $('.messages')[0].scrollHeight
    });
}
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
  const removeZero = (value) => {
    if(value!=0){
      return value;
    }else{
      return "";
    }
   }

  

const sendMessage = () => {
    var msg = $("#message-text").val();
    if (msg) {
        var k = '<li class="replies"><img src="mikeross.png" alt="" /><p>' + msg + '</p><div class="time1">'+dateTime()+'</div></li>';
        messagetext(k);
        var user = $("#pwd").val(); 
        if(connected==1){
            socket.emit('send message to room specific admin', {socketId:socket.id,msg:msg,username:user,clientId:clientId});
        }else{
            socket.emit('send message to room', {socketId:socket.id,msg:msg,username:user});
        }
        $("#message-text").val('');
    }
}



