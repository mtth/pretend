/* jshint node: true */

/**
 * Simulation API test.
 *
 * What it should look and feel like.
 * Let's start with the two lights example.
 *
 */

(function () {
  'use strict';

  var pretend = require('./index');

  function intersections() {

    var timeline = new pretend.Timeline(),
        cars1 = new pretend.Resource('cars1', {state: 10}),
        cars2 = new pretend.Resource('cars2', {state: 0}),
        light1 = new pretend.Resource('light1', {state: 'off'}),
        light2 = new pretend.Resource('light1', {state: 'on'}),
        timer1 = new pretend.timer.Exponential(0.1),
        timer2 = new pretend.timer.Exponential(0.1),
        timer3 = new pretend.timer.Exponential(0.01);

    timeline.when([timer1], function () { cars1.setState(cars1.getState() + 1); });
    timeline.when([timer2], function () { switchState(light1); });
    timeline.when([timer3], function () { switchState(light2); });

    timeline.when([light1.hasState('on')], function () {
      var waitingCars = cars1.getState();
      cars1.setState(0);
      cars2.setState(waitingCars);
    });

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

  function carwash() {

    var timeline = new pretend.Timeline(),
        cars = new pretend.Resource('cars', {state: 0}),
        washer = new pretend.Resource('washer', {state: 5});

    // TODO

    return timeline;

  }

})();
