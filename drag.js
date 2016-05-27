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

Drag.prototype.drag_start = function(x, y, io) {
  io.set_vis("drag", true);
  io.set_vis("hover", false);
  this.orig_io = io;
  this.orig_empty = (io.w.length == 0);
  this.new_io = io;
  this.new_wires = [];
  this.old_wires = [];
  this.null_wire = null;
  this.disable_hover();
  this.drag_move(x, y, io);
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

Drag.prototype.update_free_drag = function(x, y) {
  if (this.new_io == this.be.null_io){
    this.be.null_io.x = this.be.circuit.cdraw_to_canvas_x(x);
    this.be.null_io.y = this.be.circuit.cdraw_to_canvas_y(y);

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

Drag.prototype.drag_move = function(x, y, io) {
  var closest_d = Infinity;
  var mx = this.be.circuit.cdraw_to_canvas_x(x);
  var my = this.be.circuit.cdraw_to_canvas_y(y);
  for (var io of this.io_set.values()) {
    var dx = io.x + io.cell.x - mx;
    var dy = io.y + io.cell.y - my;
    var d = (dx * dx) + (dy * dy);
    if (d < closest_d){
      closest_d = d;
      var closest_io = io;
    }
  }
  // Check to see if the nearest IO is within *double* the IO handle radius.
  if (closest_d < this.be.io_handle_size * this.be.io_handle_size){
    if (closest_io != this.snap_io){
      if (this.snap_io) this.snap_end(x, y, this.snap_io);
      this.snap_io = closest_io;
      this.snap_io.set_vis("snap", true);
      this.update_new_io(x, y, this.snap_io);
    }
  } else if (this.snap_io) {
    this.snap_end(x, y, this.snap_io);
    this.snap_io = undefined;
  }

  this.update_free_drag(x, y);
};

Drag.prototype.drag_end = function(io) {
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

  if (this.snap_io) {
    // Because this.orig_io is null, hover_end() doesn't need x, y.
    this.snap_end(undefined, undefined, this.snap_io);
    this.snap_io = undefined;
  }
  this.enable_hover();
};

Drag.prototype.double_click = function(io, event) {
  while (io.w.length > 0) io.w[0].remove();
  this.be.level.update_url();
};

Drag.prototype.enable_drag = function(io) {
  io.el_handle.dblclick($.proxy(this.double_click, this, io));
  this.be.bdrag.drag($(io.el_handle.node), this, 'cell',
                     {start: this.drag_start,
                      move: this.drag_move,
                      end: this.drag_end,
                      dblclick: this.double_click},
                     io);
  io.el_handle.hover($.proxy(this.true_hover_start, this, io),
                     $.proxy(this.true_hover_end, this, io));
  this.io_set.add(io);
}

Drag.prototype.disable_drag = function(io) {
  io.el_handle.undblclick();
  this.be.bdrag.undrag($(io.el_handle.node));
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
    // We know that an IO drag hasn't begun, so nothing more is needed.
  }
}

Drag.prototype.true_hover_start = function(io) {
  this.pending_hover_io = io;
  if (this.no_hover) return;
  io.set_vis("hover", true);
}

Drag.prototype.true_hover_end = function(io, event) {
  this.pending_hover_io = undefined;
  if (this.no_hover) return;
  io.set_vis("hover", false);
};

Drag.prototype.snap_end = function(x, y, io) {
  io.set_vis("snap", false);
  if (io == this.fail_io){
    this.fail_io.display_fail(false);
    this.fail_io = undefined;
  }

  if (this.orig_io){
    // new_io could conceivably be updated for a new target
    // before snap_end is called on the old target.  In that case,
    // don't blow up the new info.
    if (io == this.new_io) this.update_new_io(x, y, this.be.null_io);
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

Drag.prototype.update_new_io = function(x, y, io) {
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
    this.update_free_drag(x, y);
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
    this.update_new_io(x, y, this.be.null_io);
  }
};
