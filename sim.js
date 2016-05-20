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

  $(document).keydown($.proxy(this.keydown, this));

  $("#button-play").click($.proxy(this.click_play, this));
  $("#button-pause").click($.proxy(this.click_pause, this));

  this.pause_at = 'done';
  this.set_pause_at_color(this.pause_at, true);
  $("#pause-at-gate").click($.proxy(this.click_pause_at, this, 'gate'));
  $("#pause-at-flop").click($.proxy(this.click_pause_at, this, 'flop'));
  $("#pause-at-pass").click($.proxy(this.click_pause_at, this, 'pass'));
  $("#pause-at-done").click($.proxy(this.click_pause_at, this, 'done'));

  this.speed = 1.0;
  var slider = $("#speed-slider");
  this.slider_knob = $("#speed-knob")[0];
  this.slider_text = $("#speed-text")[0];
  this.slider_min_color = Raphael.getRGB("#88d");
  this.slider_max_color = Raphael.getRGB("#6d6");
  slider.mousedown($.proxy(this.speed_drag, this));
  slider.mousemove($.proxy(this.speed_drag, this));
}

Sim.prototype.resize_slider = function () {
  var slider = $("#speed-slider");
  var slider_offset = slider.offset();
  this.slider_left = slider_offset.left;
  this.slider_width = slider.width();
};

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
    this.old_events[i].tick(this.speed);
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

Sim.prototype.pass_row = function(func) {
  if (this.pause_at == 'done'){
    this.timer = setTimeout(func, 1000/this.speed);
  } else {
    this.click_pause();
  }
};

Sim.prototype.pass_all = function() {
  this.click_pause();
};

Sim.prototype.keydown = function(event) {
  var key = String.fromCharCode(event.which);
  var bucky = event.ctrlKey || event.shiftKey || event.altKey || event.metaKey;
    
  if ((key == 'F') && !bucky){
    this.be.circuit.fit_view();
    this.be.circuit.update_view();
  }
};

Sim.prototype.speed_drag = function(event) {
  if (!event.buttons) return;

  var x = (event.pageX - this.slider_left) * 350/this.slider_width;
  var slider_min = 30;
  var slider_default = 110;
  var slider_max = 260;

  if (x >= slider_max){
    x = slider_max;
    this.speed = Infinity;
  } else if (x > slider_default+15){
    // linear ranges from 0.0 at slider_default to 4.0 at slider_max.
    var linear = 4.0 * (x - slider_default) / (slider_max - slider_default);
    this.speed = Math.pow(2, linear);
  } else if (x > slider_default-15){
    x = slider_default;
    this.speed = 1.0;
  } else {
    if (x < slider_min) x = slider_min;
    // linear ranges from -2.0 at slider_min to 0.0 at slider_default.
    var linear = -2.0 + 2.0 * (x - slider_min) / (slider_default - slider_min);
    this.speed = Math.pow(2, linear);
  }

  this.slider_knob.setAttribute('cx', x);

  var f = (x - slider_min) / (slider_max - slider_min);
  var min_color = this.slider_min_color;
  var max_color = this.slider_max_color;
  var r = min_color.r + (max_color.r - min_color.r) * f;
  var g = min_color.g + (max_color.g - min_color.g) * f;
  var b = min_color.b + (max_color.b - min_color.b) * f;
  this.slider_text.setAttribute('fill', Raphael.rgb(r, g, b));
};

Sim.prototype.click_pause_at = function(type) {
  this.set_pause_at_color(this.pause_at, false);
  this.pause_at = type;
  this.set_pause_at_color(this.pause_at, true);
};

Sim.prototype.set_pause_at_color = function(type, enabled) {
  var color = enabled ? '#f0d0d0' : 'none'
  $("#pause-at-" + type)[0].setAttribute('fill', color);
}
