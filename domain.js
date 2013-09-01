
var domain = {};

var eventstore = require('eventstore');
var eventstorage = require('eventstore.mongoDb');
// var eventstorage = require('eventstore.redis');
var redis = require('redis');
var colors = require('./colors');
var publishSocket = require('zmq').socket('push');
publishSocket.bindSync('tcp://127.0.0.1:3001');

var es = eventstore.createStore();
// create a publisher which we use later to publish committed events back.  
// just use another redis client and publish events to the _events channel_
var publisher = {
    
    // evt: redis.createClient(),

    publish: function(evt) {
        var msg = JSON.stringify(evt, null, 4);

        console.log(colors.green('\npublishing event on zero mq'));
        console.log(msg);

        // publisher.evt.publish('events', msg);
        publishSocket.send(msg);
    }
      
};

eventstorage.createStorage(function (err, store) {
	es.configure(function () {
		es.use(store);
		es.use(publisher);
	});

	es.start(function (err, something) {
		console.log("EventStore Started");
	});
});

domain.execute = function (command) {
	var urlParts = command.url.split('/');
	var aggregateType = urlParts[1];
	var method = urlParts[2];

	console.log("Executing", aggregateType, method, command.aggregateId);

	es.getEventStream(command.aggregateId, 0, function (err, stream) {
		var aggregate = require('./aggregates/' + aggregateType)(stream);
		stream.events.forEach(function (evt) {
			console.log("Replaying event", evt.payload);
			aggregate[evt.payload.evt](evt.payload);
		});

		console.log("Retrieved aggregate", aggregate);

		aggregate[method](command);
	});
};

module.exports = domain;
