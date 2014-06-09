/* jshint node: true */

/**
 * Carwash.
 *
 */

(function (root) {
  'use strict';

  var pretend = require('pretend'),
      util = require('util');

  // Helper to handle scalar resources
  function ScalarResource(id, value) {
    value = value || 0;
    pretend.Resource.call(this, id, {state: value});
  }
  util.inherits(ScalarResource, pretend.Resource);

  ScalarResource.prototype.isAvailable = function () {
    return this.hasState(function (state) { return state > 0; });
  };

  ScalarResource.prototype.offsetState = function (value) {
    return (function () {
      this.setState(this.getState() + value);
    }).bind(this);
  };

  // Main event loop
  function carwash() {

    var timeline = new pretend.Timeline(),
        cars = new ScalarResource('cars'),
        washers = new ScalarResource('washers', 5),
        arrival = new pretend.Delay({type: 'exp', rate: 1, repeat: true});

    timeline.after(arrival, cars.offsetState(1));

    timeline.when([cars.isAvailable, washers.isAvailable], function () {
      cars.offsetState(-1)();
      washers.offsetState(-1)();
      var delay = new timeline.Delay({type: 'uni', bounds: [1, 10]});
      timeline.when([delay], washers.offsetState(1));
    });

    return timeline;

  }

  root.exports = carwash;

})(module);
