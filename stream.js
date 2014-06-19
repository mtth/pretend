/* jshint node: true */

(function (root) {
  'use strict';

  var stream = require('stream'),
      util = require('util');


  /**
   * Generic delay process.
   *
   */
  function Process(options) {
    stream.Readable.call(this, {objectMode: true});

    // initialize options
    this.init(options);

    // implementation
    var limit = options.limit, step = 0;
    if (limit) {
      this._read = function () {
        this.push(step < limit ? this.getDelay(step++) : null);
      };
    } else {
      this._read = function () { this.push(this.getDelay(step++)); };
    }

  }
  util.inherits(Process, stream.Readable);

  Process.create = function (init, getDelay) {
    function SubProcess(options) { Process.call(this, options); }
    util.inherits(SubProcess, Process);
    SubProcess.prototype.init = init;
    SubProcess.prototype.getDelay = getDelay;
    return SubProcess;
  };

  root.exports = {

    Fixed: Process.create(
      function (options) { this._delay = options.delay; },
      function () { return this._delay; }
    ),

    Poisson: Process.create(
      function (options) { this._rate = options.rate; },
      function () { return -Math.log(Math.random()) / this._rate; }
    ),

    Uniform: Process.create(
      function (options) {
        this._minDelay = options.minDelay || 0;
        this._range = options.maxDelay - this._minDelay;
      },
      function () { return this._minDelay + Math.random() * this._range; }
    ),

  };

})(module);
