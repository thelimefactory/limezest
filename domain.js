
var domain = {};

var eventstore = require('eventstore');
var eventstorage = require('eventstore.mongoDb');
var colors = require('./colors');
var publishSocket = require('zmq').socket('push');
publishSocket.bindSync('tcp://127.0.0.1:3001');

var es = eventstore.createStore();
var publisher = {

	publish: function(evt) {
		var msg = JSON.stringify(evt, null, 4);

		console.log(colors.green('\npublishing event on zero mq'));
		console.log(msg);

		publishSocket.send(msg);
	}
};

function onEventStoreStarted (err, something) {
	if (!err) {
		console.log("EventStore started");
	} else {
		console.log("Error starting EventStore", err);
	}
};

function onStorageCreated (err, store) {
	if (!err) {
		es.configure(function () {
			es.use(store);
			es.start(onEventStoreStarted);
		});
	} else {
		console.log("Error creating storage", err);
	}
};

eventstorage.createStorage(onStorageCreated);


domain.getAggregate = function (aggregateType, aggregateId, callback) {
	es.getEventStream(aggregateId, 0, function (err, stream) {
		var aggregate = require('./aggregates/' + aggregateType)(stream);
		aggregate.aggregateId = aggregateId;
		console.log(aggregateType, aggregateId, "Has " + stream.events.length + " events");

		stream.events.forEach(function (evt) {
			aggregate[evt.payload.evt](evt.payload);
		});

		callback(null, aggregate);
	});
}

domain.execute = function (command, callback) {
	var urlParts = command.url.split('/');
	var aggregateType = urlParts[1];
	var method = urlParts[2];

	domain.getAggregate(aggregateType, command.aggregateId, function (err, aggregate) {
		aggregate[method](command, function (err, aggregate) {
			callback(null, aggregate);
		});
	});
};

module.exports = domain;
