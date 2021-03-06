$(document).ready(function(){
	var socket = io.connect();
	var from = $.cookie('user');
	var to = 'all';
	
	socket.emit('online', { user: from });
	socket.on('say',function(data){
	    if(data.to == 'all'){
	      $("#contents").append('<div style="color:#919191;font-size:14px;">' + data.from + ' say:</div><div>' + data.msg + '</div><br />');
	    }
	    if(data.to == from){
	      $("#contents").append('<div style=color:#919191;font-size:14px;" >' + data.from + ' talk to you：</div><div>' + data.msg + '</div><br />');
	    }
	    scrollToBottom();
	    
	});
	socket.on('offline',function(data){
  		var sys = '<div style="color:#f00">User ' + data.user + ' offline！</div>';
  		$('#contents').append(sys + '<br />');
  		flushUsers(data.users);
  		if (data.user == to) {
    		to = "all";
  		}
  		showSayTo();
  		scrollToBottom();
	});
	socket.on('online',function(data){
		if(data.user != from){
			var sys = '<div>User ' + data.user + ' online！</div>';
		}else{
			var sys = '<div>Welcome to chatroom!</div>';
		}

		$('#contents').append(sys + '<br/>');
		flushUsers(data.users);
		showSayTo();
		scrollToBottom();
	});

	function flushUsers(users){
		$("#list").empty().append('<li alt="all" class="sayingto" onselectstart="return false">All guys</li>');
		for (var i in users) {
    		$("#list").append('<li alt="' + users[i] + '" onselectstart="return false">' + users[i] + '</li>');
  		}

  		$("#list > li").click(function(){
  			if($(this).attr('alt') != from){
  				to = $(this).attr('alt');
  				$("#list > li").removeClass('sayingto');
  				$(this).addClass('sayingto');
  				showSayTo();
  			}
  		});
	}

	function scrollToBottom(){
		$("#contents_show").animate({ scrollTop: $('#contents').height() - $('#contents_show').height() },200);
	}

	function showSayTo(){
		$("#from").html(from);
  		$("#to").html(to == "all" ? "all" : to);
	}

	function sendMessage(){
			var $msg = $('#input_content').val();
			if($msg == '') return;
			$msg = filterXSS($msg);
			if(to == 'all'){
				$('#contents').append('<div style="color:#919191;font-size:14px;">You say:</div><div>' + $msg + '</div><br/>');
			}else{
				$("#contents").append('<div style="color:#919191;font-size:14px;" >You chat with ' + to + ':</div><div>' + $msg + '</div><br />');
			}
			scrollToBottom();
			socket.emit('say',{from:from,to: to,msg: $msg});
			$('#input_content').val('');
	}

	$('#input_content').keydown(function(){
		if(event.keyCode ==13)
			sendMessage();
	});

	$('#say').click(function(){
		sendMessage();
	});




});