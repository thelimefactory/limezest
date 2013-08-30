var domain = require('./domain');
var express = require('express');
var app = express();
var uuid = require('node-uuid');

app.use(express.bodyParser());

app.get('/job/create', function (req, res) {
	res.send('<form method="post"><input name="description" /></form>');
});

app.post('/job/create', function (req, res) {
	var cmd = req.body;
	cmd.id = uuid.v1();
	cmd.aggregateId = cmd.id;
	cmd.url = req.url;
	res.status(202).json(cmd);

	domain.execute(cmd);
});

app.post('/job/start', function (req, res) {
	var cmd = req.body;
	cmd.id = uuid.v1();
	cmd.url = req.url;
	res.status(202).json(cmd);

	domain.execute(cmd);
});

app.listen(3000);
console.log('Server listening on port 3000');	
