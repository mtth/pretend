/* jshint node: true */

(function (root) {
  'use strict';

  root.exports.Uniform = function () {
    return Math.random();
  };

  root.exports.Exponential = function (rate) {
    rate = rate || 1;
    return -Math.log(Math.random()) / rate;
  };

})(module);
