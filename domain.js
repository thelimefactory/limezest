
var domain = {};

var es = require('eventstore').createStore();
var mongoStorage = require('eventstore.mongoDb');

es.use(mongoStorage);

var colors = require('./colors');
// var publishSocket = require('zmq').socket('push');
// publishSocket.bindSync('tcp://127.0.0.1:3001');

domain.start = function (onDomainStarted) {
	mongoStorage.createStorage({}, function (err, storage) {
		if (err) {
			console.log(colors.red('Error connecting to mongo store'));
			onDomainStarted(err, null);
		} else {
			es.use(storage);
			es.start(function (err) {
				if (err) {
					onDomainStarted(err, null);
				} else {
					onDomainStarted(null);
				}
			});
		}
	});
};

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
		onDomainStarted();
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

domain.execute = function (command, callback) {
	console.log("Executing", command);
	var urlParts = command.url.split('/');
	var aggregateType = urlParts[1];
	var method = urlParts[2];

	es.getEventStream(command.aggregateId, 0, function (err, stream) {
		var aggregate = require('./aggregates/' + aggregateType);
		aggregate.aggregateId = command.aggregateId;
		console.log(aggregate, "Has " + stream.events.length + " events");

		stream.events.forEach(function (evt) {
			aggregate[evt.payload.evt](evt.payload);
		});

		aggregate[method](command, function (err, eventRaised) {
			if (err) {
				console.log(colors.red(err.message));

			} else {
				stream.addEvent(eventRaised);
				stream.commit();
			}
		});
	});
};

module.exports = domain;
