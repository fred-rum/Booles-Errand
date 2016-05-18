// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

// Timer states:
//   timer = defined:
//     new_events = empty
//       may be checking for new events (with running = true), or
//       waiting for delay timout; can be interrupted by new registry.
//         in which case running may be true or false.
//     new_events = non-empty
//       simulating
//   timer = undefined:
//     new_events = empty
//       running may be true or false, but there's nothing to do
//     new_events = non-empty
//       running must be false; simulation is paused

function Sim(be) {
  this.be = be;
  this.old_events = [];
  this.new_events = [];
  this.running = false;
}

Sim.prototype.click_play = function () {
  $("#button-play").hide();
  $("#button-pause").show();
  this.running = true;
  this.start();
};

Sim.prototype.click_pause = function () {
  $("#button-pause").hide();
  $("#button-play").show();
  this.running = false;
  this.pause();
};

Sim.prototype.start = function() {
  if (this.timer && !this.new_events.length){
    // It must be a delay.  Cancel it and go back to normal running.
    this.pause();
  }
  if (!this.timer && this.running){
    this.be.level.start();
    this.timer = setInterval($.proxy(this.tick, this), 50);
  }
};

Sim.prototype.pause = function() {
  if (this.timer){
    clearInterval(this.timer);
    this.timer = undefined;
  }
};

Sim.prototype.register_obj = function(obj) {
  this.start();
  this.new_events.push(obj);
};

Sim.prototype.tick = function() {
  this.old_events = this.new_events;
  this.new_events = [];
  for (var i = 0; i < this.old_events.length; i++) {
    this.old_events[i].tick();
  }
  if (!this.new_events.length) {
    this.pause();
    this.be.level.done();
  }
};

Sim.prototype.reset = function() {
  this.pause();
  this.new_events = [];
};

Sim.prototype.delay = function(func, milliseconds) {
  this.timer = setTimeout(func, milliseconds)
};
