function wsSend(type, client_uuid, nickname, message) {
  for (var i = 0; i < clients.length; i++) {
    var clientSocket = clients[i].ws;
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(JSON.stringify({
        "type": type,
        "id": client_uuid,
        "nickname": nickname,
        "message": message
      }));
    }
  }
}

const WebSocket = require('ws');
var uuid = require('uuid');
const wss = new WebSocket.Server({ port: 8181 });
var clientIndex = 0;
var clients = []

wss.on('connection', function(ws)
{
	console.log('connection');
	var client_uuid = uuid.v1();
	var nickname = "AnonymousUser" + clientIndex;

	clientIndex += 1;
	var hxh = clientIndex;
	
	clients.push({ "id": client_uuid, "ws": ws, "nickname": nickname });
	console.log('client [%s] connected', client_uuid);
	var connect_message = nickname + " has connected";
	wsSend("notification", client_uuid, nickname, connect_message);
	
	ws.on('message', function incoming(message) 
	{
		console.log('uuid=%s, %d', client_uuid, hxh);
		if (message.indexOf('/nick') === 0)
		{
			console.log('incoming message [%s]', message);
			var nickname_array = message.split(' ');
			if (nickname_array.length >= 2) 
			{
				var old_nickname = nickname;
				nickname = nickname_array[1];
				var nickname_message = "Client " + old_nickname + " changed to " + nickname;
				wsSend("nick_update", client_uuid, nickname, nickname_message);
			}
		}
		else 
		{
			wsSend("message", client_uuid, nickname, message);
		}
	});
	
	ws.on('close', function () 
	{
	    closeSocket();
	});
	
	var closeSocket = function(customMessage) 
	{
	    for (var i = 0; i < clients.length; i++)
	    {
	        if (clients[i].id == client_uuid) 
	        {
	            var disconnect_message;
	            if (customMessage) 
	            {
	                disconnect_message = customMessage;
	            }
	            else
	            {
	                disconnect_message = nickname + " has disconnected";
	            }
	            wsSend("notification", client_uuid, nickname, disconnect_message);
	            clients.splice(i, 1);
	        }
	    }
	};

});
