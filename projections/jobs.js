var zmq = require('zmq')
  , sock = zmq.socket('pull');

var jobs = [];

var handlers = {
	NewJobCreated: function (evt) {
		jobs.push({aggregateId: evt.aggregateId, description: evt.description});
		console.log('Jobs=', jobs);
	}
}

sock.connect('tcp://127.0.0.1:3001');

sock.on('message', function(message){
	console.log('Recvd message', message);
	var evt = JSON.parse(message);
	if (handlers[evt.evt]) {
		handlers[evt.evt](evt);
	}
});
