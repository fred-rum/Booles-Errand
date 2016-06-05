// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Drag(be) {
  this.be = be;
  this.io_set = [];

  var tw = this.be.io_handle_size;
  var attr = {
    "stroke-width": tw/5,
    stroke: "#f00",
    fill: "#fff"
  };

  this.el_handle1 = this.el_handle();
  this.el_handle2 = this.el_handle();

  // el_fail is generated after the el_handles so that it shows up on
  // top in case of overlap.

  // Rather than doing trigonometry to draw the diagonal slash,
  // we just draw it horizontally and then rotate the whole thing
  // when we position the fail symbol over an IO.
  var el_fail_circle = this.be.cdraw.circle(0, 0, tw/2, tw/2).attr(attr);
  var el_fail_slash = this.be.cdraw.path(["M", -tw/2, 0,
                                          "h", tw]).attr(attr);

  this.el_fail = this.be.cdraw.set(el_fail_circle, el_fail_slash);
  this.el_fail.setAttr("visibility", "hidden");
  this.el_fail.setAttr("pointer-events", "none");
}

Drag.prototype.el_handle = function () {
  var attr = {
    "stroke-width": this.be.stroke_io_handle,
    stroke: "#f80",
    fill: "#ff0",
    opacity: "0.80"
  };
  var tw = this.be.io_handle_size;
  var el_handle = this.be.cdraw.circle(0, 0, tw/2, tw/2).attr(attr);
  el_handle.setAttr("visibility", "hidden");
  el_handle.setAttr("pointer-events", "none");
  return el_handle;
};

Drag.prototype.reset = function() {
  this.io_set = [];
};

Drag.prototype.remove_null_wire = function() {
  if (this.null_wire){
    // remove_null_wire
    this.null_wire.remove();
    this.null_wire = null;
  }
};

Drag.prototype.gen_old_wires = function(io) {
  var type = (this.new_io == this.be.null_io) ? "null" : "del";
  this.old_wires = this.old_wires.concat(io.w.slice(0));
  for (var i = 0; i < this.old_wires.length; i++){
    this.old_wires[i].mark_old(type);
  }
};

// Revert the pending change for old and new wires.
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

// Commit the pending change for old and new wires.
Drag.prototype.remove_old_wires = function() {
  // Delete the old wires.
  for (var i = 0; i < this.old_wires.length; i++){
    var icell = this.old_wires[i].i.cell;
    this.old_wires[i].remove();
  }
  this.old_wires = [];
};

Drag.prototype.commit_new_wires = function() {
  var attr = {stroke: "#eee"}
  for (var i = 0; i < this.new_wires.length; i++){
    this.new_wires[i].el_bg.attr(attr);
    this.new_wires[i].pending_new = false;

    // We want the newly connected output port to trigger on the
    // next tick in order to propagate its value to the wire.
    this.new_wires[i].o.register_output();
  }
  this.new_wires = [];
};

Drag.prototype.drag_start = function(x, y) {
  var io = this.closest_io(x, y);
  this.show_handle(this.el_handle1, io);
  $(document.body).addClass('cursor-force-default');
  this.snap_io = io;
  this.orig_io = io;
  this.orig_empty = (io.w.length == 0);
  this.new_io = this.be.null_io;
  this.new_wires = [];
  this.old_wires = [];
  this.null_wire = null;
  this.disable_hover();
};

Drag.prototype.drag_move = function(x, y) {
  var io = this.closest_io(x, y, true);

  if (io != this.snap_io) {
    if (this.snap_io) this.snap_end(x, y, this.snap_io);
    if (io) {
      this.snap_io = io;
      this.update_new_io(x, y, io);
      var failure = this.be.level.update_widths(true);
      if (failure) {
        this.update_new_io(x, y, io, failure);
        this.be.level.update_widths(true);
      }
    } else {
      this.snap_io = undefined;
      this.update_new_io(x, y, this.be.null_io);
      this.be.level.update_widths(true);
    }
  }

  this.update_free_drag(x, y);
};

Drag.prototype.drag_end = function() {
  this.hide_handle(this.el_handle1);
  if (this.snap_io) {
    this.snap_end();
  }

  this.remove_null_wire();
  if (this.new_io == this.be.null_io){
    this.restore_old_wires();
  } else {
    this.remove_old_wires();
  }
  this.commit_new_wires();
  this.be.level.commit_widths();
  this.orig_io = null;
  this.new_io = null;
  this.be.level.update_url();

  $(document.body).removeClass('cursor-force-default');
  this.enable_hover();
};

Drag.prototype.mouse_double_click = function(event) {
  this.dblclick(event.pageX, event.pageY);
};

Drag.prototype.dblclick = function(x, y) {
  var io = this.closest_io(x, y);
  while (io.w.length > 0){
    var icell = io.w[0].i.cell;
    io.w[0].remove();
    this.be.level.update_url();
  }

  this.be.level.update_widths();
};

Drag.prototype.hover_start = function(event) {
  var x = event.pageX;
  var y = event.pageY;
  var io = this.closest_io(x, y);

  if (io.locked) return;

  this.pending_hover_io = io;
  if (!this.no_hover) this.show_handle(this.el_handle1, io);
  $(document).on('mousemove.boolehover', $.proxy(this.hover_move, this));
};

Drag.prototype.hover_move = function(event) {
  var x = event.pageX;
  var y = event.pageY;
  var io = this.closest_io(x, y);

  if (io.locked) return;

  if ((io != this.pending_hover_io) && !this.no_hover){
    this.show_handle(this.el_handle1, io);
  }
  this.pending_hover_io = io;
};

Drag.prototype.hover_end = function() {
  if (!this.no_hover) {
    // If no_hover is true, then the el_handles may be being used for
    // dragging and shouldn't be disrupted.
    this.hide_handle(this.el_handle1, this.pending_hover_io);
  }
  this.pending_hover_io = undefined;
  $(document).off('mousemove.boolehover');
};

Drag.prototype.closest_io = function(x, y, limit) {
  var closest_io = null;
  var closest_d = Infinity;

  // Check to see if the nearest IO is within *double* the IO handle
  // radius.  This limit is applied only when dragging the mouse
  // freely.  When an event triggers the 'closest' check, then the
  // mouse may be near the edge of the limit, and we don't want to
  // confuse matters by not finding an IO to act on.
  var limit2 = limit ? this.be.io_handle_size*this.be.io_handle_size : Infinity;

  var mx = this.be.circuit.cdraw_to_canvas_x(x);
  var my = this.be.circuit.cdraw_to_canvas_y(y);
  for (var i = 0; i < this.io_set.length; i++){
    var io = this.io_set[i];
    var dx = io.x + io.cell.x - mx;
    var dy = io.y + io.cell.y - my;
    var d = (dx * dx) + (dy * dy);
    if ((d < limit2) &&
        ((d < closest_d) || (!io.locked && closest_io.locked))){
      closest_d = d;
      var closest_io = io;
    }
  }

  return closest_io;
};

Drag.prototype.enable_drag = function(io) {
  io.el_target.dblclick($.proxy(this.mouse_double_click, this));
  this.be.bdrag.drag($(io.el_target.node), this, 'cell',
                     {start: this.drag_start,
                      move: this.drag_move,
                      end: this.drag_end,
                      dblclick: this.dblclick});
  io.el_target.hover($.proxy(this.hover_start, this),
                     $.proxy(this.hover_end, this));
  this.io_set.push(io);
};

Drag.prototype.disable_drag = function(io) {
  var el = $(io.el_target.node)

  this.be.bdrag.undrag(el);
  io.el_target.undblclick();
  io.el_target.unhover();

  io.el_target.attr({cursor: 'not-allowed'});
  this.be.bdrag.drag(el, this, 'cell',
                     {start: this.drag_locked_start,
                      // no drag_move action
                      end: this.drag_locked_end});
};

Drag.prototype.remove_io = function(io) {
  this.be.bdrag.undrag($(io.el_target.node));
  io.el_target.undblclick();
  io.el_target.unhover();

  for (var i = 0; i < this.io_set.length; i++){
    if (this.io_set[i] == io) {
      this.io_set.splice(i, 1);
      break;
    }
  }
};

Drag.prototype.disable_hover = function() {
  // We could disable hover by removing the hover event triggers,
  // but we'd have to do that for every IO.  So instead we just make
  // a note to ignore hover events until they're re-enabled.
  this.no_hover = true;
};

Drag.prototype.enable_hover = function() {
  this.no_hover = false;
  if (this.pending_hover_io) {
    this.show_handle(this.el_handle1, this.pending_hover_io);
  }
};

Drag.prototype.snap_end = function() {
  this.hide_handle(this.el_handle2);
  this.hide_fail();
  this.snap_io = undefined;
  this.fail_io = undefined;
};

Drag.prototype.show_handle = function(el, io) {
  el.transform('t' + (io.cell.x + io.x) + ',' + (io.cell.y + io.y));
  el.setAttr("visibility", "visible");
};

Drag.prototype.hide_handle = function(el) {
  el.setAttr("visibility", "hidden");
};

Drag.prototype.show_fail = function(io) {
  this.show_fail_xy(io.cell.x + io.x, io.cell.y + io.y);
};

Drag.prototype.show_fail_xy = function(x, y) {
  this.el_fail.transform('t' + x + ',' + y + 'r45');
  this.el_fail.setAttr("visibility", "visible");
};

Drag.prototype.hide_fail = function() {
  this.el_fail.setAttr("visibility", "hidden");
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

Drag.prototype.update_new_io = function(x, y, io, failure) {
  // Like cannot drag to like unless there are one or more wires
  // on the original IO that can be moved.  The exception is
  // when the new IO is the same as the original IO.
  if (io == this.orig_io){
    io = this.be.null_io;
  } else if ((this.orig_empty && (this.orig_io.type == io.type)) ||
             io.locked || failure){
    this.show_fail(io);
    this.fail_io = true;
    io = this.be.null_io;
  } else if ((io != this.orig_io) && (io != this.be.null_io)) {
    this.show_handle(this.el_handle2, io);
  }

  if (io == this.new_io) return; // no change

  this.remove_null_wire();
  this.restore_old_wires();
  this.remove_new_wires();
  this.new_io = io;

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

// If the user clicks on a locked IO target, then we know that the
// not-allowed cursor was displayed, so for consistency we don't allow
// an unlocked IO to be selected, even if it might be marginally
// closer.  However, we do look for the closest locked IO (since there
// may be two with overlapping targets).
Drag.prototype.drag_locked_start = function(x, y) {
  var io = this.closest_locked_io(x, y);
  this.show_fail(io);
  $(document.body).addClass('cursor-force-not-allowed');
  this.disable_hover();
};

Drag.prototype.drag_locked_end = function() {
  this.hide_fail();
  $(document.body).removeClass('cursor-force-not-allowed');
  this.enable_hover();
};

Drag.prototype.closest_locked_io = function(x, y) {
  var closest_d = Infinity;
  var mx = this.be.circuit.cdraw_to_canvas_x(x);
  var my = this.be.circuit.cdraw_to_canvas_y(y);
  for (var i = 0; i < this.io_set.length; i++){
    var io = this.io_set[i];
    if (io.locked) {
      var dx = io.x + io.cell.x - mx;
      var dy = io.y + io.cell.y - my;
      var d = (dx * dx) + (dy * dy);
      if (d < closest_d){
        closest_d = d;
        var closest_io = io;
      }
    }
  }

  return closest_io;
};
