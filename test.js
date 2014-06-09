/* jshint node: true */

(function () {
  'use strict';

  var pretend = require('./index.js'),
      assert = require('assert');

  (function testEmptyTimeline() {
    var emptyTimeline = new pretend.Timeline();
    assert.equal(emptyTimeline.read(), null);
  })();

  (function testSingleDelayTimeline() {
    var timeline = new pretend.Timeline(),
        delay = new pretend.Delay({value: 2}),
        step = 0,
        time = 0;
    timeline.after(delay, function (s, t) { step = s; time = t; });
    assert.deepEqual(timeline.read(), {state: {}, step: 1, time: 2});
    assert.equal(timeline.read(), null);
    assert.equal(step, 1);
    assert.equal(time, 2);
  })();

  (function testMultipleDelayTimeline() {
    var timeline = new pretend.Timeline(),
        delay = new pretend.Delay({value: 3, repeat: true}),
        step = 0,
        time = 0;
    timeline.after(delay, function (s, t) { step = s; time = t; });
    assert.deepEqual(timeline.read(), {state: {}, step: 1, time: 3});
    assert.deepEqual(timeline.read(), {state: {}, step: 2, time: 6});
    assert.equal(step, 2);
    assert.equal(time, 6);
  })();

  (function testResourceTrigger() {
    var t = new pretend.Timeline(),
        d = new pretend.Delay({value: 3, repeat: true}),
        r = new pretend.Resource('resource', 0);
    t.after(d, function () { r.setState(r.getState() + 1); });
    t.when([r.hasState(2)], function () { r.setState(0); });
    assert.equal(r.getState(), 0);
    t.read();
    assert.equal(r.getState(), 1);
    t.read();
    assert.equal(r.getState(), 0);
  })();

  (function testResourceTriggerComplex() {
    var t = new pretend.Timeline(),
        c = new pretend.Resource('cars', {state: 10}),
        l = new pretend.Resource('light', {state: 'off'}),
        cd = new pretend.Delay({type: 'exp', rate: 5, repeat: true}),
        ld = new pretend.Delay({type: 'uni', bounds: [0, 10], repeat: true}),
        step = 0;

    t.after(cd, function () { c.setState(c.getState() + 1); });

    t.after(ld, function () {
      if (l.getState() == 'on') {
        l.setState('off');
      } else {
        l.setState('on');
      }
    });

    t.when(
      [l.hasState('on'), c.hasState(function (state) { return state > 0; })],
      function (step) {
        console.log(c.getState() + ' cars going at step ' + step);
        c.setState(0);
      }
    );

    while (step < 1000) {
      step++;
      t.read();
    }

  })();

})();
