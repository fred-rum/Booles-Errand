// Copyright 2016 Christopher P. Nelson - All rights reserved.

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
  if (!this.timer && this.running){
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
  this.new_events.push(obj);
  this.start();
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
