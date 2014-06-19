/* jshint node: true */

(function () {
  'use strict';

  var Resource = require('../index.js').Resource,
      pstream = require('../stream.js'),
      assert = require('assert');

  (function testGetState() {
    var resource = new Resource({state: 12});
    assert.equal(resource.getState(), 12);
  })();

  (function testSetStateDirectly() {
    var resource = new Resource({state: 12}),
        eventTriggered = false,
        changeTriggered = false;
    resource.on('moment', function (delay, callback) {
      eventTriggered = true;
      assert.equal(delay, 0);
      callback();
    });
    resource.on('change', function () { changeTriggered = true; });
    resource.setState(5);
    assert.ok(eventTriggered);
    assert.equal(resource.getState(), 5);
    assert.ok(changeTriggered);
  })();

  (function testSetStateDirectlyWithDelay() {
    var resource = new Resource({state: 12}),
        eventTriggered = false,
        changeTriggered = false;
    resource.on('moment', function (delay, callback) {
      eventTriggered = true;
      assert.equal(delay, 3);
      callback();
    });
    resource.on('change', function () { changeTriggered = true; });
    resource.setState(5, 3);
    assert.ok(eventTriggered);
    assert.equal(resource.getState(), 5);
    assert.ok(changeTriggered);
  })();

  (function testSetStateWithCallback() {
    var resource = new Resource({state: 12});
    resource.on('moment', function (delay, callback) { callback(); });
    resource.setState(function (state) { return state + 1; });
    assert.equal(resource.getState(), 13);
  })();

  (function testSetStateWithCallbackAndDelay() {
    var resource = new Resource({state: 12});
    resource.on('moment', function (delay, callback) { callback(); });
    resource.setState(function (state) { return state + 1; }, 2);
    assert.equal(resource.getState(), 13);
  })();

  (function testSetStateWithStream() {
    var resource = new Resource({state: 0});
    resource.on('moment', function (delay, cb) { if (delay) { cb(); } });
    resource.setState(
      function (state) { return state + 1; },
      new pstream.Fixed({delay: 1, limit: 2})
    );
    assert.equal(resource.getState(), 2);
  })();

})();
