// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Io(be, cell, name, type, x, y) {
    this.be = be;
    this.cell = cell;
    this.name = name;
    this.type = type;

    // x,y is the point to/from which wires are drawn.
    this.x = x;
    this.y = y;

    this.w = [];

    // If any properties of vis_state are true, then the IO handle is visible.
    this.vis_state = {};


    // Public members

    this.draw_stub_fg = function(stub_fg_attr, stub_end_attr) {
	var stub_end_path = ["M", x, y - this.be.stub_end_len/2,
			     "v", this.be.stub_end_len];
	this.stub_end = this.be.paper.path(stub_end_path).attr(stub_end_attr);
	this.stub_end.setAttr("visibility", "hidden");

	this.stub = this.be.paper.path(this.path).attr(stub_fg_attr);

	return this.be.paper.set(this.stub_end, this.stub);
    };

    this.connect = function(wire) {
	if (!this.w.length && this.stub_end){
	    this.stub_end.setAttr("visibility", "visible");
	}

	if ((this.type == "output") && (this.w.length > 0)) {
	    // We want the new wire to be ordered together with the existing
	    // wires connected to the same output.  But we also want the new
	    // wire to be on top.  So we reorder all existing wires to be
	    // displayed at the same Z height as the new wire.
	    for (var i = 0; i < this.w.length; i++) {
		this.w[i].reorder_z(wire.draw_bg, wire.draw_fg);
	    }
	}
	this.w.push(wire);
    };

    this.disconnect = function(wire) {
	for (var i = 0; i < this.w.length; i++){
	    if (wire == this.w[i]){
		this.w.splice(i, 1);
		if (!this.w.length && this.stub_end){
		    this.stub_end.setAttr("visibility", "hidden");
		}
		return;
	    }
	}
    };

    this.redraw = function() {
	for (var i = 0; i < this.w.length; i++){
	    this.w[i].redraw();
	}
    };

    this.set_vis = function(type, value) {
	this.vis_state[type] = value;
	for (var name in this.vis_state){
	    if (this.vis_state[name]){
		this.draw.setAttr("visibility", "visible");
		return;
	    }
	}
	this.draw.setAttr("visibility", "hidden");
    };

    this.update_value = function(value) {
	this.value = value;

	var attr = {
	    stroke: Wire.color(value),
	};
	this.stub.attr(attr);

	attr["stroke-width"] =
	    (value === undefined) ? this.be.stroke_stub_end_undefined :
	                            this.be.stroke_stub_end_defined;
	this.stub_end.attr(attr);

	if (value === undefined){
	    value = "";
	    var bg_opacity = 0;
	} else {
	    var bg_opacity = "1.0";
	}

	this.draw_value.attr({text: "" + value});

	// Create a background rectangle for the text and move both of them
	// up so that the bottom of each is just above the stub.
	var bbox = this.draw_value.getBBox(true);
	var left = bbox.x;
	var top = this.y - 2 - bbox.height;

	var desiredbottom = this.y - 2;
	var actualbottom = bbox.y + bbox.height - 1;
	var drift_y = actualbottom - desiredbottom;
	this.value_y -= drift_y;
	this.draw_value.attr({y: this.value_y});

	var attr_bg = {
	    x: left,
	    y: top,
	    width: bbox.width,
	    height: bbox.height,
	    opacity: bg_opacity
	};
	if (value) {
	    attr_bg.fill = "#8d8";
	} else {
	    attr_bg.fill = "#aaf";
	}
	this.draw_value_bg.attr(attr_bg);

	if (this.type == "output"){
	    for (var i = 0; i < this.w.length; i++) {
		this.w[i].update_value();
	    }
	} else { // input
	    this.cell.update_value();
	}
    };


    // Private functions & members

    var attr = {
	"stroke-width": this.be.stroke_io_handle,
	stroke: "#f80",
	fill: "#ff0",
	opacity: "0.80"
    };
    var tw = this.be.io_handle_size;
    this.draw = this.be.paper.circle(x, y, tw/2, tw/2).attr(attr);
    this.draw.setAttr("visibility", "hidden");
    this.draw.setAttr("pointer-events", "all");

    if (type != "null"){
	this.be.drag.enable_drag(this);

	// Placeholders to display IO value in text and rectangle object.
	// The position of the text and the size and position of the rectangle
	// varies depending on the value (particularly its width), so we
	// don't bother setting useful position info here other than the
	// x center of the text.
	var text_height = 15;
	var attr = {
	    fill: "#000",
	    "text-anchor": "middle",
	    //"font-family": "Verdana, Helvetica, Arial, sans-serif",
	    "font-family": "Courier New, Fixed, monospace",
	    "font-size": text_height
	};
	this.value_y = 0;
	this.draw_value = this.be.paper.text(this.x, this.value_y, "").attr(attr);
	this.draw_value.setAttr("pointer-events", "none");

	var attr_bg = {
	    "stroke-width": 0,
	    opacity: "0"
	};
	this.draw_value_bg = this.be.paper.rect(0, 0, 0, 0);
	this.draw_value_bg.attr(attr_bg);
	this.draw_value_bg.insertBefore(this.draw_value);
	this.draw_value_bg.setAttr("pointer-events", "none");

	this.draw_set = this.be.paper.set(this.draw,
					  this.draw_value_bg,
					  this.draw_value);
    }


    // Initialization code

    this.path = ["M", x, y,
		 "H", 0]; // draw horizontally to the cell's center
}
