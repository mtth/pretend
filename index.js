/* jshint node: true */

(function (root) {
  'use strict';

  var util = require('util'),
      events = require('events'),
      assert = require('assert'),
      stream = require('stream');

  /**
   * A trigger is an event that also exposes the resources that trigger it.
   *
   * Events is an object with keys a comma separated list of resource IDs and
   * value an associated callback with a check.
   *
   */
  function Delay(opts) {
    events.EventEmitter.call(this);
    this.repeat = opts.repeat || false;

    switch (opts.type) {
      case 'exp':
        this.getOffset = (function (rate) {
          return function () { return - Math.log(Math.random()) / rate; };
        })(opts.rate || 1);
        break;
      case 'uni':
        this.getOffset = (function (low, high) {
          low = low || 0;
          high = high || 1;
          var range = high - low;
          return function () { return low + range * Math.random(); };
        })(opts.bounds[0], opts.bounds[1]);
        break;
      default:
        this.getOffset = function () { return opts.value; };
    }

  }
  util.inherits(Delay, events.EventEmitter);

  Delay.prototype.next = function () {
    this.emit('event', this.getOffset());
  };

  /**
   * A timeline is a readable stream.
   *
   * TODO: add a seed as argument to the timeline, that allows reproducing the
   * random delays generated.
   *
   */
  function Timeline() {
    stream.Readable.call(this, {objectMode: true});

    var step = 0,
        time = 0,
        queue = [],
        state = {};

    this.getTime = function () { return time; };

    this._add = function (eventTime, cb) {
      assert.ok(eventTime >= time, "Cannot rewind history.");
      var i = 0, l = queue.length;
      while (i < l && queue[i].time <= eventTime) { i++; }
      queue.splice(i, 0, {time: eventTime, cb: cb});
    };

    this._read = function () {
      if (!queue.length) {
        this.push(null);
      } else {
        var evt = queue.shift();
        step++;
        time = evt.time;
        evt.cb(step, time);
        this.push({state: state, step: step, time: time});
      }
    };

  }
  util.inherits(Timeline, stream.Readable);

  Timeline.prototype.after = function (delay, cb) {
    var eventTime = this.getTime(),
        _cb = delay.repeat ? function (s, t) { delay.next(); cb(s, t); } : cb;
    delay.on('event', (function (timeline) {
      return function (offset) {
        eventTime += offset;
        timeline._add(eventTime, _cb);
      };
    })(this));
    delay.next();
  };

  Timeline.prototype.when = function (triggers, cb) {
    var filters = [],
        i, l, filter, trigger;

    for (i = 0, l = triggers.length; i < l; i++) {
      if (filter = triggers[i].filter) {
        filters.push(filter);
      }
    }

    var onEvent = (function (timeline) {
      return function onEvent(state, oldState) {
        for (var i = 0, l = filters.length; i < l; i++) {
          if (!filters[i](state, oldState)) { return; }
        }
        cb(timeline.step, timeline.time);
      };
    })(this);

    for (i = 0, l = triggers.length; i < l; i++) {
      trigger = triggers[i];
      trigger.resource.on('event', onEvent);
    }

  };

  /**
   * A resource is a self contained state machine.
   *
   * Each time its state is updated, an event is emitted.
   *
   * resource:ID
   *
   */
  function Resource(id, state) {
    events.EventEmitter.call(this);

    // Check that ID conforms to format
    assert.ok(typeof id == 'string', 'Resource ID must be a string.');
    this.id = id;

    // Keep state private inside the closure, to ensure consistency
    this.getState = function () { return state; };
    this.setState = function (newState) {
      var oldState = state;
      state = newState;
      this.emit('event', state, oldState);
    };

  }
  util.inherits(Resource, events.EventEmitter);

  Resource.prototype.hasState = function (filter) {
    if (typeof filter != 'function') {
      return this.hasState(function (state) { return state === filter; });
    } else {
      return {resource: this, filter: filter};
    }
  };

  root.exports = {
    Timeline: Timeline,
    Resource: Resource,
    Delay: Delay
  };

})(module);
