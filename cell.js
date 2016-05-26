// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Cell(be, canvas_type, type, x, y, name, locked) {
  $('#info').append('<br>new cell 1');
  this.be = be;
  this.name = name;
  this.locked = locked;
  this.canvas_type = canvas_type;
  this.canvas = (canvas_type == "cdraw") ? this.be.cdraw :
                (canvas_type == "cbox")  ? this.be.cbox :
                                           this.be.cdrag;
  $('#info').append('<br>new cell 2');

  this.type = type;
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
  $('#info').append('<br>new cell 3');

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

  $('#info').append('<br>new cell 4');
  this.el_s = this.canvas.set();
  this.el_ns = this.canvas.set();
  this.el_cell = this.canvas.set();
  $('#info').append('<br>new cell 5');
  if (typeof this["init_" + type] != "function") throw "bad cell type" + type;
  $('#info').append('<br>new cell 6');
  this["init_" + type](); // Call cell-type initiator function by name
  $('#info').append('<br>new cell 7');
  if (type == "null") return; // do nothing else for the null cell

  if (this.canvas_type != "cdrag"){
    this.bbox = this.el_ns.getBBox(true);
  }

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
    if (this.canvas == this.be.cdrag){
      this.change_cursor("grabbing");
    } else {
      this.change_cursor("grab");
    }

    init_drag = function (el, num) {
      this.be.bdrag.drag($(el.node), this, 'cell',
                         this.cell_drag_start,
                         this.cell_drag_move,
                         this.cell_drag_end);
      return true;
    }
    this.el_cell.forEach(init_drag, this);
  }
}


// Public members

Cell.prototype.change_cursor = function(cursor) {
  // Try various cursor possibilities from least preferred to most
  // preferred.  If the browser doesn't support one of the preferred
  // values, then it keeps the last value that worked.
  this.el_cell.attr({cursor: "default"});

  if ((cursor == "grab") || (cursor == "grabbing")){
    this.el_cell.attr({cursor: "-webkit-" + cursor});
    this.el_cell.attr({cursor: "-moz-" + cursor});
  }

  this.el_cell.attr({cursor: cursor});
};

Cell.prototype.update_quantity = function(n) {
  if (this.quantity === undefined){
    var text_height = 11;
    var attr = {
      "text-anchor": "middle",
      "font-family": "Verdana, Helvetica, Arial, sans-serif",
      //"font-family": "Courier New, Fixed, monospace",
      "font-size": text_height
    };
    this.qty_y = 0;
    this.el_qty_text = this.canvas.text(this.qty_cx, this.qty_y, "").attr(attr);
    this.el_qty_text.setAttr("pointer-events", "none");
    this.el_qty_text.transform("t" + this.x + "," + this.y);
    this.push_ns(this.el_qty_text);
  }

  var attr = {
    text: "x" + n,
    fill: n ? "#000" : "#aaa"
  };
  this.el_qty_text.attr(attr);
  var bbox = this.el_qty_text.getBBox(true);
  var desiredtop = this.qty_top;
  var actualtop = bbox.y;
  var drift_y = actualtop - desiredtop;
  this.qty_y -= drift_y;
  this.el_qty_text.attr({y: this.qty_y});

  // Since the quantity is only show with cbox, we don't have to worry
  // about interactions with pending_del.
  if (n && !this.quantity){
    this.el_s.attr({stroke: "#000"});
    this.change_cursor("grab");
  } else if (!n && this.quantity){
    this.el_s.attr({stroke: "#aaa"});
    this.change_cursor("not-allowed");
  }

  this.quantity = n;
};

Cell.prototype.propagate_value = function() {
  var calc_func_name = "calc_" + this.type;
  if (!this[calc_func_name]) return;
  var value = this[calc_func_name]();
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
  if (i === undefined) return undefined;
  var value = i;
  if (inv) value = 1-value;
  this.io.o.propagate_output(value);
};

Cell.prototype.calc_nand = function() { this.calc_and(true); };
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
  this.io.o.propagate_output(value);
};

Cell.prototype.calc_nor = function() { this.calc_or(true); };
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
  this.io.o.propagate_output(value);
};

Cell.prototype.calc_xnor = function() { this.calc_xor(true); };
Cell.prototype.calc_xor = function(inv) {
  var i0 = this.io.i0.value;
  var i1 = this.io.i1.value;
  var value;
  if ((i0 === undefined) || (i1 === undefined)){
    return undefined;
  }
  value = i0 ^ i1;
  if (inv) value = 1-value;
  this.io.o.propagate_output(value);
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
    var cx = left + (height*2/3/2);
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
  var value;
  if (e === 1){
    if (d === undefined){
      this.io['q'].propagate_output(undefined);
      this.io['~q'].propagate_output(undefined);
    } else {
      this.io['q'].propagate_output(d);
      this.io['~q'].propagate_output(1-d);
    }
  } else {
    // Don't propagate a value (leave the output unchanged)
    // if E is 0 or undefined.
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
};

Cell.prototype.cell_drag_start = function(x, y) {
  if (this.quantity === 0) return;

  this.dragging = true;

  this.old_drag_x = x;
  this.old_drag_y = y;

  this.change_cursor("grabbing");
  this.be.drag.disable_hover();

  // Pop cell to top for more natural dragging.
  this.bring_to_top();

  if ((this.canvas_type == "cbox") && (this.quantity !== undefined)){
    this.update_quantity(this.quantity - 1);
  }

  // Bring the drag div (and its associated canvas) to the top of the Z order.
  // This allows drawn elements to cross the scrollbar, and also prevents
  // mouse events from reaching the scrollbar.
  $(this.be.div_cdrag).css("z-index", "99")

  var cbox_y_offset = this.be.truth_height - this.be.cdraw_top;
  var view_left = this.be.canvas_cx - this.be.view_width/2/this.be.scale;
  var view_top = this.be.canvas_cy - this.be.view_height/2/this.be.scale;
  if (this.canvas == this.be.cdraw){
    var canvas_x = this.x;
    var canvas_y = this.y;
    this.cdraw_cell = this;
  } else {
    var canvas_x = this.be.circuit.cdraw_to_canvas_x(x);
    var canvas_y = this.be.circuit.cdraw_to_canvas_y(y);
    this.cdraw_cell = new Cell(this.be, "cdraw", this.type, canvas_x, canvas_y);
  }
  this.cdrag_cell = new Cell(this.be, "cdrag", this.type, canvas_x, canvas_y,
                             this.name);

  // Put the cdrag cell in a central location.
  // The resize/reflow code will fix its position as necessory.
  this.be.cdrag_cell = this.cdrag_cell;

  this.cdraw_cell.check_for_del(x, y, this.canvas == this.be.cbox);
  this.cdrag_cell.check_for_del(x, y, this.canvas == this.be.cbox);

  this.cdraw_cell.change_cursor("grabbing");
  this.cdrag_cell.change_cursor("grabbing");
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
      (x < this.be.cdraw_left) &&
      (y >= this.be.truth_height) &&
      (y < this.be.window_height)){
    // A new cell is still within the cell box
    // (or has been returned to the cell box.)
    del = "new";
  } else if ((x < this.be.cdraw_left) ||
             (y < this.be.cdraw_top) ||
             (x >= this.be.window_width) ||
             (y >= this.be.window_height) ||
             ((x < this.be.truth_width) && (y < this.be.truth_height))){
    del = "del";
  } else {
    del = false;
  }
  if (del != this.pending_del){
    var attr;
    if (del == "new"){
      attr = {
        stroke: "#aaa", // grey
        "stroke-dasharray": ""
      };
    } else if (del == "del"){
      attr = {
        stroke: "#e88", // red
        "stroke-dasharray": "-"
      };
    } else {
      attr = {
        stroke: "#000", // black
        "stroke-dasharray": ""
      };
    }
    this.el_s.attr(attr);

    for (var name in this.io) {
      if (del){
        this.io[name].mark_old("del");
      } else {
        this.io[name].restore_old();
      }
    }
    this.pending_del = del;

    if (this.canvas_type == "cdraw"){
      if (del){
        this.be.level.remove_cell(this);
      } else {
        this.be.level.add_cell(this);
      }
    }
  } else {
    for (var port_name in this.io) {
      this.io[port_name].redraw();
    }
  }
};

Cell.prototype.cell_drag_move = function(x, y) {
  if (!this.dragging) return;

  var screen_dx = x - this.old_drag_x;
  var screen_dy = y - this.old_drag_y;
  var canvas_dx = screen_dx / this.be.scale;
  var canvas_dy = screen_dy / this.be.scale;
  this.cdrag_cell.move(canvas_dx, canvas_dy);
  this.cdraw_cell.move(canvas_dx, canvas_dy);

  this.cdrag_cell.check_for_del(x, y, this.canvas == this.be.cbox);
  this.cdraw_cell.check_for_del(x, y, this.canvas == this.be.cbox);

  this.old_drag_x = x;
  this.old_drag_y = y;
};

Cell.prototype.cell_drag_end = function() {
  if (!this.dragging) return;

  if (this.quantity !== 0){
    this.change_cursor("grab");
  }
  this.cdraw_cell.change_cursor("grab");

  this.be.drag.enable_hover();

  $(this.be.div_cdrag).css("z-index", "-1")
  this.cdrag_cell.remove();
  this.be.cdrag_cell = undefined;

  if (this.cdraw_cell.pending_del){
    this.cdraw_cell.remove();

    // Increment the number of available cells of the deleted type.
    // If this cell was dragged from the box, it'd be simple to
    // increase its quantity.  But in case it was dragged from cdraw,
    // we have to search through cbox to find it.
    var box_cells = this.be.level.box_cells;
    for (var i = 0; i < box_cells.length; i++){
      var cell = box_cells[i];
      if (cell.type == this.type){
        if (cell.quantity !== undefined){
          cell.update_quantity(cell.quantity + 1);
        }
        break;
      }
    }
  }

  this.be.level.update_url();
  this.dragging = false;
};

Cell.prototype.remove = function() {
/*
  function remove_drag(el, num) {
    this.be.bdrag.undrag($(el.node));
    return true;
  }
  this.el_cell.forEach(remove_drag, this);
*/
  for (var name in this.io) {
    this.io[name].remove();
  }
  this.io = null;
  this.el_cell.remove();
};

Cell.prototype.clear = function() {
  for (var name in this.io) {
    this.io[name].clear();
  }
  this.el_cell.remove();
};

Cell.prototype.init_io = function(inv, no, ni, left, right) {
  var cw = this.be.stub_len;
  var cs = this.be.io_spacing;

  if (inv) right += this.be.inv_bubble_size;

  for (var i = 0; i < no; i++) {
    var y = ((i+0.5)*cs)-(no*cs/2);
    var io_obj = new Io(this.be, this.canvas, this,
                        (no > 1) ? "o" + i : "o", "output",
                        right+cw, y);
    this.io[io_obj.name] = io_obj;
  }

  if (no > 0){
    // Position the quantity text just below the last output stub.
    this.qty_cx = io_obj.x;
    this.qty_top = io_obj.y + this.be.stroke_wire_fg * 2;
  }

  for (var i = 0; i < ni; i++) {
    var y = ((i+0.5)*cs)-(ni*cs/2);
    var io_obj = new Io(this.be, this.canvas, this,
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
  this.push_ns(this.canvas.path(stub_path).attr(this.stub_bg_attr));

  // In contrast, the stub foregrounds can be drawn in different
  // colors depending on the IO state.  Therefore, each is its own
  // path, owned by the IO instance.  The cell does still get the
  // drawing elements, though, so that they can be added to the
  // set for translation.  (But the cell also keeps them separately
  // to avoid changing their Z level.)
  for (var name in this.io) {
    this.push_s(this.io[name].draw_stub_fg());
  }
};

Cell.prototype.draw_inv = function(inv, right, bg, y) {
  if (inv){
    var inv_r = this.be.inv_bubble_size/2;
    var inv_cx = right+inv_r;
    var sw = bg ? 9 : 3;
    var sc = bg ? "#eee" : "#000";
    var attr = bg ? this.cell_bg_attr : this.cell_fg_attr;
    var el = bg ? this.el_ns : this.el_s;
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
  var box_width = height-r;
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
                        left - this.be.stub_len, -this.be.io_spacing);
  this.io['e'] = new Io(this.be, this.canvas, this, 'e', 'input',
                        left - this.be.stub_len, 0);

  this.io['q'] = new Io(this.be, this.canvas, this, 'q', 'input',
                        right + this.be.stub_len, -this.be.io_spacing);
  this.io['~q'] = new Io(this.be, this.canvas, this, '~q', 'input',
                         right + this.be.inv_bubble_size + this.be.stub_len,
                         this.be.io_spacing);

    this.qty_cx = this.io['~q'].x;
    this.qty_top = this.io['~q'].y + this.be.stroke_wire_fg * 2;


  this.push_ns(this.canvas.rect(left, top, width, height).attr(this.cell_bg_attr));
  this.draw_inv(true, right, true, this.be.io_spacing);
  this.draw_stubs();
  this.push_s(this.canvas.rect(left, top, width, height).attr(this.cell_fg_attr));
  this.draw_inv(true, right, false, this.be.io_spacing);

  var attr = {
    "stroke-width": 0,
    fill: "#000",
    'text-anchor': 'start'
  };
  left += this.be.stroke_cell_fg;
  this.push_s(this.canvas.text(left, -this.be.io_spacing, "D").attr(attr));
  this.push_s(this.canvas.text(left, 0, "E").attr(attr));

  attr['text-anchor'] = 'end';
  right -= this.be.stroke_cell_fg;
  this.push_s(this.canvas.text(right, -this.be.io_spacing, "Q").attr(attr));
  this.push_s(this.canvas.text(right, this.be.io_spacing, "~Q").attr(attr));
};

Cell.prototype.init_null = function() {
  // A "null" port is used as the connection point for wires
  // currently being dragged.
  $('#info').append('<br>init_null');
  var io_obj = new Io(this.be, this.canvas, this, "null", "null", 0, 0);
  $('#info').append('<br>new io done');
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
  this.el_cell.push(el);
};
Cell.prototype.push_ns = function(el) {
  this.el_ns.push(el);
  this.el_cell.push(el);
};
