var socket = io();
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
                socket.emit('user list', user);
            }
            e.preventDefault();
        }
    });
    socket.on('update count', (data) => {
        $("#count").text(data.count);
        var users = '';
        data.user.forEach(function(entry, index) {
            if(entry.id !=socket.id){
                users += '<li onclick="setID('+"'"+entry.id+"'"+')" class="contact"><div class="wrap"><span class="contact-status online"></span><img src="mikeross.png" alt="" /><div class="meta"><p class="name">' + entry.name + '</p><span id='+entry.id+' class="red">'+removeZero(entry.count)+'</span><p class="preview">'+entry.ip+'<span class="country" id=ip_'+entry.id+'>'+entry.country+'</span></p></div></div></li>';
            }
            if((data.user.length==1) && (entry.id ==socket.id)){
                users += '<li class="contact"><div class="wrap">No User Available</div></li>';
            
            }
        });
        $("#list").html(users);
    });

    socket.on('common message', (data) => {
        if (data.type == 'added') {
            var message1 = '<li class="common">' + data.username + ' Joined the chat' + '</li>';
        } else if (data.type == 'left') {
            var message1 = '<li class="common-left">' + data.username + ' just left the chat' + '</li>';
        }
        messagetext(message1);
    });

    socket.on('update country', (data) => {
        $('#ip_'+data.id).text(data.country);
    });
    

    $("#message-text").bind('keyup keypres', function() {
        var msg = $("#message-text").val();
        if (msg) {
            socket.emit('typing', 'typing');
        } else {
            socket.emit('typing', 'remove');
        }
    });

    socket.on('typing to all', (data) => {
        if (data.type == 'remove') {
            $("#typing").hide();
            document.title ="";
        } else {
            document.title =data.data;
            $("#typing").show();
            $("#typing").text(data.data);

        }
    });
    socket.on('send message to all', (data) => {
        console.log(data);
        var msg = '<li class="sent"><img src="mikeross.png" alt="" /><p>' + data.msg + '</p><div class="time">'+data.datetime+'</div></li>';
        messagetext(msg);
        data.user.forEach(function(entry, index) {
         $('#'+entry.id).text(entry.count);
      });
    });
    socket.on('status of tab client', () => {
        var notification = vis() ? 'Active' : 'Not-Active';
        var visible=$(".common-inactive").is(":visible");
        if(notification=='Not-Active' && !visible){
          var message1 = '<li class="common-inactive">You Have Unread Messages</li>';
          messagetext(message1);
        //   notifyMe();
        }
        setTimeout(function(){
          // $(".common-inactive").hide();
        },2000)

      
    });



    $('#message-text').keydown(function(e) {
        if (e.which == 13) {
            if(socketId){
                sendMessage();
            }else{
                alert('Please select User to chat');
                e.preventDefault();
                return false;
            }
            e.preventDefault();
        }
    });

    



});
var vis = (function() {
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();
const messagetext = (message1) => {
    $("#message").append(message1);
    scrollToBottom();
}
const scrollToBottom = () => {
    $(".messages").stop().animate({
        scrollTop: $('.messages')[0].scrollHeight
    });
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
        socket.emit('status of tab');
        socket.emit('send message', {msg:msg,id:socketId});
        $("#message-text").val('');
        scrollToBottom();
        sticker="";

    }
}

function notifyMe() {
    if (Notification.permission !== "granted")
        Notification.requestPermission();
    else {
        var notification = new Notification('Welcome to ptutorial', {
            icon: 'http://www.ptutorial.com/icon/umar.ico',
            body: "You have new message",
        });

        // notification.onclick = function() {
        //     window.open("http://localhost:3001/");
        // };

    }
}
vis(function(){
  var status = vis() ? 'Active' : 'Not Active';
  if(status=='Active'){
    setTimeout(function(){
      $(".common-inactive").hide();
    },5000)
  }
  });
  function submsg(){
    var msg = $("#message-text").val();
if (msg) {
    var k = '<li class="replies"><img src="mikeross.png" alt="" /><p>' + msg + '</p><div class="time1">'+dateTime()+'</div></li>';
    messagetext(k);
    socket.emit('status of tab');
    socket.emit('send message', msg);
    $("#message-text").val('');
    scrollToBottom();
    sticker="";
}
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

  function setID(id){
 socketId=id;
 socket.emit('socket id', socketId);
  }