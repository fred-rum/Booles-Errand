// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Cell(type, x, y) {
    var paper = this.paper;
    this.type = type;
    this.x = x;
    this.y = y;
    this.io = {};
    this.newest_value = null;

    this.connection_spacing = 20;
    this.connection_width = 10;
    this.inv_size = 10;

    this.cell_fg_attr = {
	"stroke-width": 3,
	"stroke-linejoin": "miter",
	stroke: "#000",
	fill: "#fff"
    };
    this.cell_bg_attr = {
	"stroke-width": 9,
	"stroke-linejoin": "round",
	stroke: "#eee"
    };

    // For the case that the foreground lines & fill are drawn separately.
    this.cell_fg_line_attr = {
	"stroke-width": 3,
	"stroke-linejoin": "miter",
	"stroke-linecap": "round",
	stroke: "#000",
	fill: "none"
    };
    this.cell_fg_fill_attr = {
	"stroke-width": 3,
	"stroke-linejoin": "miter",
	stroke: "#fff",
	fill: "#fff"
    };

    this.stub_fg_attr = {
	"stroke-width": 1,
	stroke: "#000"
    };
    this.stub_bg_attr = {
	"stroke-width": 7,
	stroke: "#eee",
	"stroke-linecap": "round"
    };


    // Public members

    this.drive_output = function(value) {
	this.io["o"].update_value(value);
    };

    this.update_value = function() {
	var calc_func_name = "calc_" + this.type;
	if (!this[calc_func_name]) return;
	var value = this[calc_func_name]();

	// Don't propagate the value if it is the same as the value at
	// the cell's output.  (Eventually this should look at
	// the newest progating value in the cell, once that's supported.)
	if (value === this.io.o.value) return;

	// Due to changing inputs, a cell may calculate more than one new
	// value per tick.  If that happens, record the last value, but don't
	// re-register the cell for ticking.
	if (this.newest_value === null) {
	    this.sim.register_obj(this);
	}
	this.newest_value = value;
    };

    this.tick = function() {
	this.io.o.update_value(this.newest_value);
	this.newest_value = null;
    }


    // Private functions & members

    this.calc_buf = function(inv) {
	var i = this.io.i.value;
	if (i === undefined) return undefined;
	var value = i;
	if (inv) value = 1-value;
	return value;
    };
    this.calc_inv = function() { return this.calc_buf(true); };

    this.calc_and = function(inv) {
	var i0 = this.io.i0.value;
	var i1 = this.io.i1.value;
	var value;
	if ((i0 === 0) || (i1 === 0)){
	    value = 0;
	} else if ((i0 === undefined) || (i1 === undefined)){
	    return undefined;
	} else {
	    value = 1;
	}
	if (inv) value = 1-value;
	return value;
    };
    this.calc_nand = function() { return this.calc_and(true); };

    this.calc_or = function(inv) {
	var i0 = this.io.i0.value;
	var i1 = this.io.i1.value;
	var value;
	if ((i0 === 1) || (i1 === 1)){
	    value = 1;
	} else if ((i0 === undefined) || (i1 === undefined)){
	    return undefined;
	} else {
	    value = 0;
	}
	if (inv) value = 1-value;
	return value;
    };
    this.calc_nor = function() { return this.calc_or(true); };

    this.calc_xor = function(inv) {
	var i0 = this.io.i0.value;
	var i1 = this.io.i1.value;
	var value;
	if ((i0 === undefined) || (i1 === undefined)){
	    return undefined;
	}
	value = i0 ^ i1;
	if (inv) value = 1-value;
	return value;
    };
    this.calc_xnor = function() { return this.calc_xor(true); };

    function cell_drag_start(x, y, event) {
	this.drag_dx = 0;
	this.drag_dy = 0;
	this.drag.disable_hover();
    }

    function cell_drag_move(dx, dy, x, y, event) {
	this.x += dx - this.drag_dx;
	this.y += dy - this.drag_dy;
	this.drag_dx = dx;
	this.drag_dy = dy;
	this.draw.transform("t" + this.x + "," + this.y);
	for (var port_name in this.io) {
	    var io_obj = this.io[port_name];
	    io_obj.redraw();
	    for (var i = 0; i < io_obj.w.length; i++){
		io_obj.w[i].redraw();
	    }
	}
    }

    function cell_drag_end() {
	this.drag.enable_hover();
    }

    this.init_io = function(inv, ni, left, right) {
	var cw = this.connection_width;
	var cs = this.connection_spacing;
	var stub_path = [];

	if (inv) right += this.inv_size;

	var io_obj = new Io(this, "o", "output", right+cw, 0, right+cw/2, 0);
	this.io[io_obj.name] = io_obj;
	stub_path.push("M", io_obj.x, io_obj.y,
		       "H", 0); // draw horizontally to the cell's center

	for (var i = 0; i < ni; i++) {
	    var y = ((i+0.5)*cs)-(ni*cs/2);
	    var io_obj = new Io(this, (ni > 1) ? "i" + i : "i", "input",
				left-cw, y, left-cw/2, y);
	    this.io[io_obj.name] = io_obj;
	    stub_path.push("M", io_obj.x, io_obj.y,
			   "H", 0); // draw horizontally to the cell's center
	}

	return stub_path;
    };

    this.draw_inv = function(inv, right, bg) {
	if (inv){
	    var inv_r = this.inv_size/2;
	    var inv_cx = right+inv_r;
	    var sw = bg ? 9 : 3;
	    var sc = bg ? "#eee" : "#000";
	    if (bg) {
		var attr = {
		    "stroke-width": 9,
		    stroke: "#eee"
		};
	    } else {
		var attr = {
		    "stroke-width": 3,
		    stroke: "#000",
		    fill: "#fff"
		};
	    }
	    this.draw.push(paper.circle(inv_cx, 0, inv_r).attr(attr));
	}
    };

    this.inv = function() { return this.buf(true); };
    this.buf = function(inv) {
	var height = 1.5 * this.connection_spacing;
	var width = Math.sqrt(height*height-height*height/4); /* equilateral */
	var left = -width/2;
	var right = width/2;

	stub_path = this.init_io(inv, 1, left, right);

	var cell_path = ["M", left, -height/2,
			 "v", height,
			 "l", width, -height/2,
			 "z"];
	this.draw.push(paper.path(stub_path).attr(this.stub_bg_attr));
	this.draw.push(paper.path(cell_path).attr(this.cell_bg_attr));
	this.draw_inv(inv, right, true);

	this.draw.push(paper.path(stub_path).attr(this.stub_fg_attr));
	this.draw.push(paper.path(cell_path).attr(this.cell_fg_attr));
	this.draw_inv(inv, right, false);
    };

    this.and = function(inv) { return this.generic2("and", inv) };
    this.or = function(inv) { return this.generic2("or", inv) };
    this.xor = function(inv) { return this.generic2("xor", inv) };
    this.nand = function() { return this.and(true); };
    this.nor = function() { return this.or(true); };
    this.xnor = function() { return this.xor(true); };
    this.generic2 = function(gate, inv) {
	var ni = 2;
	var height = ni*this.connection_spacing;
	var r = height/2;
	var box_width = height-r;
	var cell_width = height;
	var left = -cell_width/2;
	var right = cell_width/2;
	var top = -height/2;

	if (gate == "and") {
	    stub_path = this.init_io(inv, ni, left, right);

	    var cell_path = ["M", left, top,
			     "v", height,
			     "h", box_width,
			     "a", r, r, 0, 0, 0, 0, -height,
			     "h", -box_width,
			     "z"];
	} else if (gate == "or") {
	    stub_path = this.init_io(inv, ni, left, right);

	    // The arcs that meet at the front (output) end of the gate have
	    // ary=height and arx chosen such that the back of the arc is
	    // exactly horizontal.  Trigonometry is fun!
	    var ary = height;
	    var arx = cell_width * 2/Math.sqrt(3);
	    var lr = r*2.5;
	    var cell_path = ["M", left, top,
			     "a", lr, lr, 0, 0, 1, 0, height,
			     "a", arx, ary, 0, 0, 0, cell_width, -height/2,
			     "a", arx, ary, 0, 0, 0, -cell_width, -height/2,
			     "z"];
	} else if (gate == "xor") {
	    var bar_space = cell_width/6;
	    var far_left = left - bar_space;
	    stub_path = this.init_io(inv, ni, far_left, right);

	    var ary = height;
	    var arx = cell_width * 2/Math.sqrt(3);
	    var lr = r*2.5;
	    var cell_path_fg = ["M", left, top,
				"a", lr, lr, 0, 0, 1, 0, height,
				"a", arx, ary, 0, 0, 0, cell_width, -height/2,
				"a", arx, ary, 0, 0, 0, -cell_width, -height/2,
				"z",
				"m", -bar_space, 0,
				"a", lr, lr, 0, 0, 1, 0, height];
	    var cell_path_bg = ["M", far_left, top,
				"a", lr, lr, 0, 0, 1, 0, height,
				"h", bar_space,
				"a", arx, ary, 0, 0, 0, cell_width, -height/2,
				"a", arx, ary, 0, 0, 0, -cell_width, -height/2,
				"h", -bar_space,
				"z"];

	    this.draw.push(paper.path(stub_path).attr(this.stub_bg_attr));
	    this.draw.push(paper.path(cell_path_bg).attr(this.cell_bg_attr));
	    this.draw_inv(inv, right, true);

	    this.draw.push(paper.path(stub_path).attr(this.stub_fg_attr));
	    this.draw.push(paper.path(cell_path_bg).attr(this.cell_fg_fill_attr));
	    this.draw.push(paper.path(cell_path_fg).attr(this.cell_fg_line_attr));
	    this.draw_inv(inv, right, false);

	    return;
	}

	this.draw.push(paper.path(stub_path).attr(this.stub_bg_attr));
	this.draw.push(paper.path(cell_path).attr(this.cell_bg_attr));
	this.draw_inv(inv, right, true);

	this.draw.push(paper.path(stub_path).attr(this.stub_fg_attr));
	this.draw.push(paper.path(cell_path).attr(this.cell_fg_attr));
	this.draw_inv(inv, right, false);
    };

    this.const = function() {
	var height = 2 * this.connection_spacing;
	var width = height;
	var left = -width/2;
	var right = width/2;
	var top = -height/2;

	stub_path = this.init_io(false, 0, left, right);

	this.draw.push(paper.path(stub_path).attr(this.stub_bg_attr));
	this.draw.push(paper.rect(left, top, width, height).attr(this.cell_bg_attr));

	this.draw.push(paper.path(stub_path).attr(this.stub_fg_attr));
	this.draw.push(paper.rect(left, top, width, height).attr(this.cell_fg_attr));
    };

    this.null = function() {
	// A "null" port is used as the connection point for wires
	// currently being dragged.
	var io_obj = new Io(this, "null", "null", 0, 0, null, null);
	this.io["null"] = io_obj;

	// A blank graphic element is used as a reference point for Z ordering.
	this.draw.push(paper.path("M0,0"));
    };

    this.draw = paper.set();
    this[type](); // Call cell-type initiator function by name
    if (type == "null") return; // do nothing else for the null cell

    // Do these things to the cell graphic before before adding
    // the IO handles to the draw set.
    this.draw.insertBefore(this.null_cell.draw);
    this.draw.drag($.proxy(cell_drag_move, this),
		   $.proxy(cell_drag_start, this),
		   $.proxy(cell_drag_end, this));

    // Add the IO handles to the draw set so that they get moved with the cell.
    for (var port_name in this.io) {
	this.draw.push(this.io[port_name].draw_set);
    }
    this.draw.transform("t" + this.x + "," + this.y);
}
