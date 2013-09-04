var expect = require('chai').expect;
var job = require('../aggregates/job');

describe('Job', function () {
	var createTestJob1 = {
		aggregateId: '123',
		description: 'Test Job One'
	}

	describe('Create new job', function () {
		it('Can be created', function (done) {
			job.create(createTestJob1, function (err, evt) {
				expect(evt).to.eql({
					evt: "newJobCreated",
					aggregateId: '123',
					description: 'Test Job One'
				});
				done();
			});
		});
	});

	describe('Create job with id which already exists', function () {
		beforeEach(function () {
			job.newJobCreated({aggregateId: '123', description: 'Test Job One'});
		});

		it('Returns an error', function (done) {
			job.create(createTestJob1, function (err, evt) {
				expect(evt).to.be.null;
				expect(err).to.eql({message: 'Job with Id "123" already exists'});
				done();
			});
		});
	});

	describe('Start job', function () {
		beforeEach(function () {
			job.newJobCreated({aggregateId: '123', description: 'Test Job Two'});
		});

		it('Raises jobStarted event', function (done) {
			job.start({}, function (err, evt) {
				expect(err).to.be.null;
				expect(evt).to.eql({evt: "jobStarted"});
				done();
			});	
		});
	});

	describe('Start job which is already started', function () {
		beforeEach(function () {
			job.newJobCreated({aggregateId: '123', description: 'Test Job Two'});
			job.jobStarted({aggregate: '123'});
		});

		it('Returns an error', function (done) {
			job.start({}, function (err, evt) {
				expect(evt).to.be.null;
				expect(err).to.eql({message: "Can't start job - it's already started"});
				done();
			});
		});
	})
});