/* jshint node: true */

(function (root) {
  'use strict';

  var util = require('util'),
      events = require('events'),
      assert = require('assert');

  /**
   * A timeline is not a readable stream.
   *
   */
  function Timeline() {
    events.EventEmitter.call(this);

    var time = 0,
        queue = [],
        resources = {};

    this.getResource = function (id) { return resources[id]; };

    this.getTime = function () { return time; };

    this.addResource = function (id, options) {

      var resource = resources[id] = new Resource(options)
        .on('delay', function (delay, callback) {
          if (delay !== null) {
            assert.ok(delay >= 0, "Cannot rewind history.");
            var eventTime = time + delay,
                i = 0,
                l = queue.length;
            while (i < l && queue[i].time <= eventTime) { i++; }
            queue.splice(i, 0, {time: eventTime, callback: callback});
          }
        });

      return resource;
    };

    this.next = function () {
      if (!queue.length) {
        return null;
      } else {
        var evt = queue.shift();
        time = evt.time;
        evt.callback();
        this.emit('epoch', time, getState());
        return this;
      }
    };

    function getState() {

      var states = {}, id;
      for (id in resources) {
        if (resources.hasOwnProperty(id)) {
          states[id] = resources[id].getState();
        }
      }

      return states;
    }

  }
  util.inherits(Timeline, events.EventEmitter);

  Timeline.prototype.onChange = function (resources, filter, callback) {

    if (typeof callback == 'undefined') {
      callback = filter;
      filter = undefined;
    }

    var onChange = (function (timeline) {

      // cache resources for performance
      var _resources = [];
      for (var i = 0, l = resources.length; i < l; i++) {
        _resources.push(timeline.getResource(resources[i]));
      }

      return function () {
        var states = [];
        for (var i = 0, l = _resources.length; i < l; i++) {
          states.push(_resources[i].getState());
        }
        if (!filter || filter.call(timeline, states)) {
          callback.call(timeline, states);
        }
      };

    })(this);

    for (var i = 0, l = resources.length; i < l; i++) {
      this.getResource(resources[i]).on('change', onChange);
    }

  };

  /**
   * A resource is a self contained state machine.
   *
   * Each time its state is updated, an event is emitted.
   *
   * Note that the state is kept inside the closure. We're among adults, but
   * just to make sure.
   *
   */
  function Resource(options) {
    events.EventEmitter.call(this);

    var _state = options.state;

    this.getState = function () { return _state; };

    this.setState = function (state, delay) {

      var emit = this.emit.bind(this);

      if (typeof delay == 'undefined') {

        changeState(); // synchronous

      } else {

        if (typeof delay == 'number') {
          emit('delay', delay, changeState);
        } else { // delay should be a stream
          emit('delay', delay.read(), delayCallback);
        }

      }

      return this;

      function changeState() {
        var newState = typeof state == 'function' ? state(_state) : state;
        if (newState !== _state) {
          var oldState = _state;
          _state = newState;
          emit('change', newState, oldState);
        }
      }

      function delayCallback() {
        changeState();
        emit('delay', delay.read(), delayCallback);
      }

    };

  }
  util.inherits(Resource, events.EventEmitter);

  root.exports = {
    Timeline: Timeline,
    Resource: Resource,
    stream: require('./stream')
  };

})(module);
