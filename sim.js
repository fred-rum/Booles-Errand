// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Sim() {
    this.start = function() {
	this.timer = setInterval($.proxy(this.tick, this), 1000);
    }

    this.pause = function() {
	clearInterval(this.timer);
    }

    this.tick = function() {
	this.pause();
    }
}
