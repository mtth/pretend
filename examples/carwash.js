/* jshint node: true */

/**
 * Carwash.
 *
 */

(function (root) {
  'use strict';

  var pretend = require('../index');

  function carwash() {

    var timeline = new pretend.Timeline();

    // cars
    timeline.addResource('cars', {state: 0})
      .setState(
        function (state) { return state + 1; },
        new pretend.stream.Poisson({rate: 5})
      );

    // washers
    timeline.addResource('washers', {state: 5});

    timeline.onChange(
      ['cars', 'washers'],
      function (states) { return states[0] > 0 && states[1] > 0; },
      function () {
        this.getResource('cars').setState(function (s) { return s - 1; });
        this.getResource('washers')
          .setState(function (s) { return s - 1; })
          .setState(function (s) { return s + 1; }, 2);
      }
    );

    return timeline;

  }

  root.exports = carwash;

})(module);
