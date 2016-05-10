// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Io(cell, name, type, x, y, hx, hy) {
    this.cell = cell;
    this.name = name;
    this.type = type;

    // x,y is the point to/from which wires are drawn.
    this.x = x;
    this.y = y;

    // hx,hy is the center point of the IO handle.
    this.hx = hx;
    this.hy = hy;

    this.w = [];

    // If any properties of vis_state are true, then the IO handle is visible.
    this.vis_state = {};


    // Public members

    this.connect = function(wire) {
	if ((this.type == "output") && (this.w.length > 0)) {
	    // We want the new wire to be ordered together with the existing
	    // wires connected to the same output.  But we also want the new
	    // wire to be on top.  So we reorder all existing wires to be
	    // displayed at the same Z height as the new wire.
	    for (var i = 0; i < this.w.length; i++) {
		this.w[i].draw_bg.insertBefore(wire.draw_bg);
		this.w[i].draw_fg.insertBefore(wire.draw_fg);
	    }
	}
	this.w.push(wire);
    };

    this.disconnect = function(wire) {
	for (var i = 0; i < this.w.length; i++){
	    if (wire == this.w[i]){
		this.w.splice(i, 1);
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
	this.draw_value.attr({text: "" + value});

	// Create a background rectangle for the text and move both of them
	// up so that the bottom of each is just above the stub.
	var bbox = this.draw_value.getBBox(true);
	console.log(bbox.x, bbox.y, bbox.width, bbox.height);
	console.log(this.x, this.y);
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
	    opacity: "1.0"
	};
	this.draw_value_bg.attr(attr_bg);
    };


    // Private functions & members

    var tw = 15;
    var attr = {
	"stroke-width": 1,
	stroke: "#f80",
	fill: "#ff0",
	opacity: "0.80"
    };
    this.draw = this.paper.circle(hx, hy, tw/2, tw/2).attr(attr);
    this.draw.setAttr("visibility", "hidden");
    this.draw.setAttr("pointer-events", "all");

    if (type != "null"){
	this.draw.dblclick($.proxy(this.drag.double_click, this.drag, this));
	this.draw.drag($.proxy(this.drag.drag_move, this.drag, this),
		       $.proxy(this.drag.drag_start, this.drag, this),
		       $.proxy(this.drag.drag_end, this.drag, this));
	this.draw.hover($.proxy(this.drag.hover_start, this.drag, this),
			$.proxy(this.drag.hover_end, this.drag, this));

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
	this.draw_value = this.paper.text(this.x, this.value_y, "").attr(attr);
	this.draw_value.setAttr("pointer-events", "none");

	var attr_bg = {
	    "stroke-width": 0,
	    fill: "#e88",
	    opacity: "0"
	};
	this.draw_value_bg = this.paper.rect(0, 0, 0, 0);
	this.draw_value_bg.attr(attr_bg);
	this.draw_value_bg.insertBefore(this.draw_value);
	this.draw_value_bg.setAttr("pointer-events", "none");

	this.draw_set = this.paper.set(this.draw,
				       this.draw_value_bg,
				       this.draw_value);
    }
}
