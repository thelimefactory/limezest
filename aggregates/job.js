var eventStream;
var job = {
	isStarted: false
};

job.NewJobCreated = function (evt) {
	job.description = evt.description;
};

job.start = function (cmd) {
	if (job.isStarted) {
		console.log("Can't start job - it's already started");
	} else {
		eventStream.addEvent({evt: "JobStarted"});
		eventStream.commit();
	}
};

job.JobStarted = function (evt) {
	job.isStarted = true;
};

job.create = function (cmd) {
	eventStream.addEvent({
		evt: "NewJobCreated", 
		aggregateId: cmd.aggregateId,
		description: cmd.description
	});
	eventStream.commit();
};

module.exports = function (stream) {
	eventStream = stream;
	return job;
}

