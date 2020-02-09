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
const fs = require('fs');
const geolib = require('geolib');
var londonPos = { latitude: 51.507427, longitude: -0.127764 }

exports.getPeopleInLondon = function (request, response) {
    async.waterfall([
        //1. Read all users received
        function (callback) {
            console.log('In function 1');
            fs.readFile('./allUsers.json', 'utf8', (fileErr, allUsers) => {
                // file reading error handling
                if (fileErr) {
                    handleError(fileErr);
                    callback(null, allUsers, true, fileErr);
                }
                allUsers = JSON.parse(allUsers);
                callback(null, allUsers, false, '');
            });
        },
        //2. Process each received each user from the file for calculating distance from london
        function (allUsers, ifError, error, callback) {
            if (ifError) {
                handleError(error);
                callback(null, true, error);
            } else {
                async.forEachSeries(allUsers, function (eachUser, callback) {
                    // get users within 50 miles of london - result is in meters
                    var dist = geolib.getPreciseDistance(londonPos, {latitude: eachUser.latitude, longitude: eachUser.longitude});
                    // check if user within 50 miles (convert meter to miles first)
                    if ((dist * 0.000621371) <= 50) {
                        // process data
                        console.log(eachUser.id);
                        // go to next user
                        callback();
                    } else {
                        // go to next user
                        callback();
                    }
                },
                    function (errFinal) {
                        if (errFinal) {
                            handleError(errFinal);
                            // continue to the next function
                            callback(null, true, errFinal);
                        } else {
                            // continue to the next function
                            callback(null, false, '');
                        }
                    });
            }
        },
    ],
        //FINAL FUNCTION after all functions above has executed
        function (err, ifError, error) {
            if (ifError) {
                handleError(error);
                response.send(error);
            } else {
                console.log('No error in final');
                response.json('Done');
            }
        });
}

// Function to handle the error
function handleError(error) {
    console.error("Error: ", JSON.stringify(error, null, 2));
}

// function to remove duplicates from the json array
function removeDuplicates(array, param) {
    console.log(_.uniqBy(array, param));
}
