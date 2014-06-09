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

  var pretend = require('pretend');

  function intersections() {

    // Resources
    var timeline = new pretend.Timeline(),
        cars1 = new pretend.Resource('cars1', {state: 10}),
        cars2 = new pretend.Resource('cars2', {state: 0}),
        light1 = new pretend.Resource('light1', {state: 'off'}),
        light2 = new pretend.Resource('light1', {state: 'on'});

    // Dependencies

    // Initial car arrivals
    timeline.when([new timeline.Delay({type: 'exp', rate: 5})], function () {
      cars1.setState(cars1.getState() + 1);
    });

    // First light color switching
    timeline.when([new timeline.Delay({type: 'exp', rate: 0.5})], function () {
      switchState(light1);
    });

    // Second light color switching
    timeline.when([new timeline.Delay({type: 'exp', rate: 0.1})], function () {
      switchState(light2);
    });

    // Let cars through on green at first light
    timeline.when([light1.hasState('on')], function () {
      var waitingCars = cars1.getState();
      cars1.setState(0);
      cars2.setState(waitingCars);
    });

    // Let cars through on green at second light
    timeline.when([light2.hasState('on')], function () {
      cars2.setState(0);
    });

    function switchState(light) {
      if (light.getState() == 'on') {
        light.setState('off');
      } else {
        light.setState('on');
      }
    }

    return timeline;

  }

  root.exports = intersections;

})(module);
