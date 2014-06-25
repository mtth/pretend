/* jshint node: true */

(function () {
  'use strict';

  var pretend = require('../index.js'),
      assert = require('assert');

  (function testEmptyTimeline() {
    var emptyTimeline = new pretend.Timeline();
    assert.equal(emptyTimeline.read(), null);
  })();

  (function testSingleResourceTimeline() {
    var timeline = new pretend.Timeline();
    timeline.addResource('res', {state: 0})
      .setState

    assert.equal(emptyTimeline.read(), null);
  })();

})();
