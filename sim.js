// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Sim(be) {
  this.be = be;
  this.old_output_events = [];
  this.old_other_events = [];
  this.new_output_events = [];
  this.new_other_events = [];
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
  if (this.running) return;

  $("#button-play").hide();
  $("#button-pause").show();
  this.running = true;
  this.start();
  if (!this.new_other_events.length && !this.new_output_events.length){
    this.be.level.done(true);
  }
};

Sim.prototype.click_pause = function () {
  $("#button-pause").hide();
  $("#button-play").show();
  this.running = false;
  this.pause();
};

Sim.prototype.start = function() {
  if (this.delay_timer){
    clearTimeout(this.delay_timer);
    this.delay_timer = undefined;
  }

  if (!this.timer){
    // start() gets called when any new event is registered.  If the
    // timer is not already running
    this.be.level.start();

    if (this.running){
      this.timer = setInterval($.proxy(this.tick, this), 50);
    }
  }
};

Sim.prototype.pause = function() {
  if (this.timer){
    clearInterval(this.timer);
    this.timer = undefined;
  }
};

Sim.prototype.register_obj = function(obj, fresh_cell_output) {
  if (!this.new_output_events.length && !this.new_other_events.length){
    this.start();
  }

  if (fresh_cell_output){
    this.new_output_events.push(obj);
  } else {
    this.new_other_events.push(obj);
  }
};

Sim.prototype.tick = function() {
  // Simulate through a gate if we don't pause at gates *or* if there
  // are no wire events to process.  (The latter implies that we
  // paused at a gate boundary, but were then restarted.)
  if ((this.pause_at != 'gate') || !this.new_other_events.length){
    this.old_output_events = this.new_output_events;
    this.new_output_events = [];
  } else {
    this.old_output_events = [];
  }
  this.old_other_events = this.new_other_events;
  this.new_other_events = [];

  for (var i = 0; i < this.old_output_events.length; i++) {
    this.old_output_events[i].tick(this.speed);
  }
  for (var i = 0; i < this.old_other_events.length; i++) {
    this.old_other_events[i].tick(this.speed);
  }

  if (!this.new_other_events.length && !this.new_output_events.length){
    this.pause();
    this.be.level.done(false);
  } else if ((this.pause_at == 'gate') && !this.new_other_events.length){
    this.click_pause();
  }
};

Sim.prototype.reset = function() {
  this.pause();
  this.new_output_events = [];
  this.new_other_events = [];
};

Sim.prototype.pass_row = function(next_row, fresh_play) {
  if (fresh_play){
    this.be.level.select_row(next_row);
  } else if (this.pause_at == 'done') {
    var func = $.proxy(this.pass_delay_complete, this, next_row);
    this.delay_timer = setTimeout(func, 1000/this.speed);
  } else {
    this.click_pause();
  }
};

Sim.prototype.pass_delay_complete = function(next_row) {
  this.delay_timer = undefined;
  this.be.level.select_row(next_row);
}

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
