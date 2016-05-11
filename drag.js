// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Drag() {
    this.remove_null_wire = function() {
	if (this.null_wire){
	    // remove_null_wire
	    this.null_wire.remove();
	    this.null_wire = null;
	}
    };

    this.drag_start = function(io, x, y, event) {
	io.set_vis("drag", true);
	this.orig_io = io;
	this.orig_empty = (io.w.length == 0);
	this.new_io = io;
	this.new_wires = [];
	this.old_wires = [];
	this.null_wire = null;
    };

    this.gen_old_wires = function(io) {
	if (this.new_io == this.null_io){
	    var attr = {stroke: "#aaa"}; // gray
	} else {
	    var attr = {stroke: "#e88", // red
		       "stroke-dasharray": "-"};
	}
	this.old_wires = this.old_wires.concat(io.w.slice(0));
	for (var i = 0; i < this.old_wires.length; i++){
	    this.old_wires[i].draw_fg.attr(attr);
	}
    };

    this.restore_old_wires = function() {
	    var attr = {stroke: "#000",
		       "stroke-dasharray": ""};
	for (var i = 0; i < this.old_wires.length; i++){
	    this.old_wires[i].draw_fg.attr(attr);
	}
	this.old_wires = [];
    };

    this.remove_new_wires = function() {
	for (var i = 0; i < this.new_wires.length; i++){
	    this.new_wires[i].remove();
	}
	this.new_wires = [];
    };

    this.mark_new_wires = function() {
	var attr = {stroke: "#eeb"}
	for (var i = 0; i < this.new_wires.length; i++){
	    this.new_wires[i].draw_bg.attr(attr);
	    this.new_wires[i].pending = true;
	}
    };

    this.commit_new_wires = function() {
	var attr = {stroke: "#eee"}
	for (var i = 0; i < this.new_wires.length; i++){
	    this.new_wires[i].draw_bg.attr(attr);
	    this.new_wires[i].pending = false;
	    this.new_wires[i].update_value();
	}
	this.new_wires = [];
    };

    this.update_free_drag = function(event) {
	if (this.new_io == this.null_io){
	    this.null_io.x = event.pageX - $("#holder").offset().left;
	    this.null_io.y = event.pageY - $("#holder").offset().top;

	    if (this.null_wire){
		this.null_wire.redraw();
	    } else {
		// create_null_wire
		if ((this.orig_io.type == "input") && (!this.orig_empty)){
		    var from_io = this.orig_io.w[0].o;
		} else {
		    var from_io = this.orig_io;
		}
		this.null_wire = new Wire(from_io, this.null_io);
		var attr = {stroke: "#eeb"}
		this.null_wire.draw_bg.attr(attr);
	    }
	}
    };

    this.drag_move = function(io, dx, dy, x, y, event) {
	this.update_free_drag(event);
    };

    this.drag_end = function(io, event) {
	this.orig_io.set_vis("drag", false);
	if (this.new_io == this.null_io){
	    this.restore_old_wires();
	} else {
	    // Delete the old wires.
	    for (var i = 0; i < this.old_wires.length; i++){
		this.old_wires[i].remove();
	    }
	    this.old_wires = [];
	}
	this.commit_new_wires();
	this.remove_null_wire();
	this.orig_io = null;
	this.new_io = null;
    };

    this.double_click = function(io, event) {
	while (io.w.length > 0) io.w[0].remove();
    };

    this.hover_start = function(io, event) {
	io.set_vis("hover", true);

	if (this.orig_io){
	    this.update_new_io(io, event);
	}
    };

    this.hover_end = function(io, event) {
	io.set_vis("hover", false);

	if (this.orig_io){
	    // hover_start could conceivably be called on a new target
	    // before hover_end is called on the old target.  In that case,
	    // don't blow up the new info.
	    if (io == this.new_io) this.update_new_io(this.null_io, event);
	}
    };

    this.connect_o_to_i = function(o, i) {
	// If the new wire would duplicate an existing one, then
	// we delete the existing one instead of creating a new one.
	if ((i.w.length > 0) && (i.w[0].o == o)){
	    this.gen_old_wires(i);
	} else {
	    this.gen_old_wires(i);
	    this.new_wires.push(new Wire(o, i));
	}
    };

    this.update_new_io = function(io, event) {
	// Like cannot drag to like unless there are one or more wires
	// on the original IO that can be moved.
	if (this.orig_empty && (this.orig_io.type == io.type)){
	    io = this.null_io;
	}

	if (io == this.new_io) return; // no change

	this.restore_old_wires();
	this.remove_new_wires();
	this.remove_null_wire();
	this.new_io = io;

	if (io.type == "null") {
	    if (this.orig_io.type == "input") this.gen_old_wires(this.orig_io);
	    this.update_free_drag(event);
	} else if ((this.orig_io.type == "output") && (io.type == "input")) {
	    this.connect_o_to_i(this.orig_io, io);
	} else if ((this.orig_io.type == "output") && (io.type == "output")) {
	    this.gen_old_wires(this.orig_io);
	    for (var i = 0; i < this.old_wires.length; i++){
		this.new_wires.push(new Wire(this.old_wires[i].i, this.new_io));
	    }
	} else if ((this.orig_io.type == "input") && (io.type == "output")) {
	    this.connect_o_to_i(io, this.orig_io);
	} else if ((this.orig_io.type == "input") && (io.type == "input")) {
	    this.gen_old_wires(this.orig_io);
	    this.gen_old_wires(io);
	    this.new_wires.push(new Wire(this.orig_io.w[0].o, io));
	} else {
	    // This should never happen.
	    this.update_new_io(this.null_io, event);
	}
	this.mark_new_wires();
    };
}
