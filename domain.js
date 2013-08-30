
var domain = {};

var eventstore = require('eventstore');
var eventstorage = require('eventstore.redis');

var es = eventstore.createStore();
var publisher = {
	publish: function (evt) {
		console.log("Publishing event", evt);
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

domain.getAggregate = function (aggregateType, id, callback) {
	callback(null, {
		id: id, 
		create: function (cmd) {

		},
		startJob: function () {
			console.log('starting')
		}
	});
};

domain.createAggregate = function (aggregateType, id) {
	es.getEventStream(id, 0, function (err, stream) {
		stream.addEvent({evt: "NewJobCreated", id: cmd.id, description: cmd.description});
		stream.commit();
	});
};

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
