var socket = io();
$(function() {
    socket.on('connect', function ()  {
        socket.on('disconnect', () => {
            console.log('you have been disconnected');
          });
        
          socket.on('reconnect', () => {
            $(".connecting").html('<p  style="color: green">Re connected</p>');    
            $(".connecting").hide(5000); 
          });
        
          socket.on('reconnect_error', () => {
            $(".connecting").html('<p  style="color: red">Disconnected....... trying to connect</p>');
          });
      
    })     
    $('#pwd').focus();
    $('#pwd').keydown(function (e) {
      if (e.which == 13) {
          $('#login').hide();
          $('#frame').show();
          var user=$("#pwd").val();
          $('#message-text').focus();
          $('#me').text(user);
          if(user){
            socket.emit('user list', user);
          }
        e.preventDefault();
      }
    });

    socket.on('update count', (data) => {
        $("#count").text(data.count);
        var users='';
        data.user.forEach(function(entry,index) {
            users+='<li class="contact"><div class="wrap"><span class="contact-status online"></span><img src="mikeross.png" alt="" /><div class="meta"><p class="name">'+entry.name+'</p><p class="preview">You just got LITT up, Mike.</p></div></div></li>';
        });
        $("#list").html(users);       
      });      

      socket.on('common message', (data) => {     
        if(data.type=='added'){
            var message1='<li class="common">'+data.username+ ' Joined the chat'+'</li>';
        }else if(data.type=='left'){
            var message1='<li class="common-left">'+data.username+ ' just left the chat'+'</li>';
        }
        messagetext(message1);
      });  

      $("#message-text").bind('keyup keypres',function(){
       var msg=$("#message-text").val();
        if(msg){
            socket.emit('typing','typing');
        }else{
            socket.emit('typing','remove'); 
        }
      });

      socket.on('typing to all', (data) => {  
          if(data.type=='remove'){
            $("#typing").hide();
          }else{
            $("#typing").show();
            $("#typing").text(data.data);
     
          }
      }); 
      socket.on('send message to all', (data) => {  
       var msg='<li class="sent"><img src="mikeross.png" alt="" /><p>'+data.msg+'</p></li>'; 
       messagetext(msg);
       scrollToBottom();
    }); 
      
      $('#message-text').keydown(function (e) {
        if (e.which == 13) {
            sendMessage();
          e.preventDefault();
        }
      });

      $('#sub').click(function(){
        sendMessage(); 
      })
      
          
	  
  });
  var vis = (function(){
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
    $(".messages").stop ().animate ({
        scrollTop: $('.messages')[0].scrollHeight
      });
  }

  const sendMessage = (message1) => {
    var msg=$("#message-text").val();
    if(msg){       
        var notification=vis() ? 'Active' : 'Not-Active';
        if(notification=='Not-Active'){
            notifyMe();      
        }

        var k='<li class="replies"><img src="mikeross.png" alt="" /><p>'+msg+'</p></li>';
        messagetext(k);
        socket.emit('send message',msg);
        $("#message-text").val('');  
        scrollToBottom();                  
    }
  }
  
  function notifyMe() {
    if (Notification.permission !== "granted")
      Notification.requestPermission();
    else {
      var notification = new Notification('Welcome to ptutorial', {
        icon: 'http://www.ptutorial.com/icon/umar.ico',
        body: "New post created",
      });
   
      notification.onclick = function () {
        window.open("http://blogs.ptutorial.com");      
      };
   
    }   
  }