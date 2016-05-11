// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Wire(io1, io2) {
    // When the user drags out new wires, he could be dragging in either
    // direction, so we reverse the ports as appropriate.  Note that the
    // null_cell has port type "null", so we have to look at the other
    // port to tell the desired direction.
    if ((io1.type == "output") || (io2.type == "input")){
	this.o = io1;
	this.i = io2;
    } else {
	this.o = io2;
	this.i = io1;
    }


    // Public members

    this.remove = function() {
	this.o.disconnect(this);
	this.i.disconnect(this);
	this.draw_fg.remove();
	this.draw_bg.remove();
	this.remove_subpaths();

	if (!this.pending_new){
	    // Update the attached cell input with the fact that it's
	    // disconnected.
	    this.i.update_value(undefined);
	}

	// In case the wire is disconnected while a value change is pending,
	// we disconnect the wire ends so that the change can't propagate.
	this.o = undefined;
	this.i = undefined;
    };

    this.color = function(value) {
	if (value === undefined) {
	    return "#000";
	} else if (value === 0){
	    return "#aaf";
	} else if (value === 1) {
	    return "#8d8";
	}
    };

    this.update_wire_color = function(value) {
	if (!this.pending_del){
	    var attr = {
		stroke: this.color(value)
	    };
	    this.draw_fg.attr(attr);
	}
    }

    this.remove_subpaths = function() {
	// Remove all propagating subpaths.
	for (var i = 0; i < this.in_flight.length; i++){
	    var fl_obj = this.in_flight[i];
	    if (fl_obj.draw){
		fl_obj.draw.remove();
		fl_obj.draw = undefined;
	    }
	}
    }

    this.mark_old = function(attr) {
	// If a value is propagating, draw_fg may be just the end of the path.
	// Reset it to the whole path, then mark the wire with the "old"
	// attributes.
	attr.path = this.path;
	this.draw_fg.attr(attr);

	// pending_del means that the wire (end) color cannot be modified.
	this.pending_del = true;

	this.remove_subpaths();
    }

    this.restore_old = function(attr) {
	this.pending_del = false;
	this.draw_fg.attr(attr);
	this.update_wire_color();
    }

    this.update_value = function() {
	// Don't propagate values across pending (uncommitted) new wires.
	// This also prevents propagating to the null cell.
	if (this.pending_new) return;

	var value = this.o.value;

	// If any values are in flight, the wire is already registered
	// to receive the next tick, so don't duplicate the registration.
	if ((!this.in_flight.length) && (this.newest_value === null)) {
	    this.sim.register_obj(this);
	}

	// A cell should only produce one value per tick, but if the user
	// moves the wire around, it could connect multiple values within
	// the same tick.  If so, overwrite the last received value.
	this.newest_value = value;
    };

    this.redraw_fg = function() {
	if (this.pending_del){
	    this.draw_fg.attr({path: this.path});
	    return;
	}

	var older_value = this.i.value;
	var older_draw = this.draw_fg;
	var older_age_len = this.path_length;

	for (var i = 0; i < this.in_flight.length; i++){
	    var fl_obj = this.in_flight[i];
	    var age_len = fl_obj.age * this.path_length;
	    var path = Raphael.getSubpath(this.path, age_len, older_age_len);
	    older_draw.attr({path: path});

	    if (!fl_obj.draw){
		// Draw a path placeholder of the appropriate color.
		// The actual path will be inserted at the next loop
		// iteration or the end of the loop.
		var attr = {
		    "stroke-width": 1,
		    stroke: this.color(fl_obj.value)
		};
		fl_obj.draw = this.paper.path("M0,0").attr(attr);
		fl_obj.draw.insertAfter(older_draw);
	    }

	    older_value = fl_obj.value;
	    older_draw = fl_obj.draw;
	    older_age_len = age_len;
	}

	var path;
	if (older_age_len >= this.path_length){
	    // This only happens if there are no values in flight.
	    path = this.path;
	} else {
	    path = Raphael.getSubpath(this.path, 0, older_age_len);
	}
	older_draw.attr({path: path});
    };

    this.tick = function() {
	// The wire could have been removed while we waited for the tick.
	// We still get the tick, but we don't do anything with it, and
	// we don't trigger any more ticks.
	if (!this.i) return;

	if (this.in_flight.length) {
	    // Don't propagate the newest value if it is the same as the most
	    // recent value in flight.
	    var fl_obj = this.in_flight[this.in_flight.length-1];
	    if (this.newest_value === fl_obj.value) this.newest_value = null;
	} else {
	    // No values are in flight, so don't propagate the newest value
	    // if it is the same as the value at the wire's output end.
	    if (this.newest_value === this.i.value) this.newest_value = null;
	}

	if (this.newest_value !== null){
	    var fl_obj = {
		age: 0,
		value: this.newest_value
	    };
	    this.in_flight.push(fl_obj);
	    this.newest_value = null;
	}

	for (var i = 0; i < this.in_flight.length; i++){
	    var fl_obj = this.in_flight[i];
	    fl_obj.age += 5 / this.path_length;
	    if (fl_obj.age >= 1.0){
		if (fl_obj.draw) fl_obj.draw.remove();
		this.update_wire_color(fl_obj.value);
		this.i.update_value(fl_obj.value);
		this.in_flight = this.in_flight.slice(1);
		i--;
	    }
	}

	if (!this.pending_del){
	    this.redraw_fg();
	}

	if (this.in_flight.length){
	    this.sim.register_obj(this);
	}
    };

    this.reorder_z = function(ref_bg, ref_fg) {
	this.draw_bg.insertBefore(ref_bg);
	this.draw_fg.insertBefore(ref_fg);
	for (var i = this.in_flight.length-1; i >= 0 ; i--){
	    if (this.in_flight[i].draw){
		this.in_flight[i].draw.insertBefore(ref_fg);
	    }
	}
    };


    // Private functions and members

    this.arcwire = function (x1, y1, xd, yd) {
	var x2 = x1+xd;
	var y2 = y1+yd;
	var r = 20;
	var dx = (x2-x1)/r;
	var dy = (y2-y1)/r;
	var slope, angle;
	var xa, ya, xb, yb, cwa, cwb, la, lb;

	if ((dx > 0) || (dy >= 4) || (dy <= -4)) {
	    var sign_y;
	    if (dy >= 0) {
		sign_y = 1;
		cwa = 1;
		cwb = 0;
	    } else {
		sign_y = -1;
		cwa = 0;
		cwb = 1;
		dy = -dy;
	    }

	    la = 0;
	    lb = 0;

	    if ((dx > 0) && (dy == 4)) {
		/* Slope with straight (angled) line, special case.
		   The normal equation divides 0 by 0 at exactly dy=4,
		   so here we take a short-cut to the correct value. */
		slope = 2/dx;
		angle = 2*Math.atan(slope);
		//console.log("y=4", dx, dy, slope, angle);
	    } else if ((dx <= 0) && (dy == 4)) {
		/* Arcs connected with straight (horizontal) line to the left.
		   The normal equation gets the wrong sign from atan,
		   so here we take a short-cut to the correct value. */
		angle = Math.PI;
		//console.log("x<0 y=4", dx, dy, "-0", angle);
	    } else if ((dx > 2) || (dy > 4) ||
		       ((dx > 0) && (dy < 2 - Math.sqrt(4 - dx*dx)))) {
		/* Normal case: straight line connects arcs with +/-slope. */
		slope = (Math.sqrt(dx*dx+(dy-4)*dy)-dx)/(dy-4)
		angle = 2*Math.atan(slope);
		//console.log("std", dx, dy, slope, angle);
	    } else {
		/* 0 < dx <= 2, sqrt < dy < 4 */
		/* Reduced radius, no straight line */
		slope = dy/dx;
		angle = 2*Math.atan(slope)
		r = r * dx * (slope*slope + 1) / (4 * slope);
		//console.log("<r", dx, dy, slope, angle);
	    }

	    xa = r*Math.sin(angle);
	    ya = r*(1-Math.cos(angle)) * sign_y;
	    xb = x2-xa;
	    yb = y2-ya;
	} else {
	    /* backwards and close; requires reverse swivel */
	    cwa = 0;
	    cwb = 0;

	    var xy = dx/dy;
	    if (dy >= 0){
		/* 0 < dy < 4 */
		la = 1;
		lb = 0;
		slope = Math.sqrt(xy*xy+1)-xy; /* slope < 0 */
		if (dy == 0){
		    /* xy == Infinity, so the slope value is poorly defined. */
		    angle = Math.PI;
		} else {
		    angle = 2*Math.atan(slope); /* 180 < angle < 270 */
		}
		//console.log("x<0,y>0", dx, dy, slope, angle);
	    } else {
		/* -4 < dy < 0 */
		la = 0;
		lb = 1;
		slope = Math.sqrt(xy*xy+1)+xy; /* slope > 0 */
		angle = -2*Math.atan(slope); /* 90 < angle < 180 */
		//console.log("x<0,y<0", dx, dy, slope, angle);
	    }

	    xa = -r*Math.sin(angle);     /* xa <= 0 */
	    ya = -r*(1-Math.cos(angle)); /* ya <= 0 */
	    xb = x2+xa;                 /* xb < x2 */
	    yb = y2+ya;                 /* yb < y2 */
	}

	this.path = ["M", x1, y1,
		     "a", r, r, 0, la, cwa, xa, ya,
		     "L", xb, yb,
		     "A", r, r, 0, lb, cwb, x2, y2];
	this.path_length = Raphael.getTotalLength(this.path);
    };

    this.compute = function() {
	x1 = this.o.cell.x + this.o.x;
	y1 = this.o.cell.y + this.o.y;
	x2 = this.i.cell.x + this.i.x;
	y2 = this.i.cell.y + this.i.y;
	this.arcwire(x1, y1, x2-x1, y2-y1);
    };

    this.redraw = function() {
	this.compute();
	this.draw_bg.attr("path", this.path);
	this.redraw_fg();
    };

    this.compute();

    var attr = {
	"stroke-width": 7,
	stroke: "#eee"
    };
    this.draw_bg = this.paper.path(this.path).attr(attr);

    var attr = {
	"stroke-width": 1,
	stroke: "#000"
    };
    this.draw_fg = this.paper.path(this.path).attr(attr);

    this.draw_bg.setAttr("pointer-events", "none");
    this.draw_fg.setAttr("pointer-events", "none");

    // Insert the new wire just above the null gate so that it is below
    // IO handles.  This is its default position, but its Z order may be
    // changed by o.connect().
    this.draw_bg.insertBefore(this.null_io.draw);
    this.draw_fg.insertAfter(this.draw_bg);

    this.o.connect(this);
    this.i.connect(this);

    this.pending_new = false;
    this.pending_del = false;
    this.newest_value = null;
    this.in_flight = [];
}
