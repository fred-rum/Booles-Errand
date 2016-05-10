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
    };

    this.compute = function() {
	x1 = this.o.cell.x + this.o.x;
	y1 = this.o.cell.y + this.o.y;
	x2 = this.i.cell.x + this.i.x;
	y2 = this.i.cell.y + this.i.y;
	this.arcwire(x1, y1, x2-x1, y2-y1);
    }

    this.redraw = function() {
	this.compute();
	this.draw_bg.attr("path", this.path);
	this.draw_fg.attr("path", this.path);
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
    }
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


    // Public members

    this.remove = function() {
	this.o.disconnect(this);
	this.i.disconnect(this);
	this.draw_fg.remove();
	this.draw_bg.remove();
    }
};
