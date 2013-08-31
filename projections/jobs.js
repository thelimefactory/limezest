var redis = require("redis"),
client = redis.createClient();

var eventstore = require('eventstore');
var eventstorage = require('eventstore.redis');

var es = eventstore.createStore();
es.getEventRange({}, 1000, function (err, events) {
	console.log("Replaying Events", events);
});

var jobs = [];

var handlers = {
	NewJobCreated: function (evt) {
		jobs.push({aggregateId: evt.aggregateId, description: evt.description});
		console.log('Jobs=', jobs);
	}
}

client.on('subscribe', function (channel, count) {
	console.log('Subscribed', channel, count);
});

client.on('message', function (channel, message) {
	console.log('Recvd message', channel, message);
	var evt = JSON.parse(message);
	if (handlers[evt.evt]) {
		handlers[evt.evt](evt);
	}
});

client.subscribe('events');