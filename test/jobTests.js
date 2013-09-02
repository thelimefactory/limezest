var expect = require('chai').expect;

var domain = require('../domain');

describe('Job', function () {
	describe('Create', function () {
		var createTestJob1 = {
			url: '/job/create',
			aggregateId: '123',
			description: 'Test Job One'
		}

		it('Can be created', function (done) {
			domain.execute(createTestJob1, function () {
				domain.getAggregate('job', '123', function (err, job1) {
					expect(job1.aggregateId).to.equal('123');
					expect(job1.description).to.equal('Test Job One');

					done();
				});
			});
		});

		describe('Start Job', function () {
			var startJobCommand = {
				url: '/job/start',
				aggregateId: '123'
			};

			it('Should have a status of isStarted', function (done) {
				domain.execute(startJobCommand, function (err) {
					expect(err).to.be.null;

					domain.getAggregate('job', '123', function (err, job1) {
						expect(job1.isStarted).to.be.true;

						done();
					});
				});
			});
		});
	});
});