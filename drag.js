// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Drag(be) {
  this.be = be;
  this.io_set = new Set();
}

Drag.prototype.remove_null_wire = function() {
  if (this.null_wire){
    // remove_null_wire
    this.null_wire.remove();
    this.null_wire = null;
  }
};

Drag.prototype.drag_start = function(io, x, y, event) {
  if (event.originalEvent) event = event.originalEvent;
  if (event.touches){
    $('#info').append('start ' + event.touches.length + '<br>');
    if (event.touches.length > 1) return;
  }
  io.set_vis("drag", true);
  this.orig_io = io;
  this.orig_empty = (io.w.length == 0);
  this.new_io = io;
  this.new_wires = [];
  this.old_wires = [];
  this.null_wire = null;
};

Drag.prototype.gen_old_wires = function(io) {
  var type = (this.new_io == this.be.null_io) ? "null" : "del";
  this.old_wires = this.old_wires.concat(io.w.slice(0));
  for (var i = 0; i < this.old_wires.length; i++){
    this.old_wires[i].mark_old(type);
  }
};

Drag.prototype.restore_old_wires = function() {
  for (var i = 0; i < this.old_wires.length; i++){
    this.old_wires[i].restore_old();
  }
  this.old_wires = [];
};

Drag.prototype.remove_new_wires = function() {
  for (var i = 0; i < this.new_wires.length; i++){
    this.new_wires[i].remove();
  }
  this.new_wires = [];
};

Drag.prototype.commit_new_wires = function() {
  if (this.new_wires.length){
    var attr = {stroke: "#eee"}
    for (var i = 0; i < this.new_wires.length; i++){
      this.new_wires[i].el_bg.attr(attr);
      this.new_wires[i].pending_new = false;

      // We want the newly connected output port to trigger on the
      // next tick in order to propagate its value to the wire.
      this.new_wires[i].o.register_output();
    }
    this.new_wires = [];
  }
};

Drag.prototype.update_free_drag = function(event) {
  if (this.new_io == this.be.null_io){
    if (event.touches){
      var pageX = event.touches[0].pageX;
      var pageY = event.touches[0].pageY;
    } else {
      pageX = event.pageX;
      pageY = event.pageY;
    }
    this.be.null_io.x = this.be.circuit.cdraw_to_canvas_x(pageX);
    this.be.null_io.y = this.be.circuit.cdraw_to_canvas_y(pageY);

    if (this.null_wire){
      this.null_wire.redraw();
    } else {
      // create_null_wire
      if ((this.orig_io.type == "input") && (!this.orig_empty)){
        var from_io = this.orig_io.w[0].o;
      } else {
        var from_io = this.orig_io;
      }
      this.null_wire = new Wire(this.be, from_io, this.be.null_io, true);
    }
  }
};

Drag.prototype.drag_move = function(ignore, dx, dy, x, y, event) {
  if (event.touches && !this.no_hover) {
    var closest_d = Infinity;
    for (var i = 0; i < event.touches.length; i++){
      var mx = this.be.circuit.cdraw_to_canvas_x(event.touches[i].pageX);
      var my = this.be.circuit.cdraw_to_canvas_y(event.touches[i].pageY);
      for (var io of this.io_set.values()) {
        var dx = io.x + io.cell.x - mx;
        var dy = io.y + io.cell.y - my;
        var d = (dx * dx) + (dy * dy);
        if (d < closest_d){
          closest_d = d;
          var closest_io = io;
        }
      }
    }
    if (closest_d < this.be.io_handle_size * this.be.io_handle_size / 4){
      if (closest_io != this.hover_io){
        if (this.hover_io) this.hover_end(this.hover_io, event);
        this.hover_start(this.hover_io = closest_io, event);
      }
    } else if (this.hover_io) {
      this.hover_end(this.hover_io, event);
      this.hover_io = undefined;
    }
  }

  this.update_free_drag(event);
};

Drag.prototype.drag_end = function(io, event) {
  if (event.originalEvent) event = event.originalEvent;
  if (event.touches) {
    $('#info').append('end ' + event.touches.length + '<br>');
      if (event.touches.length > 0) return;
  }
  if (this.fail_io){
    this.fail_io.display_fail(false);
    this.fail_io = undefined;
  }
  this.orig_io.set_vis("drag", false);
  if (this.new_io == this.be.null_io){
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
  this.be.level.update_url();

  if (this.hover_io) {
    this.hover_end(this.hover_io, event);
    this.hover_io = undefined;
  }
};

Drag.prototype.double_click = function(io, event) {
  while (io.w.length > 0) io.w[0].remove();
  this.be.level.update_url();
};

Drag.prototype.enable_drag = function(io) {
  io.el_handle.dblclick($.proxy(this.double_click, this, io));
  io.el_handle.drag($.proxy(this.drag_move, this, io),
                    $.proxy(this.drag_start, this, io),
                    $.proxy(this.drag_end, this, io));
  io.el_handle.hover($.proxy(this.hover_start, this, io),
                     $.proxy(this.hover_end, this, io));
  this.io_set.add(io);
}

Drag.prototype.disable_drag = function(io) {
  io.el_handle.undblclick();
  io.el_handle.undrag();
  io.el_handle.unhover();
  io.el_handle.hover($.proxy(this.locked_hover_start, this, io),
                     $.proxy(this.locked_hover_end, this, io));
  this.io_set.delete(io);
}

Drag.prototype.disable_hover = function() {
  // We could disable hover by removing the hover event triggers,
  // but we'd have to do that for every IO.  So instead we just make
  // a note to ignore hover events until they're re-enabled.
  this.no_hover = true;
}

Drag.prototype.enable_hover = function() {
  this.no_hover = false;
  if (this.pending_hover_io) {
    this.pending_hover_io.set_vis("hover", true);
    this.pending_hover_io = undefined;
    // We know that an IO drag hasn't begun, so nothing more is needed.
  }
}

Drag.prototype.true_hover_start = function(io, event) {
  console.log("true hover start");
  this.hover_supported = true;
  if (this.no_hover){
    this.pending_hover_io = io;
    return;
  }

  this.hover_start(io, event);
}

Drag.prototype.hover_start = function(io, event) {
  io.set_vis("hover", true);

  if (this.orig_io){
    this.update_new_io(io, event);
  }
};

Drag.prototype.hover_end = function(io, event) {
  console.log("hover end");
  if (io == this.fail_io){
    this.fail_io.display_fail(false);
    this.fail_io = undefined;
  }
  io.set_vis("hover", false);
  this.pending_hover_io = undefined;

  if (this.orig_io){
    // hover_start could conceivably be called on a new target
    // before hover_end is called on the old target.  In that case,
    // don't blow up the new info.
    if (io == this.new_io) this.update_new_io(this.be.null_io, event);
  }
};

Drag.prototype.locked_hover_start = function(io, event) {
  io.display_fail(true);
};

Drag.prototype.locked_hover_end = function(io, event) {
  io.display_fail(false);
};

Drag.prototype.connect_o_to_i = function(o, i) {
  // If the new wire would duplicate an existing one, then
  // we delete the existing one instead of creating a new one.
  if ((i.w.length > 0) && (i.w[0].o == o)){
    this.gen_old_wires(i);
  } else {
    this.gen_old_wires(i);
    this.new_wires.push(new Wire(this.be, o, i, true));
  }
};

Drag.prototype.update_new_io = function(io, event) {
  // Like cannot drag to like unless there are one or more wires
  // on the original IO that can be moved.  The exception is
  // when the new IO is the same as the original IO.
  if (this.orig_empty && (this.orig_io.type == io.type) &&
      (io != this.orig_io)){
    io.display_fail(true);
    this.fail_io = io;
    io = this.be.null_io;
  }

  if (io == this.new_io) return; // no change

  this.restore_old_wires();
  this.remove_new_wires();
  this.remove_null_wire();
  this.new_io = io;

  if (io == this.orig_io) return; // no new wires

  if (io.type == "null") {
    if (this.orig_io.type == "input") this.gen_old_wires(this.orig_io);
    this.update_free_drag(event);
  } else if ((this.orig_io.type == "output") && (io.type == "input")) {
    this.connect_o_to_i(this.orig_io, io);
  } else if ((this.orig_io.type == "output") && (io.type == "output")) {
    this.gen_old_wires(this.orig_io);
    for (var i = 0; i < this.old_wires.length; i++){
      this.new_wires.push(new Wire(this.be, this.old_wires[i].i, this.new_io,
                                   true));
    }
  } else if ((this.orig_io.type == "input") && (io.type == "output")) {
    this.connect_o_to_i(io, this.orig_io);
  } else if ((this.orig_io.type == "input") && (io.type == "input")) {
    this.gen_old_wires(this.orig_io);
    if (io.w.length && (io.w[0].o == this.orig_io.w[0].o)){
      // The new wire would duplicate an existing connection at
      // this location.  Rather than delete the existing wire and
      // replace it with a new one (which would trigger signal
      // events), do nothing instead.
    } else {
      this.gen_old_wires(io);
      this.new_wires.push(new Wire(this.be, this.orig_io.w[0].o, io, true));
    }
  } else {
    // This should never happen.
    this.update_new_io(this.be.null_io, event);
  }
};
