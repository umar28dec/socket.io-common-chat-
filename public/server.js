var socket = io('localhost:3001');
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
                socket.emit('user list',{user:user,type:'admin'});
            }    
            e.preventDefault();
        }
    });
    socket.on('update country', (data) => {
        $('#ip_'+data.id).text(data.country);
    });

    socket.on('update count', (data) => {
        $("#count").text(data.count);
        $("#countAdmin").text(data.countAdmin);  
        var users = '';
        if(data.user.length ==0){
          users += '<li class="contact"><div class="wrap">No User Available</div></li>';      
      }else{
        data.user.forEach(function(entry, index) {
          users += '<li onclick="register_popup('+"'"+entry.id+"',"+"'"+entry.name+"'"+')" class="contact"><div class="wrap"><span class="contact-status online"></span><img src="mikeross.png" alt="" /><div class="meta"><p class="name">' + entry.name + '</p><span id='+entry.id+' class="red">'+removeZero(entry.count)+'</span><p class="preview">'+entry.ip+'<span class="country" id=ip_'+entry.id+'>'+entry.country+'</span></p></div></div></li>';    
      });
  
      }
        $("#list").html(users);     
    });


socket.on('send message to specific server admin', (data) => { 
		 var msg = '<div class="msg-replies">'+data.msg+'</div>';
		 var id="#msg_uk_"+data.clientId;
		 $(id).append(msg);
});

 
socket.on('common message', (data) => {
  if (data.type == 'added') {
      var message1 = '<li class="common">' + data.username + ' Joined the chat as ( ' +data.userType +' )</li>';
  } else if (data.type == 'left') {
      var message1 = '<li class="common-left">' + data.username + ' just left the chat as ( ' +data.userType +' )' + '</li>';
  }
  messagetext(message1);
});


socket.on('send message to room client', (data) => {
	var msg = '<li class="sent"><img src="mikeross.png" alt="" /><p>' + data.msg + '</p><div class="time">'+data.datetime+'</div></li>';
	messagetext(msg);
});

socket.on('typing to all', (data) => { 
	if (data.type == 'remove') {
			$("#typing_uk_"+data.socketId).hide();
	} else {
		$("#typing_uk_"+data.socketId).css('display','inline-block');

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

function setID(id){
  
  socket.emit('set Id',id);
}


	var sendid="";
	//this function can remove a array element.
	Array.remove = function(array, from, to) {
		var rest = array.slice((to || from) + 1 || array.length);
		array.length = from < 0 ? array.length + from : from;
		return array.push.apply(array, rest);
	};

	//this variable represents the total number of popups can be displayed according to the viewport width
	var total_popups = 0;
	
	//arrays of popups ids
	var popups = [];

	//this is used to close a popup
	function close_popup(id)
	{
		for(var iii = 0; iii < popups.length; iii++)
		{
			if(id == popups[iii])
			{
				Array.remove(popups, iii);
				
				document.getElementById(id).style.display = "none";
				
				calculate_popups();
				
				return;
			}
		}   
	}

	//displays the popups. Displays based on the maximum number of popups that can be displayed on the current viewport width
	function display_popups()
	{
		var right = 10;
		
		var iii = 0;
		for(iii; iii < total_popups; iii++)
		{
			if(popups[iii] != undefined)
			{
				var element = document.getElementById(popups[iii]);
				element.style.right = right + "px";
				right = right + 250;
				element.style.display = "block";
			}
		}
		
		for(var jjj = iii; jjj < popups.length; jjj++)
		{
			var element = document.getElementById(popups[jjj]);
			element.style.display = "none";
		}
	}
	
	//creates markup for a new popup. Adds the id to popups array.
	function register_popup(id, name)
	{
		var idclient=id;
		id="uk_"+id;
		sendid=id;
		for(var iii = 0; iii < popups.length; iii++)
		{   
			//already registered. Bring it to front.
			if(id == popups[iii])
			{
				Array.remove(popups, iii);
			
				popups.unshift(id);
				
				calculate_popups();
				
				
				return;
			}
		}               
		
		var element = '<div class="popup-box chat-popup" id="'+ id +'">';
		element = element + '<div class="popup-head">';
		element = element + '<div class="popup-head-left">'+ name +'<span id="typing_'+id+'" style="display:none">&nbsp; is typing...</span></div>';
		element = element + '<div class="popup-head-right"><a href="javascript:close_popup(\''+ id +'\');">&#10005;</a></div>';
		element = element + '<div style="clear: both"></div></div><div id="msg_'+id+'" class="popup-messages"></div><div><input id="text_'+id+'"  autocomplete="off" class="message" type="text" name="message"></div></div>';
		
		document.getElementsByTagName("body")[0].innerHTML = document.getElementsByTagName("body")[0].innerHTML + element;  

		popups.unshift(id);
				
		calculate_popups();		
		var defaultId="#text_"+id;
		$(defaultId).focus();
		$(defaultId).bind('keyup keypres', function() { 
			var msg = $("#message-text").val();
			if (msg) {
					socket.emit('typing', {type:'typing',socketId:idclient,id:socket.id});
			} else {
					socket.emit('typing', {type:'remove',socketId:idclient,id:socket.id});
			}
	});
		$(defaultId).keydown(function(e) {
        if (e.which == 13) { 
			sendMessage();
        }
    });
	$('.message').click(function(e) {
		var temp=$(this).attr('id');
		temp=temp.replace('text_','');
		sendid=temp;
		$("#text_"+sendid).keydown(function(e) {
        if (e.which == 13) {
			sendMessage();
        }
	});
	$("#text_"+sendid).bind('keyup keypres', function() {
		var msg = $("#message-text").val();
		if (msg) {
				socket.emit('typing', {type:'typing',socketId:clientId,id:socket.id});
		} else {
				socket.emit('typing', {type:'remove',socketId:clientId,id:socket.id});
		}
});
});


	


	}
	
function sendMessage(){
	var defaultId="#text_"+sendid;
	var msg= $(defaultId).val();
	if(msg){
		var postmsg='<div class="msg">'+msg+'</div>'; 
		$('#msg_'+sendid).append(postmsg)
		$(defaultId).val('');
		var user=$("#me").text();
		var clientId=sendid.replace('uk_','');
		socket.emit('send message to specific client', {socketId:socket.id,msg:msg,username:user,clientId:clientId});
		$('#msg_'+sendid).stop().animate({
			scrollTop: $('#msg_'+sendid)[0].scrollHeight
	});
	}
}

	//calculate the total number of popups suitable and then populate the toatal_popups variable.
	function calculate_popups()
	{
		var width = window.innerWidth;
		if(width < 540)
		{
			total_popups = 0;
		}
		else
		{
			width = width - 200;
			//320 is width of a single popup box
			total_popups = parseInt(width/232);
		}
		
		display_popups();
		
	}
	
	//recalculate when window is loaded and also when window is resized.
	window.addEventListener("resize", calculate_popups);
	window.addEventListener("load", calculate_popups);
