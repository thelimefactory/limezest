var eventStream;
var job = {
};

job.NewJobCreated = function (evt) {
	job.description = evt.description;
};

job.start = function (cmd, callback) {
	if (job.isStarted) {
		callback({message: "Can't start job - it's already started"}, null);
	} else {
		eventStream.addEvent({evt: "JobStarted"});
		eventStream.commit(function () {
			callback();
		});
	}
};

job.JobStarted = function (evt) {
	job.isStarted = true;
};

job.create = function (cmd, callback) {
	var newJobCreatedEvent = {
		evt: "NewJobCreated", 
		aggregateId: cmd.aggregateId,
		description: cmd.description
	};
	eventStream.addEvent(newJobCreatedEvent);
	eventStream.commit(function (err) {
		if (!err) {
			callback(err, newJobCreatedEvent);
		} else {
			console.log("Can't commit event", err);
			callback(err, newJobCreatedEvent);
		}
	});
};

module.exports = function (stream) {
	eventStream = stream;
	return job;
}

