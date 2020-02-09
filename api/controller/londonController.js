'use strict';

var https = require('https');
var _ = require('lodash');
var async = require("async");
// people living only in london only
var londonPeopleOnly = "";
// count of people in london only
var countOfPeopleInAndAroundLondon = 0;
// all users
var allUsers = "";
// File handling module
const fs = require('fs');
// include library to calculate distance between 2 different coordinates
const geolib = require('geolib');
// London coordinates taken from Google Maps
var londonPos = { latitude: 51.507427, longitude: -0.127764 }
//Global variable to store all people in and around london within 50 miles of it;
var peopleInAndAroundLondon = [];

// API exposed that returns all the people living in London and within 50 miles of London
exports.getPeopleInAndAroundLondon = function (request, response) {
    async.waterfall([
        //1. Read all users received
        function (callback) {
            // read all users data file
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
                // iterate array for all users one at a time
                async.forEachSeries(allUsers, function (eachUser, callback) {
                    // get users within 50 miles of london - result is in meters
                    var dist = geolib.getPreciseDistance(londonPos, { latitude: eachUser.latitude, longitude: eachUser.longitude });
                    // check if user within 50 miles (convert meter to miles first)
                    if ((dist * 0.000621371) <= 50) {
                        // process data
                        peopleInAndAroundLondon.push(eachUser);
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
        // 3. Function to read only london people from json file
        function (ifError, error, callback) {
            if (ifError) {
                handleError(error);
                callback(null, true, error);
            } else {
                //
                fs.readFile('./onlyLondonPeopleFromAPI.json', 'utf8', (fileErr, londonPeopleOnly) => {
                    // file reading error handling
                    if (fileErr) {
                        handleError(fileErr);
                        callback(null, true, fileErr);
                    }
                    // parse data
                    londonPeopleOnly = JSON.parse(londonPeopleOnly);
                    callback(null, londonPeopleOnly, false, '');
                });
            }
        },
        // 4. Function to edit overall list of all all people in and within 50 miles of london
        function (londonPeopleOnly, ifError, error, callback) {
            async.forEachSeries(londonPeopleOnly, function (eachUserOnlyLondon, callback) {
                // Add all people in London from swagger API 
                peopleInAndAroundLondon.push(eachUserOnlyLondon);
                callback();
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
    ],
        //FINAL FUNCTION after all functions above has executed
        function (err, ifError, error) {
            if (ifError) {
                handleError(error);
                response.send(error);
            } else {
                // Remove any duplicate data by id
                peopleInAndAroundLondon = removeDuplicates(peopleInAndAroundLondon, 'id');

                // construct the final response
                var finalResponse= {
                    "numberOfPeople": peopleInAndAroundLondon.length,
                    "peopleData": peopleInAndAroundLondon
                }
                // print the final response
                console.log(finalResponse);
                // send the response to the API call
                response.json(finalResponse);
            }
        });
}

// Function to handle the error
function handleError(error) {
    console.error("Error: ", JSON.stringify(error, null, 2));
}

// function to remove duplicates from the json array based on a key
function removeDuplicates(array, param) {
    array = _.uniqBy(array, param);
    return array;
}
