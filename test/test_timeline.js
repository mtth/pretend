/* jshint node: true */

(function () {
  'use strict';

  var pretend = require('../index.js'),
      assert = require('assert');

  (function testEmptyTimeline() {
    var emptyTimeline = new pretend.Timeline();
    assert.equal(emptyTimeline.read(), null);
  })();

})();
