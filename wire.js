// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Wire(be, io1, io2, pending_new, locked) {
  this.be = be;

  // When the user drags out new wires, he could be dragging in either
  // direction, so we reverse the ports as appropriate.  Note that the
  // null_cell has port type "null", so we have to look at the other
  // port to tell the desired direction.
  if ((io1.type == "output") || (io2.type == "input")){
    this.o = io1;
    this.i = io2;
  } else {
    this.o = io2;
    this.i = io1;
  }

  this.compute();

  var attr = {
    "stroke-width": this.be.stroke_wire_bg,
    stroke: "#eee"
  };
  this.el_bg = this.be.cdraw.path(this.path).attr(attr);

  var attr = {
    "stroke-width": this.be.stroke_wire_fg,
    stroke: Wire.color(undefined)
  };
  this.el_fg = this.be.cdraw.path(this.path).attr(attr);

  this.el_bg.setAttr("pointer-events", "none");
  this.el_fg.setAttr("pointer-events", "none");

  // Insert the new wire just above the null gate so that it is below
  // IO handles.  This is its default position, but its Z order may be
  // changed by o.connect().
  this.el_bg.insertBefore(this.be.z_wire);
  this.el_fg.insertBefore(this.be.z_wire);

  this.locked = locked;

  this.o.connect(this);
  this.i.connect(this);

  this.pending_new = pending_new;
  if (pending_new){
    var attr = {stroke: "#eeb"};
    this.el_bg.attr(attr);
  }

  this.pending_del = false;
  this.newest_value = null;
  this.in_flight = [];

  // this.measure_perf("not segmented");
}


// Functions not associated with an object

Wire.color = function(value) {
  if (value === undefined) {
    return "#888";
  } else if (value === 0){
    return "#00f";
  } else if (value === 1) {
    return "#0c0";
  }
};


// Public members

Wire.prototype.measure_perf = function(name) {
  if (!this.measured) this.measured = {};
  if (this.measured[name]) return;
  this.measured[name] = true;

  var n0 = performance.now();
  for (var i = 0; i < 1000; i++){
    this.redraw_fg();
  }
  var n1 = performance.now();
  return n1-n0;
};

Wire.prototype.remove = function(removed_by_input_port) {
  this.o.disconnect(this);
  this.i.disconnect(this);

  this.el_fg.remove();
  this.el_bg.remove();
  this.remove_subpaths();

  if (!this.pending_new && !removed_by_input_port){
    // Update the attached cell input with the fact that it's
    // disconnected.  If that changes the value, then the circuit has
    // changed in a fundamental way, and the check results must be
    // updated accordingly.
    this.i.propagate_input(undefined);
    this.be.level.circuit_changed();
  }

  // In case the wire is disconnected while a value change is pending,
  // we mark it as dead, which causes any tick to be ignored.
  this.dead = true;
};

Wire.prototype.mark_old = function(type) {
  this.pending_del = type;
  if (type == "del"){
    this.remove_subpaths();
  }
  this.redraw_fg();
}

Wire.prototype.restore_old = function() {
  this.pending_del = false;
  this.redraw_fg();
}

Wire.prototype.propagate_value = function() {
  // Don't propagate values across pending (uncommitted) new wires.
  // This also prevents propagating to the null cell.
  if (this.pending_new) return;


  // The output IO always propagates its value first in the tick,
  // before any wires have updated.  If any values are in flight, then
  // the wire must already be registered to receive an update in this
  // tick.  We avoid duplicating the registration, and we record that
  // the newest value should not advance in age in this tick.
  if (this.in_flight.length){
    // The output IO is guaranteed to propagate no more than one value
    // per tick, so we can record the value in a simple variable.
    // The value is put into the in-flight queue later in the tick,
    // so it is safe from being overwritten in later ticks.
    this.newest_value = this.o.value;
  } else {
    // This wire isn't registered yet, so we register it in order to
    // propagate the new value.  We also put the new value in the
    // in-flight queue.  This indicates that it is OK to advance its
    // age when the wire eventually ticks.  It also keeps the value
    // safe from being overwritten in case the output port propagates
    // a new value in the next tick before the wire can tick.
    this.be.sim.register_obj(this, false);
    var fl_obj = {
      age: 0,
      value: this.o.value
    };
    this.in_flight.push(fl_obj);
  }
};

Wire.prototype.reset = function() {
  this.newest_value = null;
  this.remove_subpaths();
  this.in_flight = [];
  this.redraw_fg();
};

Wire.prototype.tick = function(speed) {
  // The wire could have been removed while we waited for the tick.
  // We still get the tick, but we don't do anything with it, and
  // we don't trigger any more ticks.
  if (this.dead) return;

  if (this.in_flight.length) {
    // Don't propagate the newest value if it is the same as the most
    // recent value in flight.
    var fl_obj = this.in_flight[this.in_flight.length-1];
    if (this.newest_value === fl_obj.value) this.newest_value = null;
  } else {
    // No values are in flight, so don't propagate the newest value
    // if it is the same as the value at the wire's output end.
    if (this.newest_value === this.i.value) this.newest_value = null;
  }

  for (var i = 0; i < this.in_flight.length; i++){
    var fl_obj = this.in_flight[i];
    fl_obj.age += this.be.wire_speed * speed / this.path_length;
    if (fl_obj.age >= 1.0){
      if (fl_obj.el_subpath) fl_obj.el_subpath.remove();
      this.i.propagate_input(fl_obj.value);
      this.in_flight.splice(0, 1); // remove the first (oldest)
      i--;
    }
  }

  this.redraw_fg();
  //this.measure_perf("segmented");

  // Only after everything in the in-flight queue has advanced in age
  // can we put the newest_value (propagated from the output port
  // earlier in this tick) into the queue.
  if (this.newest_value !== null){
    var fl_obj = {
      age: 0,
      value: this.newest_value
    };
    this.in_flight.push(fl_obj);
    this.newest_value = null;
  }

  if (this.in_flight.length){
    // There is still data in flight, so register the wire to tick
    // again.
    this.be.sim.register_obj(this, false);
  }
};

Wire.prototype.reorder_z = function(ref_bg, ref_fg) {
  this.el_bg.insertBefore(ref_bg);
  this.el_fg.insertBefore(ref_fg);
  for (var i = this.in_flight.length-1; i >= 0 ; i--){
    if (this.in_flight[i].el_subpath){
      this.in_flight[i].el_subpath.insertBefore(ref_fg);
    }
  }
};


// Private functions and members

Wire.prototype.get_subpath = function(z1, z2) {
  // Raphael's (and thus presumably the browser's) getSubpath function
  // is slow and estimates the subpath using cubic Bezier segments.
  // This is understandable for a general case path, but our path is
  // so simple that we can do much better.
  var x1 = this.o.cell.x + this.o.x;
  var y1 = this.o.cell.y + this.o.y;
  var x2 = this.i.cell.x + this.i.x;
  var y2 = this.i.cell.y + this.i.y;

  var aw = this.aw;
  var len_aa = aw.angle_a * aw.r;
  var len_b = len_aa + aw.seg_len;
  var path_length = this.path_length;

  function get_point(z) {
    var xd, yd;
    if (z < len_aa){
      var angle = z / aw.r;
      var sign_ya = aw.cwa ? 1 : -1;
      xd = aw.r*Math.sin(angle);
      yd = aw.r*(1-Math.cos(angle)) * sign_ya;
      return [x1+xd, y1+yd];
    } else if (z < len_b){
      var d = z - len_aa;
      xd = (aw.xb-aw.xa) * (d / aw.seg_len);
      yd = (aw.yb-aw.ya) * (d / aw.seg_len);
      return [aw.xa+xd, aw.ya+yd];
    } else {
      var angle = (path_length - z) / aw.r;
      var sign_yb = aw.cwb ? 1 : -1;
      xd = -aw.r*Math.sin(angle);
      yd = aw.r*(1-Math.cos(angle)) * sign_yb;
      return [x2+xd, y2+yd];
    }
  }

  var seg1 =
    (z1 < len_aa) ? 0 :
    (z1 < len_b)  ? 1 :
    2;
  var seg2 =
    (z2 < len_aa) ? 0 :
    (z2 < len_b)  ? 1 :
    2;
  var la, lb;

  var path = ["M"].concat(get_point(z1));
  if (seg1 == 0){
    if (seg2 == 0){
      // seg1 == 0, seg2 == 0
      la = ((z2-z1)/aw.r > Math.PI) ? 1 : 0;
      path = path.concat("A", aw.r, aw.r, 0, la, aw.cwa,
                         get_point(z2));
    } else {
      // seg1 == 0, seg2 > 0
      la = ((len_aa-z1)/aw.r > Math.PI) ? 1 : 0;
      path = path.concat("A", aw.r, aw.r, 0, la, aw.cwa,
                         aw.xa, aw.ya);
      if (seg2 == 1){
        path = path.concat("L", get_point(z2));
      } else {
        lb = ((z2-len_b)/aw.r > Math.PI) ? 1 : 0;
        path = path.concat("L", aw.xb, aw.yb,
                           "A", aw.r, aw.r, 0, lb, aw.cwb,
                           get_point(z2));
      }
    }
  } else if (seg1 == 1){
    if (seg2 == 1){
      path = path.concat("L", get_point(z2));
    } else {
      lb = ((z2-len_b)/aw.r > Math.PI) ? 1 : 0;
      path = path.concat("L", aw.xb, aw.yb,
                         "A", aw.r, aw.r, 0, lb, aw.cwb,
                         get_point(z2));
    }
  } else {
    // seg1 == 2
    lb = ((z2-z1)/aw.r > Math.PI) ? 1 : 0;
    path = path.concat("A", aw.r, aw.r, 0, lb, aw.cwb,
                       get_point(z2));
  }

  return path;
};

Wire.prototype.arcwire = function (x1, y1, xc, yc) {
  var x2 = x1+xc;
  var y2 = y1+yc;
  var r = this.be.wire_arc_radius;
  var dx = (x2-x1)/r;
  var dy = (y2-y1)/r;
  var slope, angle, angle_a, angle_b;
  var xd, yd, xa, ya, xb, yb, cwa, cwb, la, lb;

  if ((dx > 0) || (dy >= 4) || (dy <= -4)) {
    var sign_y;
    if (dy >= 0) {
      sign_y = 1;
      cwa = 1;
      cwb = 0;
    } else {
      sign_y = -1;
      cwa = 0;
      cwb = 1;
      dy = -dy;
    }

    la = 0;
    lb = 0;

    if ((dx > 0) && (dy == 4)) {
      /* Slope with straight (angled) line, special case.
         The normal equation divides 0 by 0 at exactly dy=4,
         so here we take a short-cut to the correct value. */
      //   -.
      //     \
      //      `-
      slope = 2/dx;
      angle = 2*Math.atan(slope);
    } else if ((dx <= 0) && (dy == 4)) {
      /* Arcs connected with straight (horizontal) line to the left.
         The normal equation gets the wrong sign from atan,
         so here we take a short-cut to the correct value. */
      //      -.
      //        )
      //   .---'
      //  (
      //   `-
      angle = Math.PI;
    } else if ((dx > 2) || (dx*dx+(dy-4)*dy > 0)) {
      /* Normal case: straight line connects arcs with +/-slope. */
      // This meets the constraint if:
      //   x is large
      //   y is small relative to x, so there is room for a positive slope
      //   y is large relative to (2-x), so there is room for a negative slope
      //   -.   -.   -._  ---
      //     )    |
      //    /     |
      //   (      `-
      //    `-
      slope = (Math.sqrt(dx*dx+(dy-4)*dy)-dx)/(dy-4);
      angle = 2*Math.atan(slope);
    } else { // 0 < dx <= 2, sqrt < dy < sqrt
      /* Reduced radius, no straight line */
      //   -.
      //    `-
      slope = dy/dx;
      angle = 2*Math.atan(slope);
      r = r * dx * (slope*slope + 1) / (4 * slope);
    }

    xd = r*Math.sin(angle);
    yd = r*(1-Math.cos(angle)) * sign_y;
    xb = x2-xd;
    yb = y2-yd;

    angle_a = angle_b = angle;
  } else {
    /* backwards and close; requires reverse swivel */
    cwa = 0;
    cwb = 0;

    if (dx*dx+dy*dy < 4){
      // For wires shorter than 2r, reduce the radius proportionally.
      // This makes dragging out a new wire look smoother.
      r *= Math.sqrt(dx*dx+dy*dy)/2;
    }

    var xy = dx/dy;
    if (dy >= 0){
      /* 0 < dy < 4 */
      //      ,-.
      //     /   )
      //    /  -'
      //   (
      //    `-
      la = 1;
      lb = 0;
      slope = Math.sqrt(xy*xy+1)-xy; /* slope < 0 */
      if (dy == 0){
        /* xy == Infinity, so the slope value is poorly defined. */
        angle = Math.PI;
      } else {
        angle = 2*Math.atan(slope); /* 180 < angle < 270 */
      }
      angle_a = Math.PI*2 - angle;
      angle_b = angle;
    } else {
      /* -4 < dy < 0 */
      //    ,-.
      //   (   \
      //    `-  \
      //         )
      //       -'
      la = 0;
      lb = 1;
      slope = Math.sqrt(xy*xy+1)+xy; /* slope > 0 */
      angle = -2*Math.atan(slope); /* 90 < angle < 180 */
      angle_a = -angle;
      angle_b = Math.PI*2 - angle_a;
    }

    xd = -r*Math.sin(angle);     /* xd <= 0 */
    yd = -r*(1-Math.cos(angle));
    xb = x2+xd;                  /* xb < x2 */
    yb = y2+yd;
  }

  xa = x1+xd;
  ya = y1+yd;
  this.path = ["M", x1, y1,
               "A", r, r, 0, la, cwa, xa, ya,
               "L", xb, yb,
               "A", r, r, 0, lb, cwb, x2, y2];

  var seg_len = Math.sqrt((xb-xa)*(xb-xa)+(yb-ya)*(yb-ya))
  this.path_length = angle_a * r + seg_len + angle_b * r;

  this.aw = {
    r: r,
    angle_a: angle_a,
    cwa: cwa,
    la: la,
    xa: xa,
    ya: ya,
    seg_len: seg_len,
    xb: xb,
    yb: yb,
    angle_b: angle_b,
    cwb: cwb,
    lb: lb
  };
};

Wire.prototype.compute = function() {
  var x1 = this.o.cell.x + this.o.x;
  var y1 = this.o.cell.y + this.o.y;
  var x2 = this.i.cell.x + this.i.x;
  var y2 = this.i.cell.y + this.i.y;
  this.arcwire(x1, y1, x2-x1, y2-y1);
};

Wire.prototype.redraw_fg = function() {
  if (this.pending_del == "del"){
    var attr = {
      path: this.path,
      stroke: "#e88", // red
      "stroke-dasharray": "-",
      opacity: "1.0"
    };
    this.el_fg.attr(attr);
    return;
  }

  var older_value = this.i.value;
  var older_el_subpath = this.el_fg;
  var older_age_len = this.path_length;

  for (var i = 0; i < this.in_flight.length; i++){
    var fl_obj = this.in_flight[i];
    var age_len = fl_obj.age * this.path_length;
    var path = this.get_subpath(age_len, older_age_len);
    older_el_subpath.attr({path: path,
                           stroke: Wire.color(older_value)});

    if (!fl_obj.el_subpath){
      // Draw a path placeholder of the appropriate color.
      // The actual path will be inserted at the next loop
      // iteration or the end of the loop.
      var attr = {
        "stroke-width": this.be.stroke_wire_fg
      };
      fl_obj.el_subpath = this.be.cdraw.path("M0,0").attr(attr);
      fl_obj.el_subpath.insertAfter(older_el_subpath);
    }

    older_value = fl_obj.value;
    older_el_subpath = fl_obj.el_subpath;
    older_age_len = age_len;
  }

  if (older_age_len == 0){
    // The newest value in flight has age 0, so there's no point in
    // drawing the last (0-length) subpath.
    return;
  }

  var path;
  if (older_age_len >= this.path_length){
    // This only happens if there are no values in flight.
    path = this.path;
  } else {
    path = this.get_subpath(0, older_age_len);
  }
  var attr = {
    path: path,
    stroke: Wire.color(older_value),
    "stroke-dasharray": "",
    opacity: (this.pending_del == "null") ? "0.4" : "1.0"
  };
  older_el_subpath.attr(attr);
};

Wire.prototype.redraw = function() {
  this.compute();
  this.el_bg.attr({path: this.path});
  this.el_fg.attr({path: this.path});
  this.redraw_fg();
};

Wire.prototype.remove_subpaths = function() {
  // Remove all propagating subpaths.
  for (var i = 0; i < this.in_flight.length; i++){
    var fl_obj = this.in_flight[i];
    if (fl_obj.el_subpath){
      fl_obj.el_subpath.remove();
      fl_obj.el_subpath = undefined;
    }
  }
}
