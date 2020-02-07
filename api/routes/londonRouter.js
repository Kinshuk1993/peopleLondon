'use strict';

module.exports = function (app) {
  var londonController = require('../controller/londonController');

  // routes
  app.route('/getPeopleLondon')
    .get(londonController.getPeopleInLondon)
};
