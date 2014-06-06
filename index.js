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

  var util = require('util'),
      events = require('events'),
      _ = require('lodash');

  var cache = {},
      queue = [];

  // tick is a function that can be passed to determine when the resource
  // gets replenished. it will be called with itself as context. to increment
  // by more/less than one, the function can return an object {'interval',
  // 'amount'}
  function Resource(id, tick) {
    events.EventEmitter.call(this);

    var self = cache[id] = this;
    self._amount = 0;

    if (tick) {
      onTick();
    }

    function onTick() {
      var interval = tick.call(self);
      self.emit('tick');
      self._amount += 1;
      setTimeout(onTick, interval);
    }

  }
  util.inherits(Resource, events.EventEmitter);

  Resource.prototype.consume = function (amount, silent) {
    amount = typeof amount != 'undefined' ? Math.min(amount, this._amount)
                                          : this._amount;
    this._amount -= amount;
    if (!silent) {
      this.emit('tick');
    }
    return amount;
  };

  // resources can either be a list of ids or a list of objects {'id',
  // 'amount'}
  // callback will be passed each resource as argument. the amounts will
  // already have been removed
  Resource.available = function (resources, callback) {

    var _resources = _.map(resources, function (s) { return cache[s]; });

    function onAvailable() {
      _.each(_resources, function (o) { o._amount -= 1; });
      callback.apply(null, _resources);
    }

    function onTick() {
      var isAvailable = _.all(_resources, function (o) { return o._amount > 0; });
      if (isAvailable) {
        onAvailable();
      }
    }

    _.each(_resources, function (o) { o.on('tick', onTick); });

  };

  root.exports = {
    Resource: Resource
  };

})(module);
