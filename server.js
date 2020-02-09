var express = require('express');
var london = express();
var port = process.env.PORT || 3000;
var https = require('https');
var allUsers = "";
var londonPeople = "";
var fs = require('fs');

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

// Function to get all users from the API call
function getAllUsers() {
    https.get('https://bpdts-test-app.herokuapp.com/users', res => {
        // set encoding style
        res.setEncoding("utf8");
        //keep reading data till it comes
        res.on("data", data => {
            allUsers += data;
        });
        // when no more data incoming, process data
        res.on("end", () => {
            // parse json object
            allUsers = JSON.parse(allUsers);
            // stringify to readabale format
            allUsers = JSON.stringify(allUsers, null, 2);
            //write contents to the file
            fs.writeFile("allUsers.json", allUsers, 'utf8', function (err) {
                // handle file write error and return
                if (err) {
                    console.log("An error occured while writing all users to File.");
                    return console.log(err);
                }
                // confirmation of file creation
                console.log("All users file has been saved.");
            });
        });

        // error handling for https request
        res.on("error", (error) => {
            console.error("Error occured in getting data for All users: ", error);
        });
    });
}

// Function to get count of people living in london using the swagger API call
function getPeopleLondon(request, response) {
    https.get('https://bpdts-test-app.herokuapp.com/city/London/users', res => {
        // set encoding style
        res.setEncoding("utf8");
        //keep reading data till it comes
        res.on("data", data => {
            londonPeople += data;
        });
        // when no more data incoming, process data
        res.on("end", () => {
            // parse json object
            londonPeople = JSON.parse(londonPeople);
            // stringify to readabale format
            londonPeople = JSON.stringify(londonPeople, null, 2);
            //write contents to the file
            fs.writeFile("londonPeople.json", londonPeople, 'utf8', function (err) {
                // handle file write error and return
                if (err) {
                    console.log("An error occured while writing London users to File.");
                    return console.log(err);
                }
                // confirmation of file creation
                console.log("London users file has been saved.");
            });
        });

        // error handling for https request
        res.on("error", () => {
            console.error("Error occured in getting all London users: ", error);
        });
    });
}

// get all Users and London from the swager API as soon as the server starts and write to separate files
getAllUsers();
getPeopleLondon();