// Copyright 2016 Chris Nelson - All rights reserved.

'use strict';

function Wire(be, io1, io2, pending_new, locked) {
  this.be = be;

  // When the user drags out new wires, he could be dragging in either
  // direction, so we reverse the ports as appropriate.  Note that the
  // null_cell has port type "null", so we have to look at the other
  // port to tell the desired direction.
  if ((io1.type == 'output') || (io2.type == 'input')) {
    this.o = io1;
    this.i = io2;
  } else {
    this.o = io2;
    this.i = io1;
  }

  this.compute();

  var attr = {
    'stroke-width': this.be.stroke_wire_bg,
    stroke: '#eee'
  };
  this.el_bg = this.be.cdraw.path(this.path).attr(attr);

  var attr = {
    'stroke-width': this.be.stroke_wire_fg,
    stroke: Wire.color(undefined)
  };
  this.el_fg = this.be.cdraw.path(this.path).attr(attr);

  this.el_bg.setAttr('pointer-events', 'none');
  this.el_fg.setAttr('pointer-events', 'none');

  this.el_bg.insertBefore(this.be.z_wire);
  this.el_fg.insertBefore(this.be.z_wire);

  this.locked = locked;

  this.o.connect(this);
  this.i.connect(this);

  this.pending_new = pending_new;
  if (pending_new) {
    var attr = {stroke: '#eeb'};
    this.el_bg.attr(attr);
  }

  this.pending_del = false;
  this.newest_value = null;
  this.in_flight = [];

  // this.measure_perf('not segmented');
}


// Functions not associated with an object

Wire.color = function(value, width) {
  if (value === undefined) {
    return '#888';
  } else {
    var max = (1 << width) - 1;
    var r = 0;
    var g = value / max * 204;
    var b = (max - value) / max * 255;
    return Raphael.rgb(r, g, b);
  }
};


// Public members

Wire.prototype.measure_perf = function(name) {
  if (!this.measured) this.measured = {};
  if (this.measured[name]) return;
  this.measured[name] = true;

  var n0 = performance.now();
  for (var i = 0; i < 1000; i++) {
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
  this.remove_sparks();

  if (!this.pending_new && !removed_by_input_port) {
    // Update the attached cell input with the fact that it's
    // disconnected.  If the attached cell is also being deleted, or
    // if the cell input wasn't using the (pending new) wire value,
    // then nothing is needed.  But if the wire value could (now or in
    // the past) have influenced the test pin values, then all test
    // results must be reset, and the current test sequence must be
    // restarted.
    this.i.propagate_input(undefined);
    this.be.level.circuit_changed();
  }

  // In case the wire is disconnected while a value change is pending,
  // we mark it as dead, which causes any tick to be ignored.
  this.dead = true;
};

Wire.prototype.mark_old = function(type) {
  this.pending_del = type;
  if (type == 'del') {
    this.remove_subpaths();
  }
  this.redraw_fg();
}

Wire.prototype.restore_old = function() {
  this.pending_del = false;
  this.el_fg.attr({'stroke-dasharray': ''});
  this.redraw_fg();
}

Wire.prototype.propagate_value = function() {
  // If there is a previous value being held (because it was
  // propagated from the IO in this same tick, and the IO value hasn't
  // changed (because a new wire caused it to re-propagate), don't do
  // anything.
  //
  // Otherwise, if there is a previous value being held, discard it
  // first, then get the new value if it is needed.
  if (this.in_flight.length) {
    var fl_obj = this.in_flight[this.in_flight.length-1];
    if (fl_obj.held) {
      if (fl_obj.value === this.o.value) return;

      if (fl_obj.el_subpath) fl_obj.el_subpath.remove();
      if (fl_obj.el_spark) fl_obj.el_spark.remove();
      this.in_flight.splice(-1, 1);
    }
  }

  if (this.in_flight.length) {
    // Don't propagate the newest value if it is the same as the most
    // recent value in flight.
    var fl_obj = this.in_flight[this.in_flight.length-1];
    if (this.o.value === fl_obj.value) return;
  } else {
    // No values are in flight, so don't propagate the newest value
    // if it is the same as the value at the wire's output end.
    if (this.o.value === this.i.value) return;
  }

  var fl_obj = {
    value: this.o.value,
    age: 0,
    held: true
  };
  this.in_flight.push(fl_obj);
  this.draw_spark(fl_obj);
};

Wire.prototype.release_value = function() {
  // Ignore the call if there is no held value.
  if (!this.in_flight.length || !this.in_flight[this.in_flight.length-1].held) {
    return;
  }

  this.in_flight[this.in_flight.length-1].held = false;

  // If there are already other values in flight on the wire, then
  // it is already registered for a tick.  But if the held value is
  // the only value in flight, then we have to register the wire to
  // get the next tick.
  if (this.in_flight.length == 1) {
    this.be.sim.register_obj(this, false);
  }
};

Wire.prototype.reset = function(i_was_undefined) {
  // As a performance optimization, we avoid expensive reset
  // operations if the wire is already in a reset state.  We know that
  // the input port is undefined now (since it was just reset), but we
  // need to check whether it was *previously* undefined.
  if (i_was_undefined && !this.in_flight.length) return;

  this.remove_subpaths();
  this.remove_sparks();
  this.in_flight = [];
  this.redraw_fg();
};

Wire.prototype.tick = function(speed) {
  // The wire could have been removed while we waited for the tick.
  // We still get the tick, but we don't do anything with it, and
  // we don't trigger any more ticks.
  if (this.dead) return;

  for (var i = 0; i < this.in_flight.length; i++) {
    var fl_obj = this.in_flight[i];

    // A 'held' value is stuck at age 0 until released.
    if (fl_obj.held) continue;

    fl_obj.age += this.be.wire_speed * speed / this.path_length;
    if (fl_obj.age >= 1.0) {
      if (fl_obj.el_subpath) fl_obj.el_subpath.remove();
      if (fl_obj.el_spark) fl_obj.el_spark.remove();
      var value = fl_obj.value;
      if ((this.o.cell.output_width == 1) && (value == 1)) {
        value *= ((1 << this.i.cell.input_width) - 1);
      }
      this.i.propagate_input(value);
      this.in_flight.splice(0, 1); // remove the first (oldest)
      i--;
    }
  }

  this.redraw_fg();
  //this.measure_perf('segmented');

  if (this.in_flight.length && !this.in_flight[0].held) {
    // There is still data in flight (that isn't being held), so
    // register the wire to tick again.
    this.be.sim.register_obj(this, false);
  }
};

Wire.prototype.reorder_z = function(ref_bg, ref_fg) {
  this.el_bg.insertBefore(ref_bg);
  this.el_fg.insertBefore(ref_fg);
  for (var i = this.in_flight.length-1; i >= 0 ; i--) {
    if (this.in_flight[i].el_subpath) {
      this.in_flight[i].el_subpath.insertBefore(ref_fg);
    }
  }
};


// Private functions and members

Wire.prototype.get_point = function(z) {
  var aw = this.aw;
  var len_aa = aw.angle_a * aw.r;
  var len_b = len_aa + aw.seg_len;

  var xd, yd;
  if (z < len_aa) {
    var x1 = this.o.cell.x + this.o.x;
    var y1 = this.o.cell.y + this.o.y;
    var angle = z / aw.r;
    var sign_ya = aw.cwa ? 1 : -1;
    xd = aw.r*Math.sin(angle);
    yd = aw.r*(1-Math.cos(angle)) * sign_ya;
    return [x1+xd, y1+yd];
  } else if (z < len_b) {
    var d = z - len_aa;
    xd = (aw.xb-aw.xa) * (d / aw.seg_len);
    yd = (aw.yb-aw.ya) * (d / aw.seg_len);
    return [aw.xa+xd, aw.ya+yd];
  } else {
    var x2 = this.i.cell.x + this.i.x;
    var y2 = this.i.cell.y + this.i.y;
    var angle = (this.path_length - z) / aw.r;
    var sign_yb = aw.cwb ? 1 : -1;
    xd = -aw.r*Math.sin(angle);
    yd = aw.r*(1-Math.cos(angle)) * sign_yb;
    return [x2+xd, y2+yd];
  }
};

// Raphael's (and thus presumably the browser's) getSubpath function
// is slow and estimates the subpath using cubic Bezier segments.
// This is understandable for a general case path, but our path is so
// simple that we can do much better.  This function is measured to be
// at least twice as fast as the built-in function.
Wire.prototype.get_subpath = function(z1, z2) {
  var aw = this.aw;
  var len_aa = aw.angle_a * aw.r;
  var len_b = len_aa + aw.seg_len;

  var seg1 =
    (z1 < len_aa) ? 0 :
    (z1 < len_b)  ? 1 :
    2;
  var seg2 =
    (z2 < len_aa) ? 0 :
    (z2 < len_b)  ? 1 :
    2;
  var la, lb;

  var path = ['M'].concat(this.get_point(z1));
  if (seg1 == 0) {
    if (seg2 == 0) {
      // seg1 == 0, seg2 == 0
      la = ((z2-z1)/aw.r > Math.PI) ? 1 : 0;
      path = path.concat('A', aw.r, aw.r, 0, la, aw.cwa,
                         this.get_point(z2));
    } else {
      // seg1 == 0, seg2 > 0
      la = ((len_aa-z1)/aw.r > Math.PI) ? 1 : 0;
      path = path.concat('A', aw.r, aw.r, 0, la, aw.cwa,
                         aw.xa, aw.ya);
      if (seg2 == 1) {
        path = path.concat('L', this.get_point(z2));
      } else {
        lb = ((z2-len_b)/aw.r > Math.PI) ? 1 : 0;
        path = path.concat('L', aw.xb, aw.yb,
                           'A', aw.r, aw.r, 0, lb, aw.cwb,
                           this.get_point(z2));
      }
    }
  } else if (seg1 == 1) {
    if (seg2 == 1) {
      path = path.concat('L', this.get_point(z2));
    } else {
      lb = ((z2-len_b)/aw.r > Math.PI) ? 1 : 0;
      path = path.concat('L', aw.xb, aw.yb,
                         'A', aw.r, aw.r, 0, lb, aw.cwb,
                         this.get_point(z2));
    }
  } else {
    // seg1 == 2
    lb = ((z2-z1)/aw.r > Math.PI) ? 1 : 0;
    path = path.concat('A', aw.r, aw.r, 0, lb, aw.cwb,
                       this.get_point(z2));
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

    if (dx*dx+dy*dy < 4) {
      // For wires shorter than 2r, reduce the radius proportionally.
      // This makes dragging out a new wire look smoother.
      r *= Math.sqrt(dx*dx+dy*dy)/2;
    }

    var xy = dx/dy;
    if (dy >= 0) {
      /* 0 < dy < 4 */
      //      ,-.
      //     /   )
      //    /  -'
      //   (
      //    `-
      la = 1;
      lb = 0;
      slope = Math.sqrt(xy*xy+1)-xy; /* slope < 0 */
      if (dy == 0) {
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
  this.path = ['M', x1, y1,
               'A', r, r, 0, la, cwa, xa, ya,
               'L', xb, yb,
               'A', r, r, 0, lb, cwb, x2, y2];

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

Wire.prototype.draw_spark = function(fl_obj) {
  if (!fl_obj.el_spark && fl_obj.held) {
    // Don't create a new spark directly at the output port if there
    // is already a spark on another wire there.
    //
    // It would be nice to also avoid duplicate sparks at the same
    // position along the initial arc, but (a) floating point errors,
    // (b) wire tick order, and (c) moving wires.
    for (var i = 0; i < this.o.w.length; i++) {
      var cmp_in_flight = this.o.w[i].in_flight;
      if (cmp_in_flight.length) {
        var cmp_obj = cmp_in_flight[cmp_in_flight.length-1];
        if (cmp_obj.el_spark && cmp_obj.held) return;
      }
    }
  }

  if (!fl_obj.el_spark || (fl_obj.age !== fl_obj.spark_age)) {
    // Radius range for outer points.
    var max_r1 = this.be.io_handle_size / 2;
    var min_r1 = max_r1/2;

    // Radius range for inner points.
    var max_r0 = max_r1/3;
    var min_r0 = max_r1/5;

    // Number of points (total of inner & outer points).
    var npoints = this.be.level.rnd(5, 10) * 2;

    // Starting angle (a random rotation).
    var angle0 = Math.random() * Math.PI * 2;

    var path = [];
    for (var i = 0; i < npoints; i++) {
      var angle = angle0 + (Math.PI * 2) / npoints * i;

      // Add a random jitter up to half the angle to the next point.
      angle += Math.random() * Math.PI / npoints;

      var max_r = (i & 1) ? max_r1 : max_r0;
      var min_r = (i & 1) ? min_r1 : min_r0;
      var r = Math.random() * (max_r - min_r) + min_r;

      var x = Math.cos(angle) * r;
      var y = Math.sin(angle) * r;
      path.push((i == 0) ? 'M' : 'L');
      path.push(x, y);
    }
    path.push('z');

    if (fl_obj.el_spark) {
      fl_obj.el_spark.attr({path: path});
    } else {
      var el_top = this.el_fg;
      for (i = 0; i < this.in_flight.length; i++) {
        var iter_obj = this.in_flight[i];
        if (iter_obj.el_subpath) el_top = iter_obj.el_subpath;
        if (iter_obj.el_spark) el_top = iter_obj.el_spark;
      }

      var attr = {
        'stroke-width': this.be.stroke_io_handle,
        stroke: '#f80',
        fill: '#ff0',
        opacity: '0.80'
      };
      fl_obj.el_spark = this.be.cdraw.path(path).attr(attr);
      fl_obj.el_spark.setAttr('pointer-events', 'none');
      fl_obj.el_spark.insertAfter(el_top);
    }

    fl_obj.spark_age = fl_obj.age;
  }

  var age_len = fl_obj.age * this.path_length;
  var cxy = this.get_point(age_len);
  var cx = cxy[0];
  var cy = cxy[1];
  fl_obj.el_spark.transform('t' + cx + ',' + cy);
};

Wire.prototype.redraw_fg = function() {
  for (var i = 0; i < this.in_flight.length; i++) {
    var fl_obj = this.in_flight[i];
    this.draw_spark(fl_obj);
  }

  if (this.pending_del == 'del') {
    var attr = {
      path: this.path,
      stroke: '#e88', // red
      'stroke-dasharray': '-',
      opacity: '1.0'
    };
    this.el_fg.attr(attr);
    return;
  }

  var older_value = this.i.value;

  // If the value was multiplied up from 1 bit to the input port's
  // width, then we need to compress it back down to 1 bit here.
  if ((this.o.cell.output_width == 1) && (older_value > 1)) older_value = 1;

  var older_el_subpath = this.el_fg;
  var older_age_len = this.path_length;

  for (var i = 0; i < this.in_flight.length; i++) {
    var fl_obj = this.in_flight[i];
    var age_len = fl_obj.age * this.path_length;
    var path = this.get_subpath(age_len, older_age_len);
    var color = Wire.color(older_value, this.o.cell.output_width);
    older_el_subpath.attr({path: path,
                           stroke: color});

    if (!fl_obj.el_subpath) {
      // Draw a path placeholder of the appropriate color.
      // The actual path will be inserted at the next loop
      // iteration or the end of the loop.
      var attr = {
        'stroke-width': this.be.stroke_wire_fg
      };
      fl_obj.el_subpath = this.be.cdraw.path('M0,0').attr(attr);
      fl_obj.el_subpath.insertAfter(older_el_subpath);
      fl_obj.el_subpath.setAttr('pointer-events', 'none');
    }
    older_value = fl_obj.value;
    older_el_subpath = fl_obj.el_subpath;
    older_age_len = age_len;
  }

  if (older_age_len == 0) {
    // The newest value in flight has age 0, so there's no point in
    // drawing the last (0-length) subpath.
    return;
  }

  var path;
  if (older_age_len >= this.path_length) {
    // This only happens if there are no values in flight.
    path = this.path;
  } else {
    path = this.get_subpath(0, older_age_len);
  }
  var attr = {
    path: path,
    stroke: Wire.color(older_value, this.o.cell.output_width),
    'stroke-dasharray': '',
    opacity: (this.pending_del == 'null') ? '0.4' : '1.0'
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
  for (var i = 0; i < this.in_flight.length; i++) {
    var fl_obj = this.in_flight[i];
    if (fl_obj.el_subpath) {
      fl_obj.el_subpath.remove();
      fl_obj.el_subpath = undefined;
    }
  }
}

Wire.prototype.remove_sparks = function() {
  // Remove all propagating sparks.
  for (var i = 0; i < this.in_flight.length; i++) {
    var fl_obj = this.in_flight[i];
    if (fl_obj.el_spark) {
      fl_obj.el_spark.remove();
      fl_obj.el_spark = undefined;
    }
  }
}
