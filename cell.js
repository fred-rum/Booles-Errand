// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Cell(type, x, y) {
    var paper = this.paper;
    this.io = {};
    this.x = x;
    this.y = y;

    this.connection_spacing = 20;
    this.connection_width = 10;
    this.inv_size = 10;


    // Private functions & members

    function cell_drag_start(x, y, event) {
	this.drag_dx = 0;
	this.drag_dy = 0;
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

    this.inv = function() { return this.buf(true); }
    this.buf = function(inv) {
	var height = 1.5 * this.connection_spacing;
	var width = Math.sqrt(height*height-height*height/4); /* equilateral */
	var left = -width/2;
	var right = width/2;

	stub_path = this.init_io(inv, 1, left, right);

	var gate_path = ["M", left, -height/2,
			 "v", height,
			 "l", width, -height/2,
			 "z"];
	this.draw.push(paper.path(stub_path).attr({"stroke-width": 7, stroke: "#eee", "stroke-linejoin": "round"}));
	this.draw.push(paper.path(gate_path).attr({"stroke-width": 9, stroke: "#eee", "stroke-linejoin": "round"}));
	this.draw_inv(inv, right, true);

	this.draw.push(paper.path(stub_path).attr({"stroke-width": 1, stroke: "#000"}));
	this.draw.push(paper.path(gate_path).attr({"stroke-width": 3, stroke: "#000", fill: "#fff"}));
	this.draw_inv(inv, right, false);
    };

    this.and = function(inv) { return this.generic2("and", inv) };
    this.or = function(inv) { return this.generic2("or", inv) };
    this.nand = function() { return this.and(true); }
    this.nor = function() { return this.or(true); }
    this.generic2 = function(gate, inv) {
	var ni = 2;
	var height = ni*this.connection_spacing;
	var r = height/2;
	var box_width = height-r;
	var gate_width = height;
	var left = -gate_width/2;
	var right = gate_width/2;
	var top = -height/2;

	stub_path = this.init_io(inv, ni, left, right);

	if (gate == "and") {
	    var gate_path = ["M", left, top,
			     "v", height,
			     "h", box_width,
			     "a", r, r, 0, 0, 0, 0, -height,
			     "h", -box_width,
			     "z"];
	} else if (gate == "or") {
	    var arx = gate_width;
	    var ary = height;
	    var lr = r*2.5;
	    var gate_path = ["M", left, top,
			     "a", lr, lr, 0, 0, 1, 0, height,
			     "a", arx, ary, 0, 0, 0, gate_width, -height/2,
			     "a", arx, ary, 0, 0, 0, -gate_width, -height/2,
			     "z"];
	}

	this.draw.push(paper.path(stub_path).attr({"stroke-width": 7, stroke: "#eee", "stroke-linejoin": "round"}));
	this.draw.push(paper.path(gate_path).attr({"stroke-width": 9, stroke: "#eee", "stroke-linejoin": "round"}));
	this.draw_inv(inv, right, true);

	this.draw.push(paper.path(stub_path).attr({"stroke-width": 1, stroke: "#000"}));
	this.draw.push(paper.path(gate_path).attr({"stroke-width": 3, stroke: "#000", fill: "#fff"}));
	this.draw_inv(inv, right, false);
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
		   $.proxy(cell_drag_start, this));

    // Add the IO handles to the draw set so that they get moved with the cell.
    for (var port_name in this.io) {
	this.draw.push(this.io[port_name].draw);
    }
    this.draw.transform("t" + this.x + "," + this.y);
}
