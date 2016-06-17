// Copyright 2016 Chris Nelson - All rights reserved.

'use strict';

function Io(be, canvas, cell, name, type, x, y, inner_x) {
  this.be = be;
  this.canvas = canvas;

  this.cell = cell;
  this.name = name;
  this.type = type;

  // x,y is the point to/from which wires are drawn.
  this.x = x;
  this.y = y;

  this.w = [];

  // The null IO has position and wire connectivity information, but
  // it doesn't have any of the other IO features, e.g. graphics and
  // event handling.
  if (type == 'null') return;

  this.min_color = Raphael.getRGB('#aaf');
  this.max_color = Raphael.getRGB('#8d8');

  this.registered = false;

  if (inner_x == 'mux') {
    // Special case: the stub is vertical, not horizontal.
    this.path = ['M', x, y,
                 'H', 0,
                 'V', 0];
  } else {
    this.path = ['M', x, y,
                 'H', inner_x];
  }

  // An IO for a cell in the cell box has graphics for the stub, but
  // it doesn't have a drag target or event handling.
  if (this.canvas != this.be.cdraw) {
    this.set_io = this.canvas.set();
    return;
  }


  var tw = this.be.io_handle_size; // Actually, double the IO handle size.
  var attr = {
    'stroke-width': 0,
  };
  this.el_target = this.canvas.circle(x, y, tw, tw).attr(attr);
  this.el_target.setAttr('visibility', 'hidden');
  this.el_target.setAttr('pointer-events', 'all');

  this.be.drag.enable_drag(this);
  if (this.be.showing_soln) {
    this.locked = true;
    this.be.drag.disable_drag(this);
  }

  // Placeholders to display IO value in text and rectangle object.
  // The position of the text and the size and position of the rectangle
  // varies depending on the value (particularly its width), so we
  // don't bother setting useful position info here other than the
  // x center of the text.
  var text_height = 15;
  var attr = {
    'text-anchor': 'middle',
    //'font-family': 'Verdana, Helvetica, Arial, sans-serif',
    'font-family': 'Courier New, Fixed, monospace',
    'font-size': text_height
  };
  this.value_y = 0;
  this.el_value_text = this.canvas.text(this.x, this.value_y, '').attr(attr);
  this.el_value_text.setAttr('pointer-events', 'none');

  var attr_bg = {
    'stroke-width': 0,
    opacity: '0'
  };
  this.el_value_text_bg = this.canvas.rect(0, 0, 0, 0);
  this.el_value_text_bg.attr(attr_bg);
  this.el_value_text_bg.setAttr('pointer-events', 'none');

  this.set_io = this.canvas.set(this.el_value_text_bg,
                                this.el_value_text);
}

Io.prototype.draw_stub_fg = function() {
  var stub_fg_attr = {
    'stroke-width': this.be.stroke_wire_fg,
    stroke: Wire.color(undefined)
  };
  var stub_end_attr = {
    'stroke-width': this.be.stroke_stub_end_undefined,
    stroke: Wire.color(undefined)
  };
  var stub_end_path = ['M', this.x, this.y - this.be.stub_end_len/2,
                       'v', this.be.stub_end_len];
  this.el_stub_end = this.canvas.path(stub_end_path).attr(stub_end_attr);
  this.el_stub_end.setAttr('pointer-events', 'none');
  this.el_stub_end.setAttr('visibility', 'hidden');
  this.set_io.push(this.el_stub_end);

  this.stub = this.canvas.path(this.path).attr(stub_fg_attr);
  this.stub.setAttr('pointer-events', 'none');
  return this.stub;
};

Io.prototype.connect = function(wire) {
  if (wire.locked) {
    this.locked = true;
    this.be.drag.disable_drag(this);
  } else if (!this.w.length && this.el_stub_end) {
    this.el_stub_end.setAttr('visibility', 'visible');
  }

  if ((this.type == 'output') && (this.w.length > 0)) {
    // We want the new wire to be ordered together with the existing
    // wires connected to the same output.  But we also want the new
    // wire to be on top.  So we reorder all existing wires to be
    // displayed at the same Z height as the new wire.
    for (var i = 0; i < this.w.length; i++) {
      this.w[i].reorder_z(wire.el_bg, wire.el_fg);
    }
  }
  this.w.push(wire);
};

Io.prototype.disconnect = function(wire) {
  for (var i = 0; i < this.w.length; i++) {
    if (wire == this.w[i]) {
      this.w.splice(i, 1);
      if (!this.w.length && this.el_stub_end) {
        this.el_stub_end.setAttr('visibility', 'hidden');
      }
      return;
    }
  }
};

Io.prototype.remove = function() {
  while (this.w.length) {
    this.w[0].remove(this.type == 'input');
  }

  if (this.canvas == this.be.cdraw) {
    this.be.drag.remove_io(this);
    this.el_target.remove();
    this.el_stub_end.remove();
    this.el_value_text.remove();
    this.el_value_text_bg.remove();
  }
}

Io.prototype.redraw = function() {
  for (var i = 0; i < this.w.length; i++) {
    this.w[i].redraw();
  }
};

Io.prototype.color_stub = function(value) {
  var width = (this.type == 'input') ? this.cell.input_width : this.cell.output_width;
  var attr = {
    stroke: Wire.color(value, width),
  };
  if (!this.pending_del) this.stub.attr(attr);

  attr['stroke-width'] =
    (value === undefined) ? this.be.stroke_stub_end_undefined :
    this.be.stroke_stub_end_defined;
  this.el_stub_end.attr(attr);
};

Io.prototype.update_value = function(value) {
  if (value === this.value) return;

  this.value = value;

  this.color_stub(value);

  if (value === undefined) {
    value = '';
    var bg_opacity = 0;
  } else {
    var bg_opacity = '1.0';
  }

  this.el_value_text.attr({text: '' + value});

  // Create a background rectangle for the text and move both of them
  // up so that the bottom of each is just above the stub.
  var bbox = this.el_value_text.getBBox(true);
  var left = bbox.x;
  var top = this.y - 2 - bbox.height;

  var desiredbottom = this.y - 2;
  var actualbottom = bbox.y + bbox.height - 1;
  var drift_y = actualbottom - desiredbottom;
  this.value_y -= drift_y;
  this.el_value_text.attr({y: this.value_y});

  var attr_bg = {
    x: left,
    y: top,
    width: bbox.width,
    height: bbox.height,
    opacity: bg_opacity
  };

  var width = (this.type == 'input') ? this.cell.input_width : this.cell.output_width;
  var f = value / ((1 << width) - 1);
  var r = this.min_color.r + (this.max_color.r - this.min_color.r) * f;
  var g = this.min_color.g + (this.max_color.g - this.min_color.g) * f;
  var b = this.min_color.b + (this.max_color.b - this.min_color.b) * f;
  attr_bg.fill = Raphael.rgb(r, g, b)

  this.el_value_text_bg.attr(attr_bg);
};

Io.prototype.reset = function() {
  var i_was_undefined = (this.value === undefined);

  this.update_value(undefined);

  // We know that all wires (that can potentially propagate values)
  // are connected to cells on both ends, so we only need to reset
  // wires in one consistent direction from each cell.
  if (this.type == 'input') {
    for (var i = 0; i < this.w.length; i++) {
      this.w[i].reset(i_was_undefined);
    }
  }

  // The simulation events are also being reset, so if this IO was
  // registered, it isn't anymore.
  this.registered = false;
};

Io.prototype.propagate_input = function(value) {
  this.update_value(value);
  this.cell.propagate_value();
};

Io.prototype.propagate_output = function(value) {
  // Don't propagate the newest value if it is the same as the most
  // recent value in flight.
  if (value === this.value) return;

  this.update_value(value);
  this.register_output();
};

// register_ouput() is separated from propagate_output() because it
// can also be called when there is no new IO output, but there is a
// newly connected wire that we want to start propagating on.
Io.prototype.register_output = function() {
  var propagated = false;
  for (var i = 0; i < this.w.length; i++) {
    // Don't propagate values across pending (uncommitted) new wires.
    // This also prevents propagating to the null cell.
    if (!this.w[i].pending_new) {
      this.w[i].propagate_value();
      propagated = true;
    }
  }

  // Don't register for a new tick if there are no wires to
  // propagate to (or only new wires, which don't propagate values).
  // Doing so could cause simulation to pause at the gate output
  // when it could otherwise complete the table row.
  //
  // register_output() may be called multiple times in a tick
  // (e.g. due to changing cell inputs, or because more wires are
  // connected while simulation is paused).  Register the output to
  // tick only once.
  if (propagated && !this.registered) {
    this.be.sim.register_obj(this, true);
    this.registered = true;
  }
};

Io.prototype.tick = function(speed) {
  // tick() is called for output ports first in a tick, and the value
  // is only released to be in flight on the wire in this tick.  Thus,
  // we know that ticking one output port cannot corrupt the pending
  // value to be propagated on any other output port.
  for (var i = 0; i < this.w.length; i++) {
    this.w[i].release_value();
  }

  this.registered = false;
};

Io.prototype.bring_to_top = function() {
  this.el_value_text_bg.insertBefore(this.be.z_io);
  this.el_value_text.insertBefore(this.be.z_io);
  this.el_stub_end.insertBefore(this.be.z_io);
};

Io.prototype.mark_old = function(type) {
  this.pending_del = type;
  for (var i = 0; i < this.w.length; i++) {
    this.w[i].mark_old(type);
  }
};

Io.prototype.restore_old = function() {
  this.pending_del = false;
  this.color_stub(this.value);
  for (var i = 0; i < this.w.length; i++) {
    this.w[i].restore_old();
  }
};

Io.prototype.extend_bbox = function(bbox) {
  var x = this.x - this.be.wire_arc_radius;
  if (x < bbox.left) bbox.left = x;

  var x = this.x + this.be.wire_arc_radius;
  if (x > bbox.right) bbox.right = x;

  // We don't include space for a wire arc above the top cell because
  // in the rare case where it is used, there's some chance that it
  // will still be visible (e.g. to the left or right of the sim
  // controls), and it's pretty obvious how the wire goes even if it's
  // not visible.
  if (this.y < bbox.top) bbox.top = this.y;

  // There is never a wire arc below the bottom cell.
  if (this.y > bbox.bottom) bbox.bottom = this.y;
};
