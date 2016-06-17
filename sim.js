// Copyright 2016 Chris Nelson - All rights reserved.

'use strict';

function Sim(be) {
  this.be = be;
  this.old_output_events = [];
  this.old_other_events = [];
  this.new_output_events = [];
  this.new_other_events = [];
  this.running = false;

  $(document).keypress($.proxy(this.keypress, this));

  $('#button-play').click($.proxy(this.click_play, this));
  $('#button-pause').click($.proxy(this.click_pause, this));

  this.pause_at = 'done';
  $('#pause-at-gate').click($.proxy(this.click_pause_at, this, 'gate'));
  $('#pause-at-line').click($.proxy(this.click_pause_at, this, 'line'));
  $('#pause-at-seq').click($.proxy(this.click_pause_at, this, 'seq'));
  $('#pause-at-done').click($.proxy(this.click_pause_at, this, 'done'));

  var speed = this.be.circuit.load_data('boole.state.speed');
  if (speed === undefined) speed = 1;
  speed = Number(speed);
  if (isNaN(speed) || (speed < 0.25) || ((speed > 16) && (speed != Infinity))) {
    speed = 1;
  }
  this.preferred_speed = speed;

  this.slider_min = 30;
  this.slider_default = 110;
  this.slider_max = 260;

  var slider = $('#speed-slider');
  this.slider_knob = $('#speed-knob')[0];
  this.slider_text = $('#speed-text')[0];
  this.slider_min_color = Raphael.getRGB('#88d');
  this.slider_max_color = Raphael.getRGB('#6d6');
  this.be.bdrag.drag(slider, this, 'speed',
                     {start: this.speed_drag_start,
                      move: this.speed_drag_move,
                      end: this.speed_drag_end});

  var linear = Math.log(speed)/Math.LN2; // log2
  if (speed == Infinity) {
    var x = this.slider_max;
  } else if (linear > 0) {
    x = (linear / 4) * (this.slider_max - this.slider_default) + this.slider_default;
  } else {
    var x = ((linear + 2) / 2) * (this.slider_default - this.slider_min) + this.slider_min;
  }
  this.set_slider(x);
}

Sim.prototype.resize_slider = function () {
  var slider = $('#speed-slider');
  var slider_offset = slider.offset();
  this.slider_left = slider_offset.left;
  this.slider_width = slider.width();
};

Sim.prototype.click_play = function () {
  if (this.running) return; // Should be impossible.

  $('#button-play').hide();
  $('#button-pause').show();
  this.running = true;
  this.is_still_paused = false;
  this.not_done();
  if (this.no_new_events()) {
    this.done(true);
  }
};

Sim.prototype.click_pause = function () {
  $('#button-pause').hide();
  $('#button-play').show();
  this.running = false;
  this.stop_timer();
};

Sim.prototype.not_done = function() {
  // If the regular simulation timer is currently running, then we
  // already know that we're not done, and we don't have to repeat
  // the not_done() actions.
  if (this.timer) return;

  // If we're currently delaying before doing something else, the call
  // of not_done() interrupts that and returns to regular simulation.
  if (this.delay_timer) {
    clearTimeout(this.delay_timer);
    this.delay_timer = undefined;
  }

  this.be.level.not_done();

  if (this.running) {
    this.timer = setInterval($.proxy(this.tick, this), 50);
  }
};

Sim.prototype.stop_timer = function() {
  if (this.timer) {
    clearInterval(this.timer);
    this.timer = undefined;
  }
  if (this.delay_timer) {
    clearTimeout(this.delay_timer);
    this.delay_timer = undefined;
  }
};

Sim.prototype.paused = function() {
  return !this.running;
};

Sim.prototype.no_new_events = function() {
  return !this.new_other_events.length && !this.new_output_events.length;
};

Sim.prototype.register_obj = function(obj, fresh_cell_output) {
  if (this.no_new_events()) {
    this.not_done();
  }

  if (fresh_cell_output) {
    this.new_output_events.push(obj);
  } else {
    this.new_other_events.push(obj);
  }
};

Sim.prototype.tick = function() {
  // Simulate through a gate if we don't pause at gates *or* if there
  // are no wire events to process.  (The latter implies that we
  // paused at a gate boundary, but were then restarted.)
  if ((this.pause_at != 'gate') || !this.new_other_events.length) {
    this.old_output_events = this.new_output_events;
    this.new_output_events = [];
  } else {
    this.old_output_events = [];
  }
  for (var i = 0; i < this.old_output_events.length; i++) {
    this.old_output_events[i].tick(this.speed);
  }

  this.old_other_events = this.new_other_events;
  this.new_other_events = [];
  for (var i = 0; i < this.old_other_events.length; i++) {
    this.old_other_events[i].tick(this.speed);
  }

  if (this.no_new_events()) {
    this.done(false);
  } else if ((this.pause_at == 'gate') && !this.new_other_events.length) {
    this.click_pause();
  }
};

Sim.prototype.reset = function() {
  this.stop_timer();
  this.new_output_events = [];
  this.new_other_events = [];
};

Sim.prototype.done = function(fresh_play) {
  this.stop_timer();

  var pass_status = this.be.level.done();
  if ((pass_status == 'fail') || (pass_status == 'done')) {
    if (fresh_play) {
      // The user clicked play, but there was nothing to do.
      // Delay briefly before pausing to show feedback that play was
      // clicked.
      this.delay_timer = setTimeout($.proxy(this.click_pause, this), 250);
    } else {
      this.click_pause();
    }
  } else if (fresh_play) {
    this.be.level.advance_truth(pass_status);
  } else if ((this.pause_at == 'done') ||
             ((this.pause_at == 'seq') && (pass_status != 'seq'))) {
    // Delay briefly, then continue to the next line or seq.
    this.delay_timer = setTimeout($.proxy(this.be.level.advance_truth,
                                          this.be.level, pass_status),
                                  Math.min(2000, 1000/this.speed));
  } else {
    // Pause-at-line or pause-at-seq.
    this.click_pause();
  }
};

Sim.prototype.keypress = function(event) {
  var key = String.fromCharCode(event.which);
  var bucky = event.ctrlKey || event.altKey || event.metaKey;

  if ((key == '-') && !bucky) {
    this.be.circuit.click_zoom_out();
  } else if (((key == '=') || (key == '+')) && !bucky) {
    this.be.circuit.click_zoom_in();
  } else if (((key == 'f') || (key == 'F')) && !bucky) {
    this.be.circuit.click_zoom_fit();
  } // else console.log(event.which + ' = "' + key + '"');
};

Sim.prototype.speed_drag_start = function(x, y) {
  this.speed_drag_move(x, y);
};

Sim.prototype.speed_drag_move = function(x, y) {
  x = (x - this.slider_left) * 350/this.slider_width;
  if (x >= this.slider_max) {
    x = this.slider_max;
    this.speed = Infinity;
  } else if (x > this.slider_default+15) {
    // linear ranges from 0.0 at slider_default to 4.0 at slider_max.
    var linear = 4.0 * (x - this.slider_default) / (this.slider_max - this.slider_default);
    this.speed = Math.pow(2, linear);
  } else if (x > this.slider_default-15) {
    x = this.slider_default;
    this.speed = 1.0;
  } else {
    if (x < this.slider_min) x = this.slider_min;
    // linear ranges from -2.0 at slider_min to 0.0 at slider_default.
    var linear = -2.0 + 2.0 * (x - this.slider_min) / (this.slider_default - this.slider_min);
    this.speed = Math.pow(2, linear);
  }

  this.set_slider(x);

  this.preferred_speed = this.speed;
  this.be.circuit.save_data('boole.state.speed', String(this.speed));
};

Sim.prototype.set_slider = function(x) {
  this.slider_knob.setAttribute('cx', x);

  var f = (x - this.slider_min) / (this.slider_max - this.slider_min);
  var min_color = this.slider_min_color;
  var max_color = this.slider_max_color;
  var r = min_color.r + (max_color.r - min_color.r) * f;
  var g = min_color.g + (max_color.g - min_color.g) * f;
  var b = min_color.b + (max_color.b - min_color.b) * f;
  this.slider_text.setAttribute('fill', Raphael.rgb(r, g, b));
};

Sim.prototype.speed_drag_end = function() {
  // no action needed
};

Sim.prototype.click_pause_at = function(type) {
  $('#pause-at-' + this.pause_at).removeClass('pause-at-selected');
  this.pause_at = type;
  $('#pause-at-' + this.pause_at).addClass('pause-at-selected');
};

Sim.prototype.begin_level = function(hidden_speed, sequenced) {
  if (hidden_speed) {
    $('#pause-at')[0].setAttribute('display', 'none');
    $('#speed-slider')[0].setAttribute('display', 'none');

    // We set the speed for this level to the default value, but we
    // retain the preferred speed for when the user returns to a level
    // that allows speed selection.
    this.speed = 1.0;
  } else {
    $('#pause-at')[0].setAttribute('display', '');
    $('#speed-slider')[0].setAttribute('display', '');
    this.speed = this.preferred_speed;

    if (sequenced) {
      $('#pause-at-seq').removeClass('pause-at-hidden');
    } else {
      $('#pause-at-seq').addClass('pause-at-hidden');
    }
  }

  // A new level always resets the pause-at setting.
  this.click_pause_at('done');
};
