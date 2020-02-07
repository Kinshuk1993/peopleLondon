'use strict';

var https = require('https');
var _ = require('lodash');

exports.getPeopleInLondon = function (request, response) {
    getCountPeople(request, response);
};

// function to get count of people living in london
function getCountPeople(request, response) {
    // create options to make the https get call
    var options = {
        host: 'bpdts-test-app.herokuapp.com',
        path: '/city/London/users',
        method: 'GET'
    }

    //making the https get call to the mentioned swagger api
    var getReq = https.request(options, function (res) {
        res.on('data', function (data) {
            console.info(JSON.parse(data).length);
            response.json(JSON.parse(data).length);
        });
    });

    // close the request
    getReq.end();

    // handle the error
    getReq.on('error', function (error) {
        handleError(error, response);
    });
}

function handleError() {
    console.error("Error: ", error);
    response.send(error);
}

var employeesCollection = [
    {
        "id":1,
        "name":"Soni",
        "designation":"SE",
        "salary":25000
    },
    {
        "id":2,
        "name":"Rohit",
        "designation":"SSE",
        "salary":35000
    },
    {
        "id":3,
        "name":"Akanksha",
        "designation":"Manager",
        "salary":45000
    },
    {
        "id":4,
        "name":"Mohan",
        "designation":"Accountant",
        "salary":30000
    },
    {
        "id":5,
        "name":"Gita",
        "designation":"SSE",
        "salary":35000
    }
];

// function to remove duplicates from the json array
function removeDuplicates(array, param) {
    _.uniq(array, param);
}