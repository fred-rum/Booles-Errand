// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Cell(be, type, x, y, box) {
    this.be = be;
    this.box = box;
    this.canvas = box ? this.be.cbox : this.be.cdraw;

    this.type = type;
    this.x = (type == "null") ? 0 : (x+0.5) * this.be.cell_grid_x;
    this.y = (type == "null") ? 0 : (y+0.5) * this.be.cell_grid_y;
    this.io = {};
    this.newest_value = null;

    this.cell_fg_attr = {
	"stroke-width": this.be.stroke_cell_fg,
	"stroke-linejoin": "miter",
	stroke: "#000",
	fill: "#fff"
    };
    this.cell_bg_attr = {
	"stroke-width": this.be.stroke_cell_bg,
	"stroke-linejoin": "round",
	stroke: "#eee"
    };

    // For the case that the foreground lines & fill are drawn separately.
    this.cell_fg_line_attr = {
	"stroke-width": this.be.stroke_cell_fg,
	"stroke-linejoin": "miter",
	"stroke-linecap": "round",
	stroke: "#000",
	fill: "none"
    };
    this.cell_fg_fill_attr = {
	"stroke-width": this.be.stroke_cell_fg,
	"stroke-linejoin": "miter",
	stroke: "#fff",
	fill: "#fff"
    };

    this.stub_bg_attr = {
	"stroke-width": this.be.stroke_wire_bg,
	stroke: "#eee",
	"stroke-linecap": "round"
    };

    this.el_cell = this.canvas.set();
    this[type](); // Call cell-type initiator function by name
    if (type == "null") return; // do nothing else for the null cell

    // Make a separate xform set that includes the IO elements so that they
    // get moved with the cell.
    this.set_xform = this.canvas.set();
    var set_callback = $.proxy(function(el) {this.set_xform.push(el);});
    this.el_cell.forEach(set_callback, this);

    // Add the IO elements to the draw set so that they get moved
    // with the cell.
    for (var port_name in this.io) {
	this.set_xform.push(this.io[port_name].set_io);
    }
    this.set_xform.transform("t" + this.x + "," + this.y);

    this.bring_to_top();
    this.el_cell.drag($.proxy(this.cell_drag_move, this),
		      $.proxy(this.cell_drag_start, this),
		      $.proxy(this.cell_drag_end, this));
}


// Public members

Cell.prototype.drive_output = function(value) {
    this.io["o"].update_value(value);
};

Cell.prototype.update_value = function() {
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
	this.be.sim.register_obj(this);
    }
    this.newest_value = value;
};

Cell.prototype.tick = function() {
    // The cell could have been removed while we waited for the tick.
    // We still get the tick, but we don't do anything with it, and
    // we don't trigger any more ticks.
    if (!this.io) return;

    this.io.o.update_value(this.newest_value);
    this.newest_value = null;
}


// Private functions & members

Cell.prototype.calc_inv = function() { return this.calc_buf(true); };
Cell.prototype.calc_buf = function(inv) {
    var i = this.io.i.value;
    if (i === undefined) return undefined;
    var value = i;
    if (inv) value = 1-value;
    return value;
};

Cell.prototype.calc_nand = function() { return this.calc_and(true); };
Cell.prototype.calc_and = function(inv) {
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

Cell.prototype.calc_nor = function() { return this.calc_or(true); };
Cell.prototype.calc_or = function(inv) {
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

Cell.prototype.calc_xnor = function() { return this.calc_xor(true); };
Cell.prototype.calc_xor = function(inv) {
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

Cell.prototype.bring_to_top = function() {
    if (this.box) return;

    this.el_cell.insertBefore(this.be.z_cell);
    for (var port_name in this.io) {
	this.io[port_name].bring_to_top();
    }
};

Cell.prototype.cell_drag_start = function(x, y, event) {
    this.drag_dx = 0;
    this.drag_dy = 0;
    this.be.drag.disable_hover();

    // Pop cell to top for more natural dragging.
    this.bring_to_top();

    this.del = false;
}

Cell.prototype.cell_drag_move = function(dx, dy, x, y, event) {
    this.x += dx - this.drag_dx;
    this.y += dy - this.drag_dy;
    this.drag_dx = dx;
    this.drag_dy = dy;
    this.set_xform.transform("t" + this.x + "," + this.y);
    var del = (!this.box &&
	       ((x < this.be.cdraw_left) ||
		(y < this.be.cdraw_top) ||
		(x >= this.be.cdraw_left + this.be.cdraw_width) ||
		(y >= this.be.cdraw_top + this.be.cdraw_height)));
    if (del != this.del){
	for (var name in this.io) {
	    var io_w = this.io[name].w;
	    for (var i = 0; i < io_w.length; i++){
		if (del){
		    io_w[i].mark_old("del");
		} else {
		    io_w[i].restore_old();
		}
	    }
	}
	this.del = del;
    } else {
	for (var port_name in this.io) {
	    this.io[port_name].redraw();
	}
    }
}

Cell.prototype.cell_drag_end = function() {
    this.be.drag.enable_hover();
    if (this.del) this.remove();
}

Cell.prototype.remove = function() {
    for (var name in this.io) {
	this.io[name].remove();
    }
    this.io = null;
    this.el_cell.remove();
};

Cell.prototype.init_io = function(inv, ni, left, right) {
    var cw = this.be.stub_len;
    var cs = this.be.io_spacing;

    if (inv) right += this.be.inv_bubble_size;

    var io_obj = new Io(this.be, this.box, this, "o", "output", right+cw, 0);
    this.io[io_obj.name] = io_obj;

    for (var i = 0; i < ni; i++) {
	var y = ((i+0.5)*cs)-(ni*cs/2);
	var io_obj = new Io(this.be, this.box, this,
			    (ni > 1) ? "i" + i : "i", "input",
			    left-cw, y);
	this.io[io_obj.name] = io_obj;
    }
};

Cell.prototype.draw_stubs = function() {
    // Since the stub backgrounds are drawn only once and all the
    // same color, they are grouped into a single path (with disjoint
    // segments).  That means that the path must be owned by the cell
    // and not the IOs.
    var stub_path = [];
    for (var name in this.io) {
	stub_path = stub_path.concat(this.io[name].path);
    }
    this.el_cell.push(this.canvas.path(stub_path).attr(this.stub_bg_attr));

    // In contrast, the stub foregrounds can be drawn in different
    // colors depending on the IO state.  Therefore, each is its own
    // path, owned by the IO instance.  The cell does still get the
    // drawing elements, though, so that they can be added to the
    // set for translation.  (But the cell also keeps them separately
    // to avoid changing their Z level.)
    for (var name in this.io) {
	this.el_cell.push(this.io[name].draw_stub_fg());
    }
};

Cell.prototype.draw_inv = function(inv, right, bg) {
    if (inv){
	var inv_r = this.be.inv_bubble_size/2;
	var inv_cx = right+inv_r;
	var sw = bg ? 9 : 3;
	var sc = bg ? "#eee" : "#000";
	var attr = bg ? this.cell_bg_attr : this.cell_fg_attr;
	this.el_cell.push(this.canvas.circle(inv_cx, 0, inv_r).attr(attr));
    }
};

Cell.prototype.inv = function() { return this.buf(true); };
Cell.prototype.buf = function(inv) {
    var height = 1.5 * this.be.io_spacing;
    var width = Math.sqrt(height*height-height*height/4); /* equilateral */
    var left = -width/2;
    var right = width/2;

    stub_path = this.init_io(inv, 1, left, right);

    var cell_path = ["M", left, -height/2,
		     "v", height,
		     "l", width, -height/2,
		     "z"];
    this.el_cell.push(this.canvas.path(cell_path).attr(this.cell_bg_attr));
    this.draw_inv(inv, right, true);
    this.draw_stubs();
    this.el_cell.push(this.canvas.path(cell_path).attr(this.cell_fg_attr));
    this.draw_inv(inv, right, false);
};

Cell.prototype.nand = function() { return this.and(true); };
Cell.prototype.and = function(inv) {
    var ni = 2;
    var height = ni*this.be.io_spacing;
    var r = height/2;
    var box_width = height-r;
    var cell_width = height;
    var left = -cell_width/2;
    var right = cell_width/2;
    var top = -height/2;

    stub_path = this.init_io(inv, ni, left, right);

    var cell_path = ["M", left, top,
		     "v", height,
		     "h", box_width,
		     "a", r, r, 0, 0, 0, 0, -height,
		     "h", -box_width,
		     "z"];

    this.el_cell.push(this.canvas.path(cell_path).attr(this.cell_bg_attr));
    this.draw_inv(inv, right, true);
    this.draw_stubs();
    this.el_cell.push(this.canvas.path(cell_path).attr(this.cell_fg_attr));
    this.draw_inv(inv, right, false);
};

Cell.prototype.nor = function() { return this.or(true); };
Cell.prototype.or = function(inv) {
    var ni = 2;
    var height = ni*this.be.io_spacing;
    var r = height/2;
    var cell_width = height;
    var left = -cell_width/2;
    var right = cell_width/2;
    var top = -height/2;

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

    this.el_cell.push(this.canvas.path(cell_path).attr(this.cell_bg_attr));
    this.draw_inv(inv, right, true);
    this.draw_stubs();
    this.el_cell.push(this.canvas.path(cell_path).attr(this.cell_fg_attr));
    this.draw_inv(inv, right, false);
};

Cell.prototype.xnor = function() { return this.xor(true); };
Cell.prototype.xor = function(inv) {
    var ni = 2;
    var height = ni*this.be.io_spacing;
    var r = height/2;
    var box_width = height-r;
    var cell_width = height;
    var left = -cell_width/2;
    var right = cell_width/2;
    var top = -height/2;
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

    this.el_cell.push(this.canvas.path(cell_path_bg).attr(this.cell_bg_attr));
    this.draw_inv(inv, right, true);
    this.draw_stubs();
    this.el_cell.push(this.canvas.path(cell_path_bg).attr(this.cell_fg_fill_attr));
    this.el_cell.push(this.canvas.path(cell_path_fg).attr(this.cell_fg_line_attr));
    this.draw_inv(inv, right, false);
};

Cell.prototype.const = function() {
    var height = 2 * this.be.io_spacing;
    var width = height;
    var left = -width/2;
    var right = width/2;
    var top = -height/2;

    this.init_io(false, 0, left, right);

    this.el_cell.push(this.canvas.rect(left, top, width, height).attr(this.cell_bg_attr));
    this.draw_stubs();
    this.el_cell.push(this.canvas.rect(left, top, width, height).attr(this.cell_fg_attr));
};

Cell.prototype.null = function() {
    // A "null" port is used as the connection point for wires
    // currently being dragged.
    var io_obj = new Io(this.be, this, "null", "null", 0, 0);
    this.io["null"] = io_obj;
    this.be.null_io = io_obj;
};
