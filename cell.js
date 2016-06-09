// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Cell(be, canvas_type, type, x, y, name, locked, harness_width) {
  this.be = be;
  this.name = name;
  this.locked = locked;
  this.canvas_type = canvas_type;
  this.canvas = (canvas_type == "cdraw") ? this.be.cdraw :
                (canvas_type == "cbox")  ? this.be.cbox :
                                           this.be.cdrag;

  this.type = type;
  this.width = 1;
  this.input_width = 1;
  this.output_width = 1;
  this.x = x;
  this.y = y;
  this.io = {};
  this.pending_del = false;

  this.cell_fg_attr = {
    "stroke-width": this.be.stroke_cell_fg,
    "stroke-linejoin": "miter",
    stroke: "#000",
    fill: "#fff"
  };
  this.cell_bg_attr = {
    "stroke-width": this.be.stroke_cell_bg,
    "stroke-linejoin": "round",
    stroke: (this.canvas_type == "cbox") ? "#d0ffd0" : "#eee"
  };

  this.cell_label_attr = {
    "stroke-width": 0,
    fill: "#000"
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
    stroke: (this.canvas_type == "cbox") ? "#d0ffd0" : "#eee",
    "stroke-linecap": "round"
  };
  this.stub_fg_attr = {
    "stroke-width": this.be.stroke_wire_fg,
    stroke: Wire.color(undefined)
  };

  this.el_s = this.canvas.set();
  this.el_ns = this.canvas.set();
  this.el_no_target = this.canvas.set();
  this.el_cell = this.canvas.set();
  if (typeof this["init_" + type] != "function") throw "bad cell type" + type;
  this["init_" + type](harness_width);
  if (type == "null") return; // do nothing else for the null cell

  if (this.canvas_type != "cdrag"){
    this.bbox = this.el_ns.getBBox(true);
  }

  var text_height = 11/16 * this.be.em_size;
  var attr = {
    "text-anchor": "middle",
    "font-family": "Verdana, Helvetica, Arial, sans-serif",
    //"font-family": "Courier New, Fixed, monospace",
    "font-size": text_height
  };
  this.qty_y = 0;
  this.el_qty_text = this.canvas.text(this.qty_cx, this.qty_y, "").attr(attr);
  this.el_qty_text.setAttr("visibility", "hidden");
  this.el_qty_text.setAttr("pointer-events", "none");
  this.push_ns(this.el_qty_text);

  // Make a separate xform set that includes the IO elements so that they
  // get moved with the cell.
  this.set_xform = this.canvas.set(this.el_cell);

  // Add the IO elements to the draw set so that they get moved
  // with the cell.
  for (var port_name in this.io) {
    this.set_xform.push(this.io[port_name].set_io);
  }
  this.set_xform.transform("t" + this.x + "," + this.y);

  this.bring_to_top();

  if (this.locked){
    this.change_cursor("not-allowed");
  } else {
    this.change_cursor("grab");
  }

  var init_drag = function (el, num) {
    this.be.bdrag.drag($(el.node), this, 'cell',
                       {start: this.cell_drag_start,
                        move: this.cell_drag_move,
                        end: this.cell_drag_end});
    return true;
  }
  this.el_no_target.forEach(init_drag, this);

  if ((this.canvas_type == 'cdraw') &&
      ((this.type == 'condenser') || (this.type == 'expander'))) {
    this.update_width(harness_width || 2);
  }
}


// Public members

Cell.prototype.change_cursor = function(cursor) {
  // Try various cursor possibilities from least preferred to most
  // preferred.  If the browser doesn't support one of the preferred
  // values, then it keeps the last value that worked.
  this.el_no_target.attr({cursor: "default"});

  if ((cursor == "grab") || (cursor == "grabbing")){
    this.el_no_target.attr({cursor: "-webkit-" + cursor});
    this.el_no_target.attr({cursor: "-moz-" + cursor});
  }

  this.el_no_target.attr({cursor: cursor});
};

Cell.prototype.update_qty_text = function(n, pending) {
  var attr = {
    text: "x" + n,
    fill: (pending || !n) ? "#aaa" : "#000"
  };
  this.el_qty_text.attr(attr);
  var bbox = this.el_qty_text.getBBox(true);
  var desiredtop = this.qty_top + this.be.stroke_wire_fg * 2;
  var actualtop = bbox.y;
  var drift_y = actualtop - desiredtop;
  this.qty_y -= drift_y;
  this.el_qty_text.attr({y: this.qty_y});
};

Cell.prototype.update_quantity = function(n) {
  this.update_qty_text(n);

  if (n && !this.quantity){
    this.el_s.attr({stroke: "#000"});
    this.change_cursor("grab");
  } else if (!n && this.quantity){
    this.el_s.attr({stroke: "#aaa"});
    this.change_cursor("not-allowed");
  }

  this.quantity = n;
};

Cell.prototype.update_width = function(n, pending) {
  var name = pending ? 'pending_width' : 'width';

  if (n == this[name]) return;

  if ((n == 1) && (!pending || (this.width == 1))) {
    this.el_qty_text.setAttr('visibility', 'hidden');
  } else {
    this.update_qty_text(n, pending && (n != this.width));
    this.el_qty_text.setAttr('visibility', 'visible');
  }

  this[name] = n;
  if (!pending) {
    if (this.type != 'condenser') this.input_width = n;
    if (this.type != 'expander') this.output_width = n;
  }
};

Cell.prototype.propagate_width = function(n) {
  for (var port_name in this.io) {
    var io = this.io[port_name];
    if (io.type == 'output') {
      for (var i = 0; i < io.w.length; i++) {
        if (io.w[i].pending_del != 'del') {
          var cell = io.w[i].i.cell;
          var failure = cell.update_prospective_width(n);
          if (failure) return failure;
        }
      }
    }
  }
  // implicit return undefined for success
};

Cell.prototype.update_prospective_width = function(n) {
  var prospective_width = this.prospective_width;

  if (this.type == 'condenser') {
    prospective_width = 1;
  } else if (this.locked || (this.type == 'expander')) {
    prospective_width = this.width;
  }

  if (prospective_width === undefined) {
    this.prospective_width = n;
    return this.propagate_width(n);
  } else if (n != prospective_width) {
    return "width mismatch";
  } else { // n == prospective_width
    return undefined; // No need to propagate further, and may be a loop.
  }
};

Cell.prototype.propagate_value = function() {
  var calc_func_name = "calc_" + this.type;
  if (!this[calc_func_name]) return;
  this[calc_func_name]();
};

Cell.prototype.reset = function() {
  for (var port_name in this.io){
    this.io[port_name].reset();
  }
}


// Private functions & members

Cell.prototype.calc_inv = function() { this.calc_buf(true); };
Cell.prototype.calc_buf = function(inv) {
  var i = this.io.i.value;
  if (i === undefined) {
    this.io.o.propagate_output(undefined);
    return;
  }
  var value = i;
  var max = (1 << this.width) - 1;
  if (inv) value ^= max;
  this.io.o.propagate_output(value);
};

Cell.prototype.calc_nand = function() { this.calc_and(true); };
Cell.prototype.calc_and = function(inv) {
  var i0 = this.io.i0.value;
  var i1 = this.io.i1.value;
  var value;
  var max = (1 << this.width) - 1;
  if ((i0 === 0) || (i1 === 0)){
    value = 0;
  } else if ((i0 === undefined) || (i1 === undefined)){
    this.io.o.propagate_output(undefined);
    return;
  } else {
    value = i0 & i1;
  }
  if (inv) value ^= max;
  this.io.o.propagate_output(value);
};

Cell.prototype.calc_nor = function() { this.calc_or(true); };
Cell.prototype.calc_or = function(inv) {
  var i0 = this.io.i0.value;
  var i1 = this.io.i1.value;
  var value;
  var max = (1 << this.width) - 1;
  if ((i0 === max) || (i1 === max)){
    value = max;
  } else if ((i0 === undefined) || (i1 === undefined)){
    this.io.o.propagate_output(undefined);
    return;
  } else {
    value = i0 | i1;
  }
  if (inv) value ^= max;
  this.io.o.propagate_output(value);
};

Cell.prototype.calc_xnor = function() { this.calc_xor(true); };
Cell.prototype.calc_xor = function(inv) {
  var i0 = this.io.i0.value;
  var i1 = this.io.i1.value;
  if ((i0 === undefined) || (i1 === undefined)){
    this.io.o.propagate_output(undefined);
  } else {
    var value = i0 ^ i1;
    var max = (1 << this.width) - 1;
    if (inv) value ^= max;
    this.io.o.propagate_output(value);
  }
};

Cell.prototype.calc_mux = function() {
  var i0 = this.io.i0.value;
  var i1 = this.io.i1.value;
  var s = this.io.s.value;
  var max = (1 << this.width) - 1;
  if ((i0 === i1) || (s === 0)) {
    this.io.o.propagate_output(i0);
  } else if (s === max) {
    this.io.o.propagate_output(i1);
  } else if ((s === undefined) || (i0 === undefined) || (i1 === undefined)) {
    this.io.o.propagate_output(undefined);
  } else {
    this.io.o.propagate_output((~s & i0) | (s & i1));
  }
};

Cell.prototype.calc_const = function() {
  this.io.o.propagate_output(0);
};

Cell.prototype.calc_input = function() {
  this.io.o.propagate_output(this.be.level.value(this.name));
}

Cell.prototype.calc_output = function() {
  var value = this.value = this.io.i.value;
  var exp_value = this.be.level.value(this.name);
  if ((exp_value === undefined) || (value === undefined)){
    this.el_check.setAttr("visibility", "hidden");
    this.el_question.setAttr("visibility", "visible");
  } else {
    var attr = {};
    var height = 1.5 * this.be.io_spacing;
    var width = height;
    var right = width/2;
    var left = right + height*1/3;
    if (value === exp_value) {
      attr.stroke = "#0c0";
      attr.path = ["M", left, 0,
                   "l", height*1/6, height*1/3,
                   "l", height*2/6, -height*2/3];
    } else {
      attr.stroke = "#f00";
      attr.path = ["M", left, -height*1/3,
                   "l", height*2/3, height*2/3,
                   "m", 0, -height*2/3,
                   "l", -height*2/3, height*2/3];
    }
    this.el_check.attr(attr);
    this.el_check.setAttr("visibility", "visible");
  }
}

Cell.prototype.calc_latch = function() {
  var d = this.io.d.value;
  var e = this.io.e.value;
  if (e === 1){
    if (d === undefined){
      this.io.q.propagate_output(undefined);
    } else {
      this.io.q.propagate_output(d);
    }
  } else {
    // Don't propagate a value (leave the output unchanged)
    // if E is 0 or undefined.
  }
};

Cell.prototype.calc_condenser = function() {
  var z = 0;

  for (var i = 0; i < this.width; i++) {
    var value = this.io['i' + i].value;
    if (value === undefined) {
      this.io.o.propagate_output(undefined);
      return;
    }
    z |= value << i;
  }
  this.io.o.propagate_output(z);
};

Cell.prototype.calc_expander = function() {
  var value = this.io.i.value;
  for (var i = 0; i < this.width; i++) {
    if (value === undefined) {
      this.io['o' + i].propagate_output(undefined);
    } else {
      this.io['o' + i].propagate_output((value >> i) & 1);
    }
  }
};

Cell.prototype.check_pending = function() {
  this.el_question.setAttr("visibility", "visible");
}

Cell.prototype.done_check = function() {
  var exp_value = this.be.level.value(this.name);
  if (exp_value === undefined){
    this.el_question.setAttr("visibility", "hidden");
    return true;
  } else if (this.value === undefined){
    return undefined;
  } else {
    this.el_question.setAttr("visibility", "hidden");
    return this.value === this.be.level.value(this.name);
  }
};

Cell.prototype.bring_to_top = function() {
  if (this.canvas_type != "cdraw") return;

  this.el_cell.insertBefore(this.be.z_cell);
  for (var port_name in this.io) {
    this.io[port_name].bring_to_top();
  }

  this.be.level.move_cell_to_end(this);
};

Cell.prototype.cell_drag_start = function(x, y) {
  this.dragging_disallowed = this.locked || (this.quantity === 0);

  if (this.dragging_disallowed) {
    if (this.locked){
      // Show the fail icon only on cdraw, not on cbox.
      this.be.drag.show_fail_xy(this.x, this.y);
      $('#error').html('<p>This logic element is locked by the puzzle and cannot be moved or deleted.</p>');
    } else {
      $('#error').html('<p>You have already used all available gates of this type.</p>');
    }
    $(document.body).addClass('cursor-force-not-allowed');
    this.be.drag.disable_hover();
    return;
  }


  $(document.body).addClass('cursor-force-grabbing');
  this.be.drag.disable_hover();

  // Pop cell to top for more natural dragging.
  this.bring_to_top();

  if (this.canvas_type == "cbox"){
    // Typically when a cell is grabbed from the box, this line
    // decreases its quantity, but check_for_del() immediately
    // increases its (pending) quantity right back again since the
    // cell is positioned to be deleted.
    this.be.level.update_box_quantity(this.type, -1);
  }

  // Bring the drag div (and its associated canvas) to the top of the Z order.
  // This allows drawn elements to cross the scrollbar, and also prevents
  // mouse events from reaching the scrollbar.
  $(this.be.div_cdrag).css("z-index", "99")

  if (this.canvas == this.be.cdraw){
    var canvas_x = this.x;
    var canvas_y = this.y;
    this.cdraw_cell = this;
  } else { // canvas == cbox
    var canvas_x = this.be.circuit.cdraw_to_canvas_x(x);
    var canvas_y = this.be.circuit.cdraw_to_canvas_y(y);
    this.cdraw_cell = new Cell(this.be, "cdraw", this.type, canvas_x, canvas_y);
  }
  this.cdrag_cell = new Cell(this.be, "cdrag", this.type, canvas_x, canvas_y,
                             this.name);

  // Remember how far the cell's x,y coordinate is from the canvas
  // coordinate of the mouse/touch.
  this.canvas_drag_offset_x = canvas_x - this.be.circuit.cdraw_to_canvas_x(x);
  this.canvas_drag_offset_y = canvas_y - this.be.circuit.cdraw_to_canvas_y(y);

  // Put the cdrag cell in a central location.
  // The resize/reflow code will fix its position as necessory.
  this.be.cdrag_cell = this.cdrag_cell;

  this.be.level.update_widths(true);

  this.cdraw_cell.check_for_del(x, y, this.canvas == this.be.cbox);
  this.cdrag_cell.check_for_del(x, y, this.canvas == this.be.cbox);
};

Cell.prototype.move = function(dx, dy) {
  this.x += dx;
  this.y += dy;
  this.set_xform.transform("t" + this.x + "," + this.y);
};

Cell.prototype.check_for_del = function(x, y, is_new) {
  // We check for deletion based on the position of the mouse pointer,
  // not the center (0,0) coordinate of the cell.
  var del;
  if (is_new &&
      (x >= 0) &&
      (x < this.be.cbox_width) &&
      (y >= this.be.truth_height) &&
      (y < this.be.window_height)){
    // A new cell is still within the cell box
    // (or has been returned to the cell box.)
    del = "new";
  } else if ((x < this.be.cbox_width) ||
             (x >= this.be.window_width) ||
             (y >= this.be.window_height) ||
             ((x < this.be.info_width) && (y < this.be.info_height)) ||
             ((x < this.be.truth_width) && (y < this.be.truth_height)) ||
             ((x >= this.be.controls_offset.left) &&
              (x < this.be.controls_offset.left + this.be.controls_width) &&
              (y < this.be.controls_offset.top + this.be.controls_height)) ||
             ((x >= this.be.window_width - this.be.main_stub_width) &&
              (y < this.be.main_stub_height)) ||
             ((x >= this.be.window_width - this.be.zoom_width) &&
              (y >= this.be.window_height - this.be.zoom_height))){
    del = "del";
  } else {
    del = false;
  }
  if (del && !this.pending_del){
    var attr;
    if (del == "new"){
      attr = {
        stroke: "#aaa", // grey
        "stroke-dasharray": ""
      };
    } else {
      attr = {
        stroke: "#e88", // red
        "stroke-dasharray": "-"
      };
    }
    this.el_s.attr(attr);

    for (var name in this.io) {
      this.io[name].mark_old("del");
    }
    this.pending_del = del;

    if (this.canvas_type == "cdraw"){
      this.be.level.remove_cell(this);
      this.be.level.update_box_quantity(this.type, +this.width);
    }

    this.be.level.update_widths(true);
  } else if (!del && this.pending_del){
    var attr = {
      stroke: "#000", // black
      "stroke-dasharray": ""
    };
    this.el_s.attr(attr);

    for (var name in this.io) {
      this.io[name].restore_old();
    }
    this.pending_del = del;

    if (this.canvas_type == "cdraw"){
      this.be.level.add_cell(this);
      this.be.level.update_box_quantity(this.type, -this.width);
    }

    this.be.level.update_widths(true);
  } else {
    // If the wires weren't already redrawn above (in a different
    // color due to a change in deletion status), then they're redrawn
    // here solely to update their position.
    for (var port_name in this.io) {
      this.io[port_name].redraw();
    }
  }
};

Cell.prototype.cell_drag_move = function(x, y) {
  if (this.dragging_disallowed) return;

  var mx = this.be.circuit.cdraw_to_canvas_x(x);
  var my = this.be.circuit.cdraw_to_canvas_y(y);
  var canvas_dx = mx + this.canvas_drag_offset_x - this.cdraw_cell.x;
  var canvas_dy = my + this.canvas_drag_offset_y - this.cdraw_cell.y;
  this.cdrag_cell.move(canvas_dx, canvas_dy);
  this.cdraw_cell.move(canvas_dx, canvas_dy);

  this.cdrag_cell.check_for_del(x, y, this.canvas == this.be.cbox);
  this.cdraw_cell.check_for_del(x, y, this.canvas == this.be.cbox);
};

Cell.prototype.cell_drag_end = function() {
  if (this.dragging_disallowed) {
    this.be.drag.hide_fail();
    $('#error').html('');
    $(document.body).removeClass('cursor-force-not-allowed');
    this.be.drag.enable_hover();
    return;
  }

  $(document.body).removeClass('cursor-force-grabbing');
  this.be.drag.enable_hover();

  $(this.be.div_cdrag).css("z-index", "-1")
  this.cdrag_cell.remove();
  this.be.cdrag_cell = undefined;

  if (this.cdraw_cell.pending_del){
    this.cdraw_cell.remove();
  }
  this.be.level.commit_widths();

  this.be.level.encode_url();
};

Cell.prototype.remove = function() {
  var remove_drag = function (el, num) {
    this.be.bdrag.undrag($(el.node));
    return true;
  }
  this.el_cell.forEach(remove_drag, this);

  for (var name in this.io) {
    this.io[name].remove();
  }
  this.io = null;
  this.el_cell.remove();
};

Cell.prototype.init_io = function(inv, no, ni, left, right,
                                  upsidedown, shallow) {
  var cw = this.be.stub_len;
  var cs = this.be.io_spacing;

  if (inv) right += this.be.inv_bubble_size;

  for (var i = 0; i < no; i++) {
    var y = ((i+0.5)*cs)-(no*cs/2);
    if (upsidedown) y = -y;
    var io_obj = new Io(this.be, this.canvas, this,
                        (no > 1) ? "o" + i : "o", "output",
                        right+cw, y, shallow ? right : 0);
    this.io[io_obj.name] = io_obj;
  }

  if (no > 0){
    // Position the quantity text just below the last output stub.
    this.qty_cx = io_obj.x;
    this.qty_top = io_obj.y;
  }

  for (var i = 0; i < ni; i++) {
    var y = ((i+0.5)*cs)-(ni*cs/2);
    if (upsidedown) y = -y;
    var io_obj = new Io(this.be, this.canvas, this,
                        (ni > 1) ? "i" + i : "i", "input",
                        left-cw, y, shallow ? left : 0);
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
    if (!((this.type == 'condenser') && (name == 'o')) &&
        !((this.type == 'expander') && (name == 'i'))){
      stub_path = stub_path.concat(this.io[name].path);
    }
  }
  this.push_ns(this.canvas.path(stub_path).attr(this.stub_bg_attr));

  // In contrast, the stub foregrounds can be drawn in different
  // colors depending on the IO state.  Therefore, each is its own
  // path, owned by the IO instance.  The cell does still get the
  // drawing elements, though, so that they can be added to the
  // set for translation.  (But the cell also keeps them separately
  // to avoid changing their Z level.)
  for (var name in this.io) {
    if (!((this.type == 'condenser') && (name == 'o')) &&
        !((this.type == 'expander') && (name == 'i'))){
      this.push_s(this.io[name].draw_stub_fg());
    }
  }

  if ((this.type == 'condenser') || (this.type == 'expander')) {
    var port_name = (this.type == 'condenser') ? 'o' : 'i';
    var port = this.io[port_name];
    var el_stub_bg = this.canvas.path(port.path).attr(this.stub_bg_attr);
    var el_stub_fg = port.draw_stub_fg();
    this.push_ns(this.el_harness_stub_bg = el_stub_bg);
    this.push_s(this.el_harness_stub_fg = el_stub_fg);
  }
};

Cell.prototype.draw_inv = function(inv, right, bg, y) {
  if (inv){
    var inv_r = this.be.inv_bubble_size/2;
    var inv_cx = right+inv_r;
    var attr = bg ? this.cell_bg_attr : this.cell_fg_attr;
    if (bg){
      this.push_ns(this.canvas.circle(inv_cx, y||0, inv_r).attr(attr));
    } else {
      this.push_s(this.canvas.circle(inv_cx, y||0, inv_r).attr(attr));
    }
  }
};

Cell.prototype.init_inv = function() { this.init_buf(true); };
Cell.prototype.init_buf = function(inv) {
  var height = 1.5 * this.be.io_spacing;
  var width = Math.sqrt(3)/2*height; /* equilateral */
  var left = -width/2;
  var right = width/2;

  this.init_io(inv, 1, 1, left, right);

  var cell_path = ["M", left, -height/2,
                   "v", height,
                   "l", width, -height/2,
                   "z"];
  this.push_ns(this.canvas.path(cell_path).attr(this.cell_bg_attr));
  this.draw_inv(inv, right, true);
  this.draw_stubs();
  this.push_s(this.canvas.path(cell_path).attr(this.cell_fg_attr));
  this.draw_inv(inv, right, false);
};

Cell.prototype.init_nand = function() { this.init_and(true); };
Cell.prototype.init_and = function(inv) {
  var ni = 2;
  var height = ni*this.be.io_spacing;
  var r = height/2;
  var box_width = height-r;
  var cell_width = height;
  var left = -cell_width/2;
  var right = cell_width/2;
  var top = -height/2;

  this.init_io(inv, 1, ni, left, right);

  var cell_path = ["M", left, top,
                   "v", height,
                   "h", box_width,
                   "a", r, r, 0, 0, 0, 0, -height,
                   "h", -box_width,
                   "z"];

  this.push_ns(this.canvas.path(cell_path).attr(this.cell_bg_attr));
  this.draw_inv(inv, right, true);
  this.draw_stubs();
  this.push_s(this.canvas.path(cell_path).attr(this.cell_fg_attr));
  this.draw_inv(inv, right, false);
};

Cell.prototype.init_nor = function() { this.init_or(true); };
Cell.prototype.init_or = function(inv) {
  var ni = 2;
  var height = ni*this.be.io_spacing;
  var r = height/2;
  var cell_width = height;
  var left = -cell_width/2;
  var right = cell_width/2;
  var top = -height/2;

  this.init_io(inv, 1, ni, left, right);

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

  this.push_ns(this.canvas.path(cell_path).attr(this.cell_bg_attr));
  this.draw_inv(inv, right, true);
  this.draw_stubs();
  this.push_s(this.canvas.path(cell_path).attr(this.cell_fg_attr));
  this.draw_inv(inv, right, false);
};

Cell.prototype.init_xnor = function() { this.init_xor(true); };
Cell.prototype.init_xor = function(inv) {
  var ni = 2;
  var height = ni*this.be.io_spacing;
  var r = height/2;
  var cell_width = height;
  var left = -cell_width/2;
  var right = cell_width/2;
  var top = -height/2;
  var bar_space = cell_width/6;
  var far_left = left - bar_space;

  this.init_io(inv, 1, ni, far_left, right);

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

  this.push_ns(this.canvas.path(cell_path_bg).attr(this.cell_bg_attr));
  this.draw_inv(inv, right, true);
  this.draw_stubs();
  this.push_ns(this.canvas.path(cell_path_bg).attr(this.cell_fg_fill_attr));
  this.push_s(this.canvas.path(cell_path_fg).attr(this.cell_fg_line_attr));
  this.draw_inv(inv, right, false);
};

Cell.prototype.init_mux = function(inv) {
  var height = 3*this.be.io_spacing;
  var nheight = 2*this.be.io_spacing;
  var width = 1.2*this.be.io_spacing;
  var data_height = 0.8*this.be.io_spacing;
  var left = -width/2;
  var right = width/2;
  var top = -height/2;

  this.io.o = new Io(this.be, this.canvas, this,
                     'o', 'output',
                     right+this.be.stub_len, 0, 0);

  this.qty_cx = this.io.o.x;
  this.qty_top = this.io.o.y;

  this.io.i0 = new Io(this.be, this.canvas, this,
                      'i0', 'input',
                      left-this.be.stub_len, -data_height, 0);
  this.io.i1 = new Io(this.be, this.canvas, this,
                      'i1', 'input',
                      left-this.be.stub_len, data_height, 0);
  this.io.s = new Io(this.be, this.canvas, this,
                     's', 'input',
                     left, -top + this.be.stub_len, 'mux');

  var cell_path = ["M", left, top,
                   "v", height,
                   "l", width, -this.be.io_spacing/2,
                   "v", -nheight,
                   "z"];

  this.push_ns(this.canvas.path(cell_path).attr(this.cell_bg_attr));
  this.draw_stubs();
  this.push_s(this.canvas.path(cell_path).attr(this.cell_fg_attr));

  var attr = {
    "stroke-width": 0,
    fill: "#000",
    'text-anchor': 'start'
  };
  left += this.be.stroke_cell_fg;
  this.push_ns(this.canvas.text(left, -data_height, '0').attr(attr));
  this.push_ns(this.canvas.text(left, data_height, '1').attr(attr));
};

Cell.prototype.init_input = function() {
  var height = 1.5 * this.be.io_spacing;
  var width = height;
  var left = -width/2;
  var right = width/2 + height/2;
  var top = -height/2;

  this.init_io(false, 1, 0, left, right);

  var path = ["M", left, top,
              "v", height,
              "h", width,
              "L", right, 0,
              "L", width/2, top,
              "z"];
  this.push_ns(this.canvas.path(path).attr(this.cell_bg_attr));
  this.draw_stubs();
  this.push_s(this.canvas.path(path).attr(this.cell_fg_attr));

  this.el_text = this.canvas.text(0, 0, "");
  this.el_text.setAttr("pointer-events", "none");
  this.push_ns(this.el_text);
};

Cell.prototype.init_output = function() {
  var height = 1.5 * this.be.io_spacing;
  var width = height;
  var left = -width/2 - height/2;
  var right = width/2;
  var top = -height/2;

  this.init_io(false, 0, 1, left, right);

  this.qty_cx = this.io.i.x;
  this.qty_top = this.io.i.y;

  var path = ["M", right, top,
              "v", height,
              "h", -width,
              "L", left, 0,
              "L", -width/2, top,
              "z"];
  this.push_ns(this.canvas.path(path).attr(this.cell_bg_attr));
  this.draw_stubs();
  this.push_s(this.canvas.path(path).attr(this.cell_fg_attr));

  this.el_text = this.canvas.text(0, 0, "");
  this.el_text.setAttr("pointer-events", "none");
  this.push_ns(this.el_text);

  // Placeholder for output check result.
  var attr = {
    "stroke-width": this.be.stroke_check,
    "stroke-linejoin": "round",
    "stroke-linecap": "round"
  };
  this.el_check = this.canvas.path("M0,0").attr(attr);
  this.el_check.setAttr("visibility", "hidden");
  this.el_check.setAttr("pointer-events", "none");
  this.push_ns(this.el_check);

  // Draw a "question mark" when the output check is pending.  If a
  // value creates a checkmark or X, the question mark remains on top
  // of it until simulation is done.
  var deg30 = Math.PI/6;
  var cos30 = Math.cos(deg30);
  var cleft = right + height*1/3;
  var cx = cleft + (height*2/3/2);
  var cwidth = height*3/6;
  var rx = cwidth/2;
  var cheight = height*2/3;
  var gap = this.be.stroke_question*1.5;
  var uheight = cheight - gap;
  var nheight = 1+cos30*2;
  var ry = uheight/nheight;
  var attr = {
    stroke: "#888", // gray
    "stroke-width": this.be.stroke_question,
    "stroke-linejoin": "round",
    "stroke-linecap": "round"
  };
  var path = ["M", cx - rx, -cheight/2+ry,
              "a", rx, ry, 0, 1, 1, cwidth*3/4, cos30*ry,
              "a", rx, ry, 0, 0, 0, -cwidth*1/4, cos30*ry,
              "m", 0, gap,
              "l", 0, 0];
  this.el_question = this.canvas.path(path).attr(attr);
  this.el_question.setAttr("visibility", "hidden");
  this.el_question.setAttr("pointer-events", "none");
  this.push_ns(this.el_question);
};

Cell.prototype.fit_input_text = function() {
  var name = this.name.toUpperCase();
  var value = this.be.level.value(this.name);
  if (value === undefined){
    var text = name + "=X";
  } else {
    var text = name + "=" + this.be.level.value(this.name);
  }

  if (text === this.text) return;
  this.text = text;

  this.el_text.attr({text: text, x: 0, "font-size": "10"});
  var bbox = this.el_text.getBBox(true);

  var height = 1.5 * this.be.io_spacing;
  var width = height;
  var total_width = width + height/2;

  // Since the text width is fitting into the angled point, we want the
  // width + half the height to fit in the total cell width.
  var scale = total_width / (bbox.width + bbox.height/2);

  // We shift the left edge of the text to the left edge of the cell,
  // i.e. -width/2.  But because the left stroke is close to the body
  // of the text, whereas the right stroke only touches the corners
  // (most likely above and below the text), we fudge a little to the
  // right.
  var shift = -width/2 - (bbox.x * scale) + this.be.stroke_cell_fg/2;

  this.el_text.attr({x: shift, "font-size": "" + 10*scale});
};

Cell.prototype.fit_output_text = function() {
  var name = this.name.toUpperCase();
  var value = this.be.level.value(this.name);
  if (value === undefined){
    var text = name;
  } else {
    var text = name + "=" + value + "?";
  }

  if (text === this.text) return;
  this.text = text;

  this.el_text.attr({text: text, x: 0, "font-size": "10"});
  var bbox = this.el_text.getBBox(true);
  if (text.length < 3){
    // To prevent the text from getting weirdly huge, we pretend that
    // a short text string is wider than it really is.
    var inc = bbox.width * (3 / text.length - 1);
    bbox.width += inc;
    bbox.x -= inc/2;
  }

  var height = 1.5 * this.be.io_spacing;
  var width = height;
  var total_width = width + height/2;

  // Since the text width is fitting into the angled point, we want the
  // width + half the height to fit in the total cell width.
  var scale = total_width / (bbox.width + bbox.height/2);

  // We shift the right edge of the text to the right edge of the cell,
  // i.e. width/2.  But because the right stroke is close to the body
  // of the text, whereas the left stroke only touches the corners
  // (most likely above and below the text), we fudge a little to the
  // left.
  var shift = width/2 - ((bbox.x + bbox.width) * scale) - this.be.stroke_cell_fg/2;

  this.el_text.attr({x: shift, "font-size": "" + 10*scale});
};

Cell.prototype.init_const = function() {
  var height = 1.5 * this.be.io_spacing;
  var width = height;
  var left = -width/2;
  var right = width/2;
  var top = -height/2;

  this.init_io(false, 1, 0, left, right);

  this.push_ns(this.canvas.rect(left, top, width, height).attr(this.cell_bg_attr));
  this.draw_stubs();
  this.push_s(this.canvas.rect(left, top, width, height).attr(this.cell_fg_attr));
};

Cell.prototype.init_latch = function() {
  var height = 3*this.be.io_spacing;
  var width = 2*this.be.io_spacing;
  var left = -width/2;
  var right = width/2;
  var top = -height/2;

  this.io['d'] = new Io(this.be, this.canvas, this, 'd', 'input',
                        left - this.be.stub_len, -this.be.io_spacing, left);
  this.io['e'] = new Io(this.be, this.canvas, this, 'e', 'input',
                        left - this.be.stub_len, 0, left);

  this.io['q'] = new Io(this.be, this.canvas, this, 'q', 'output',
                        right + this.be.stub_len, -this.be.io_spacing, right);

  this.qty_cx = this.io['q'].x;
  this.qty_top = this.io['q'].y + this.be.io_spacing * 2;

  this.push_ns(this.canvas.rect(left, top, width, height).attr(this.cell_bg_attr));
  this.draw_stubs();
  this.push_s(this.canvas.rect(left, top, width, height).attr(this.cell_fg_attr));

  var attr = {
    "stroke-width": 0,
    fill: "#000",
    'text-anchor': 'start'
  };
  left += this.be.stroke_cell_fg;
  this.push_ns(this.canvas.text(left, -this.be.io_spacing, "D").attr(attr));
  this.push_ns(this.canvas.text(left, 0, "E").attr(attr));

  attr['text-anchor'] = 'end';
  right -= this.be.stroke_cell_fg;
  this.push_ns(this.canvas.text(right, -this.be.io_spacing, "Q").attr(attr));
};

Cell.prototype.init_condenser = function(ni) {
  ni = ni || 2;
  var height = ni*this.be.io_spacing;
  var width = this.be.io_spacing * 2;
  var left = -width/2;
  var right = width/2;
  var top = -height/2;

  this.init_io(false, 1, ni, left, right, true, true);

  var cell_path = ["M", left, top,
                   "v", height,
                   "L", right, this.be.io_spacing/2,
                   "v", -this.be.io_spacing,
                   "z"];

  var trace_path = [];
  for (var i = 0; i < ni; i++) {
    var y = top + (i+0.5)*this.be.io_spacing;
    trace_path.push('M', left, y, 'L', right, 0);
  }

  this.con_bg = this.canvas.path(cell_path).attr(this.cell_bg_attr);
  this.push_ns(this.con_bg);
  this.draw_stubs();
  this.con_fill = this.canvas.path(cell_path).attr(this.cell_fg_fill_attr);
  this.push_s(this.con_fill);
  this.con_trace = this.canvas.path(trace_path).attr(this.stub_fg_attr);
  this.push_s(this.con_trace);
  this.con_fg = this.canvas.path(cell_path).attr(this.cell_fg_line_attr);
  this.push_s(this.con_fg);

  if (this.locked || (this.canvas_type != 'cdraw')) return;

  // Create drag targets to use for resizing the condenser.
  var attr = {
    "stroke-width": 0,
    cursor: 'row-resize'
  };

  var target_path = ['M', left, top - this.be.io_spacing/2,
                     'v', this.be.io_spacing,
                     'L', right, -this.be.io_spacing/2,
                     'v', -this.be.io_spacing/2,
                     'z'];
  this.el_top_target = this.canvas.path(target_path).attr(attr);
  this.el_top_target.setAttr("visibility", "hidden");
  this.el_top_target.setAttr("pointer-events", "all");
  this.push_ns(this.el_top_target, true);
  this.be.bdrag.drag($(this.el_top_target.node), this, 'cell',
                     {start: this.harness_drag_start,
                      move: this.harness_drag_move,
                      end: this.harness_drag_end},
                     'top');

  var target_path = ['M', left, -top + this.be.io_spacing/2,
                     'v', -this.be.io_spacing,
                     'L', right, this.be.io_spacing/2,
                     'v', this.be.io_spacing/2,
                     'z'];
  this.el_bottom_target = this.canvas.path(target_path).attr(attr);
  this.el_bottom_target.setAttr("visibility", "hidden");
  this.el_bottom_target.setAttr("pointer-events", "all");
  this.push_ns(this.el_bottom_target, true);
  this.be.bdrag.drag($(this.el_bottom_target.node), this, 'cell',
                     {start: this.harness_drag_start,
                      move: this.harness_drag_move,
                      end: this.harness_drag_end},
                     'bottom');
};

Cell.prototype.init_expander = function(no) {
  no = no || 2;
  var height = no*this.be.io_spacing;
  var width = this.be.io_spacing * 2;
  var left = -width/2;
  var right = width/2;
  var top = -height/2;

  this.init_io(false, no, 1, left, right, true, true);

  this.qty_cx = this.io.i.x;
  this.qty_top = this.io.i.y;

  var cell_path = ["M", right, top,
                   "v", height,
                   "L", left, this.be.io_spacing/2,
                   "v", -this.be.io_spacing,
                   "z"];

  var trace_path = [];
  for (var i = 0; i < no; i++) {
    var y = top + (i+0.5)*this.be.io_spacing;
    trace_path.push('M', right, y, 'L', left, 0);
  }

  this.con_bg = this.canvas.path(cell_path).attr(this.cell_bg_attr);
  this.push_ns(this.con_bg);
  this.draw_stubs();
  this.con_fill = this.canvas.path(cell_path).attr(this.cell_fg_fill_attr);
  this.push_s(this.con_fill);
  this.con_trace = this.canvas.path(trace_path).attr(this.stub_fg_attr);
  this.push_s(this.con_trace);
  this.con_fg = this.canvas.path(cell_path).attr(this.cell_fg_line_attr);
  this.push_s(this.con_fg);

  if (this.locked || (this.canvas_type != 'cdraw')) return;

  // Create drag targets to use for resizing the expander.
  var attr = {
    "stroke-width": 0,
    cursor: 'row-resize'
  };

  var target_path = ['M', right, top - this.be.io_spacing/2,
                     'v', this.be.io_spacing,
                     'L', left, -this.be.io_spacing/2,
                     'v', -this.be.io_spacing/2,
                     'z'];
  this.el_top_target = this.canvas.path(target_path).attr(attr);
  this.el_top_target.setAttr("visibility", "hidden");
  this.el_top_target.setAttr("pointer-events", "all");
  this.push_ns(this.el_top_target, true);
  this.be.bdrag.drag($(this.el_top_target.node), this, 'cell',
                     {start: this.harness_drag_start,
                      move: this.harness_drag_move,
                      end: this.harness_drag_end},
                     'top');

  var target_path = ['M', right, -top + this.be.io_spacing/2,
                     'v', -this.be.io_spacing,
                     'L', left, this.be.io_spacing/2,
                     'v', this.be.io_spacing/2,
                     'z'];
  this.el_bottom_target = this.canvas.path(target_path).attr(attr);
  this.el_bottom_target.setAttr("visibility", "hidden");
  this.el_bottom_target.setAttr("pointer-events", "all");
  this.push_ns(this.el_bottom_target, true);
  this.be.bdrag.drag($(this.el_bottom_target.node), this, 'cell',
                     {start: this.harness_drag_start,
                      move: this.harness_drag_move,
                      end: this.harness_drag_end},
                     'bottom');
};

Cell.prototype.init_null = function() {
  // A "null" port is used as the connection point for wires
  // currently being dragged.
  var io_obj = new Io(this.be, this.canvas, this, "null", "null", 0, 0, 0);
  this.io["null"] = io_obj;
  this.be.null_io = io_obj;
};

// So that we can draw red dotted strokes for a cell pending deletion,
// we want to track el_s and el_ns separately.  These mostly match the
// concepts of foreground and background, respectively, except for
// complex cells like XOR.  Since combining el_s into el_ns into
// el_cell later would mess up the element order when el_cell is
// raised in Z order, we also build el_cell here in drawing order.
Cell.prototype.push_s = function(el) {
  this.el_s.push(el);
  this.el_no_target.push(el);
  this.el_cell.push(el);
};

Cell.prototype.push_ns = function(el, no_tgt) {
  this.el_ns.push(el);
  if (!no_tgt) this.el_no_target.push(el);
  this.el_cell.push(el);
};

Cell.prototype.harness_drag_start = function(x, y, dir) {
  // Test to see if the harness's multi-bit port is currently hooked
  // directly or indirectly to another multi-bit port with a locked
  // width.  Do this by temporarily forcing a different width and
  // seeing if it fails.
  this.update_width(this.width + 1);
  this.dragging_disallowed = this.be.level.update_widths();
  this.update_width(this.width - 1);
  this.be.level.update_widths();

  if (this.dragging_disallowed) {
    this.be.drag.show_fail_xy(this.x, this.y);
    if (this.type == 'condenser') {
      $('#error').html('<p>This condenser cannot be resized because its output is connected to downstream logic with fixed width.</p>');
    } else {
      $('#error').html('<p>This expander cannot be resized because its input is connected to upstream logic with fixed width.</p>');
    }
    $(document.body).addClass('cursor-force-not-allowed');
    this.be.drag.disable_hover();
    return;
  }

  this.canvas_drag_offset_y = this.be.circuit.cdraw_to_canvas_y(y);
  this.pending_width = this.width;

  // Pop cell to top for more natural resizing.
  this.bring_to_top();

  $(document.body).addClass('cursor-force-row-resize');
  this.be.drag.disable_hover();
};

Cell.prototype.harness_drag_move = function(x, y, dir) {
  if (this.dragging_disallowed) return;

  var bigdir = (dir == 'top') ? -1 : 1;
  var my = this.be.circuit.cdraw_to_canvas_y(y);
  var canvas_dy = my - this.canvas_drag_offset_y;
  var change = Math.round(canvas_dy / this.be.io_spacing);
  var width = this.width + change * bigdir;
  width = Math.min(8, Math.max(2, width));

  if (width == this.pending_width) return;

  change = width - this.pending_width;
  this.update_width(width, true);

  var height = width*this.be.io_spacing;
  var cwidth = this.be.io_spacing * ((this.type == 'condenser') ? 2 : -2);
  var x_wide = -cwidth/2;
  var x_thin = -x_wide;
  var top = -this.width*this.be.io_spacing/2;
  if (dir == 'top') {
    top = -top - height;
  }

  var cell_path = ["M", x_wide, top,
                   "v", height,
                   "l", cwidth, -(height-this.be.io_spacing)/2,
                   "v", -this.be.io_spacing,
                   "z"];
  this.con_bg.attr({path: cell_path});
  this.con_fill.attr({path: cell_path});
  this.con_fg.attr({path: cell_path});

  var trace_path = [];
  for (var i = 0; i < width; i++) {
    var y = top + (i+0.5)*this.be.io_spacing;
    trace_path.push('M', x_wide, y, 'L', x_thin, top + height/2);
  }
  this.con_trace.attr({path: trace_path});

  var new_y = this.y + top + height/2;
  var xform = 't' + this.x + ',' + new_y;
  var bus_port = (this.type == 'condenser') ? this.io.o : this.io.i;
  bus_port.set_io.transform(xform);
  this.el_harness_stub_bg.transform(xform);
  this.el_harness_stub_fg.transform(xform);
  this.el_qty_text.transform(xform);
};

Cell.prototype.harness_drag_end = function(dir) {
  if (this.dragging_disallowed) {
    this.be.drag.hide_fail();
    $('#error').html('');
    $(document.body).removeClass('cursor-force-not-allowed');
    this.be.drag.enable_hover();
    return;
  }

  $(document.body).removeClass('cursor-force-row-resize');
  this.be.drag.enable_hover();

  var width = this.pending_width;
  this.pending_width = undefined;
  var change = width - this.width;
  if (!change) return;

  var bigdir = (dir == 'top') ? -1 : 1;
  var dy = bigdir * change * this.be.io_spacing/2;

  // Replace this cell with a new one with the new width.
  var new_cell = new Cell(this.be, 'cdraw', this.type,
                          this.x, this.y + dy,
                          undefined, undefined, width);
  this.be.level.add_cell(new_cell);

  // Move old IO info to new IOs.
  var bus_port_name = (this.type == 'condenser') ? 'o' : 'i';
  var w = new_cell.io[bus_port_name].w = this.io[bus_port_name].w;
  for (var i = 0; i < w.length; i++) {
    w[i][bus_port_name] = new_cell.io[bus_port_name];
    w[i].redraw();
  }
  this.io[bus_port_name].w = [];

  var wire_port_prefix = (this.type == 'condenser') ? 'i' : 'o';
  for (var j = 0; j < Math.min(width, this.width); j++) {
    var old_port_name = wire_port_prefix + j;
    var new_port_name = old_port_name;
    if (dir == 'bottom') {
      if (change > 0) {
        new_port_name = wire_port_prefix + (j + change);
      } else {
        old_port_name = wire_port_prefix + (j - change);
      }
    }
    var w = new_cell.io[new_port_name].w = this.io[old_port_name].w;
    for (var i = 0; i < w.length; i++) {
      w[i][wire_port_prefix] = new_cell.io[new_port_name];
    }
    this.io[old_port_name].w = [];
    new_cell.io[new_port_name].update_value(this.io[old_port_name].value);
  }

  new_cell.propagate_value();

  // Delete the old cell now that it has been replaced.
  this.remove();
  this.be.level.remove_cell(this);

  this.be.level.encode_url();
};
