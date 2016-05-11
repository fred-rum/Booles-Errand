// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Sim() {
    this.old_events = [];
    this.new_events = [];

    this.start = function() {
	this.timer = setInterval($.proxy(this.tick, this), 1000);
    };

    this.pause = function() {
	clearInterval(this.timer);
    };

    this.register_obj = function(obj) {
	this.new_events.push(obj);
    };

    this.tick = function() {
	this.old_events = this.new_events;
	this.new_events = [];
	for (var i = 0; i < this.old_events.length; i++) {
	    this.old_events[i].tick();
	}
    };
}
