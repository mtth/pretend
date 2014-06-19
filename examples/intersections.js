/* jshint node: true */

/**
 * Simulation API test.
 *
 * What it should look and feel like.
 * Let's start with the two lights example.
 *
 */

(function (root) {
  'use strict';

  var pretend = require('../index');

  function intersections() {

    var timeline = new pretend.Timeline();

    timeline
      .addResource('cars1', {state: 10})
      .setState(
        function (state) { return state + 1; },
        new pretend.stream.Poisson({rate: 5})
      );

    timeline
      .addResource('cars2', {state: 0});

    timeline
      .addResource('light1', {state: 'off'})
      .setState(
        switchState,
        new pretend.stream.Fixed({delay: 1})
      );

    timeline
      .addResource('light2', {state: 'on'})
      .setState(
        switchState,
        new pretend.stream.Uniform({minDelay: 1, maxDelay: 2})
      );

    // Let cars through on green at first light
    timeline.onChange(
      ['light1', 'cars1'],
      function (states) { return states[0] === 'on' && states[1] > 0; },
      function (states) {
        this.getResource('cars1').setState(0);
        this.getResource('cars2').setState(function (state) {
          return state + states[1];
        });
      }
    );

    // Let cars through on green at second light
    timeline.onChange(
      ['light2', 'cars2'],
      function (states) { return states[0] === 'on' && states[1] > 0; },
      function () { this.getResource('cars2').setState(0); }
    );

    function switchState(state) { return state === 'on' ? 'off' : 'on'; }

    return timeline;

  }

  root.exports = intersections;

})(module);
