var job = {};

job.newJobCreated = function (evt) {
	job.isCreated = true;
	job.description = evt.description;
};

job.start = function (cmd, callback) {
	if (job.isStarted) {
		callback({message: "Can't start job - it's already started"}, null);
	} else {
		callback(null, {evt: "jobStarted"});
	}
};

job.jobStarted = function (evt) {
	job.isStarted = true;
};

job.create = function (cmd, callback) {
	if (job.isCreated) {
		callback({message: 'Job with Id "' + cmd.aggregateId + '" already exists'}, null);
	} else {
		callback(null, {
			evt: "newJobCreated", 
			aggregateId: cmd.aggregateId,
			description: cmd.description
		});
	}
};

module.exports = job;

