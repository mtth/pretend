/* jshint node: true */

(function () {
  'use strict';

  var pstream = require('../stream.js'),
      assert = require('assert');

  (function testFixedStream() {
    var fixed = new pstream.Fixed({delay: 2});
    assert.equal(fixed.read(), 2);
    assert.equal(fixed.read(), 2);
    assert.equal(fixed.read(), 2);
  })();

  (function testFixedStreamLimit() {
    var fixed = new pstream.Fixed({delay: 2, limit: 1});
    assert.equal(fixed.read(), 2);
    assert.equal(fixed.read(), null);
  })();

  (function testUniformStream() {
    var uniform  = new pstream.Uniform({minDelay: 1, maxDelay: 5, limit: 2}),
        first = uniform.read(),
        second = uniform.read();
    assert.ok(1 < first < 5);
    assert.ok(1 < second < 5);
    assert.ok(first != second);
    assert.equal(uniform.read(), null);
  })();

})();
