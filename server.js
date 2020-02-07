var express = require('express');
var london = express();
var port = process.env.PORT || 3000;
var _ = require('lodash');

// importing routes
var routes = require('./api/routes/londonRouter');
// register the route
routes(london);

//start listening on port
london.listen(port);

console.log('Application started on port: ' + port);

// handler for all undefined routes that sends a json response
london.use(function (req, res) {
    console.error("Requested url " + req.headers.host + req.originalUrl + " is not found");
    res.status(404).send({ url: req.originalUrl + ' not found' })
});
