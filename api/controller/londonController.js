'use strict';

var https = require('https');
var _ = require('lodash');
var async = require("async");
// people living only in london only
var londonPeople = "";
// count of people in london only
var countOfPeopleLondon = 0;
// all users
var allUsers = "";

exports.getPeopleInLondon = function (request, response) {
    async.waterfall([
        //1. Return the list of all people living in London using swagger API - UNSURE IF NEEDED ! - TO DECIDE
        function (callback) {
            console.log('Inside function 1');
            https.get('https://bpdts-test-app.herokuapp.com/city/London/users', res => {
                res.setEncoding("utf8");
                res.on("data", data => {
                    londonPeople += data;
                });
                res.on("end", () => {
                    callback(null, londonPeople, false, '');
                });

                res.on("error", () => {
                    console.log('Got error in function 1');
                    handleError(error, response);
                    callback(null, londonPeople, true, error);
                });
            });
        },
        //2. Get all the users from the swagger API
        function (londonPeople, ifError, error, callback) {
            console.log('In function 2');
            if (ifError) {
                console.log('Got error in function 2 from 1');
                handleError(error, response);
                callback(null, londonPeople, allUsers, true, error);
            } else {
                console.log('No error from frunction 1 in function 2');
                https.get('https://bpdts-test-app.herokuapp.com/users', res => {
                    res.setEncoding("utf8");
                    res.on("data", data => {
                        allUsers += data;
                    });
                    res.on("end", () => {
                        callback(null, londonPeople, allUsers, false, '');
                    });

                    res.on("error", () => {
                        console.log('Got error in function 1');
                        handleError(error, response);
                        callback(null, londonPeople, allUsers, true, error);
                    });
                });
            }
        },
        //8. Combine all Users
        function (londonPeople, allUsers, ifError, error, callback) {
            if (ifError) {
                callback(null, true, error);
            } else {
                callback(null, false, '');
            }
        },
    ],
        //FINAL FUNCTION after all functions above has executed
        function (err, ifError, error) {
            if (ifError) {
                console.log('Error occured: ' + JSON.parse(error));
                response.send(error);
            } else {
                console.log('No error in final');
                response.json('Done');
            }
        });
}

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
    // response.send(error);
}

// function to remove duplicates from the json array
function removeDuplicates(array, param) {
    console.log(_.uniqBy(array, param));
}