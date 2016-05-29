// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Circuit() {
  ExtendRaphael();

  // this.be is a data structure for "global" values for the whole circuit.
  this.be = {}
  this.be.circuit = this;
  this.be.bdrag = new Bdrag(this.be);

  this.be.cdrag = Raphael("cdrag", "100%", "100%");
  this.be.cbox = Raphael("cbox", "100%", "100%");
  this.be.cdraw = Raphael("cdraw", "100%", "100%");

  // An inline SVG sits on the baseline, so if it is 100% of the div
  // height, then the space left for descenders will cause a vertical
  // scrollbar to appear.  Setting display: block instead of inline
  // prevents that.
  $("#cbox svg").attr({"display": "block"});

  this.be.window = $(window);
  this.be.div_truth = $("#truth");
  this.be.div_top = $("#top");
  this.be.div_info = $("#info");
  this.be.div_infotxt = $("#infotxt");
  this.be.div_cdrag = $("#cdrag");
  this.be.div_cdraw = $("#cdraw");
  this.be.div_cbox_container = $("#cbox_container");
  this.be.div_cbox = $("#cbox");

  //this.be.div_cbox.width("6.4em");
  //this.be.div_truth.css({"font-size": "80%"});
  //this.be.div_info.css({"font-size": "80%"});

  // We want cdrag to be wide enough to overlap the border between
  // cbox and cdraw.  jquery appears to round up for outerwidth(),
  // which is what we want to avoid a sub-pixel gap.
  this.be.cbox_width = this.be.div_cbox_container.outerWidth();
  this.be.div_cdrag.width(this.be.cbox_width);

  // Other div dimensions are resized dynamically as appropriate.
  // The first puzzle level will reflow the text and call this.resize().
  this.cdraw_width = 0;
  this.cdraw_height = 0;

  // Sizes are based on the "em" size in the document.  Thus,
  // devices with very small pixels (like phones) will scale up as
  // appropriate.
  var em_size = this.be.em_size = this.be.div_cbox_container.width() / 8;
  this.be.io_spacing = em_size * 10/8;
  this.be.io_handle_size = this.be.io_spacing * 3/4;
  this.be.stub_len = em_size * 5/8;
  this.be.stub_end_len = 6;
  this.be.inv_bubble_size = em_size * 4/8;
  this.be.wire_arc_radius = em_size * 10/8;

  this.be.wire_speed = em_size*5/8;

  this.be.stroke_wire_fg = em_size * 1/16;
  this.be.stroke_wire_bg = em_size * 5/16;

  this.be.stroke_cell_fg = em_size * 3/16;
  this.be.stroke_cell_bg = em_size * 7/16;

  this.be.stroke_question = em_size * 5/16;
  this.be.stroke_check = em_size * 7/16;

  this.be.stroke_stub_end_undefined = em_size * 0.5/16;
  this.be.stroke_stub_end_defined   = em_size * 2/16;

  this.be.stroke_io_handle = em_size * 1/16;

  this.be.cell_grid_x = this.be.io_spacing * 6;
  this.be.cell_grid_y = this.be.io_spacing * 4;

  this.be.box_spacing = this.be.io_spacing;

  // Create Z-level references
  this.be.z_cell = this.be.cdraw.path("M0,0");
  this.be.z_wire = this.be.cdraw.path("M0,0");
  this.be.z_io = this.be.cdraw.path("M0,0");
  this.be.z_handle = this.be.cdraw.path("M0,0");

  // null cell
  new Cell(this.be, "cdraw", "null", 0, 0, "null");

  this.be.sim = new Sim(this.be);
  this.be.drag = new Drag(this.be);

  this.be.bdrag.drag(this.be.div_cdraw, this, 'canvas',
                     {start: this.canvas_drag_start,
                      move: this.canvas_drag_move,
                      end: this.canvas_drag_end,
                      pinch_start: this.canvas_pinch_start,
                      pinch_move: this.canvas_pinch_move});

  this.be.div_cdraw.mousewheel($.proxy(this.canvas_mousewheel, this));

  this.be.bdrag.drag(this.be.div_cbox_container, this, 'cbox',
                     {start: this.cbox_drag_start,
                      move: this.cbox_drag_move,
                      end: this.cbox_drag_end});

  $("#button-info-hide").click($.proxy(this.click_info_hide, this));
  $("#button-info-unhide").click($.proxy(this.click_info_unhide, this));

  this.be.window.resize($.proxy(this.resize_event, this)); 

  this.be.level = new Level(this.be);
  this.begin_level();
}

Circuit.prototype.begin_level = function(level_num) {
  this.be.level.begin(level_num);
  this.resize();
  this.fit_view();
  this.update_view();
};

Circuit.prototype.resize_event = function() {
  this.resize(true);
  this.update_view();
};

Circuit.prototype.resize = function(maintain_center) {
  // Adjust the sizes and positions of the various divs to fit the
  // window size.

  var old_cdraw_cx = (this.be.window_width + this.be.cbox_width)/2
  var old_cdraw_cy = (this.be.window_height + this.be.info_height)/2;

  this.be.window_width = this.be.window.width();
  this.be.window_height = this.be.window.height();

  // I might have set the div_truth dimensions in the past, so if I
  // want to measure its natural dimensions to fit its contents, I
  // have to set them back to auto first.

  // Both Chrome and Firefox do a *terrible* job with overflow-auto.
  // When the browser decides that a vertical scrollbar is needed, it
  // refuses to expand the div width to accommodate it.  I've tried
  // everything, and the only solution that looks somewhat decent is
  // to artificially widen the div by 20 pixels over its natural width
  // so that if a vertical scrollbar is needed, it has enough room to
  // appear without triggering a horizontal scrollbar.  And worst that
  // can happen if the hack is not completely successful for some
  // browser is that both scrollbars appear.
  this.be.div_truth.outerWidth("auto");
  this.be.truth_width = this.be.div_truth.outerWidth();
  this.be.div_truth.outerWidth(Math.max(this.be.truth_width + 20,
                                        this.be.div_cbox.outerWidth()));

  // The actual div_truth may be smaller than what we just set due to
  // the max-width property, so we measure it again to get the final
  // width.
  this.be.truth_width = this.be.div_truth.outerWidth();

  this.be.div_truth.outerHeight("auto");
  var new_truth_height = this.be.div_truth.outerHeight();

  // Move the div_top to the right of div_truth and decrease its width
  // accordingly.  Note that this may reflow the text and thus change the
  // height of div_info.
  //
  // The truth div may be a non-integer width.  To avoid a gap,
  // shoot for a 1 pixel overlap.  Since info is below truth in the
  // z-index, this won't be visible, and the minor difference in text
  // position won't be noticeable, either.
  var info_width = this.be.window_width - this.be.truth_width + 1;
  var info_offset = {
    top: 0,
    left: this.be.truth_width - 1
  };
  this.be.div_top.offset(info_offset);
  this.be.div_top.width(info_width);

  // Make sure the truth table div is at least as tall as the info
  // div.  info_height & info_width are also used to detect when a
  // cell is dragged over the info panel and thus should be deleted.
  if (this.info_hidden){
    this.be.info_height = $('#info-stub').outerHeight();
    this.be.info_width = info_offset.left + $('#info-stub').outerWidth();
  } else {
    this.be.info_height = this.be.div_info.outerHeight();
    this.be.info_width = Infinity;
  }
  if (new_truth_height < this.be.info_height) {
    new_truth_height = this.be.info_height;
    this.be.div_truth.outerHeight(new_truth_height);
  }
  this.be.truth_height = new_truth_height;

  // Move the cbox below div_truth and decrease its height
  // accordingly.  div_truth may not be an exact integer height, but
  // jQuery always reports its height as an integer, and so the top of
  // cbox is always at an integer offset (which is necessary to allow
  // smooth dragging from cbox to cdraw, which is also at an integer
  // offset).
  var cbox_height = this.be.window_height - this.be.truth_height;
  var cbox_offset = {
    top: this.be.truth_height,
    left: 0
  };
  this.be.div_cbox_container.offset(cbox_offset);
  this.be.div_cbox_container.height(cbox_height);

  if (maintain_center){
    // If we want the canvas objects to stay centered in the viewable
    // area, we adjust the canvas_left/top coordinates as needed.
    // This takes into account not only the change in the window size,
    // but also the possible new sizes of the panels that border the
    // viewable area.
    var new_cdraw_cx = (this.be.window_width + this.be.cbox_width)/2
    var new_cdraw_cy = (this.be.window_height + this.be.info_height)/2;
    var cdraw_dx = new_cdraw_cx - old_cdraw_cx;
    var cdraw_dy = new_cdraw_cy - old_cdraw_cy;
    var canvas_dx = cdraw_dx / this.be.scale;
    var canvas_dy = cdraw_dy / this.be.scale;
    this.be.canvas_left -= canvas_dx;
    this.be.canvas_top -= canvas_dy;
  }

  if (this.be.window_width > this.cdraw_width){
    this.cdraw_width = this.be.window_width + 1000;
    this.be.div_cdraw.width(this.cdraw_width);
  }
  if (this.be.window_height > this.cdraw_height){
    this.cdraw_height = this.be.window_height + 1000;
    this.be.div_cdraw.height(this.cdraw_height);
  }

  this.be.sim.resize_slider();
};

Circuit.prototype.fit_view = function() {
  var bbox = {};
  var all_cells = this.be.level.all_cells;
  for (var i = 0; i < all_cells.length; i++){
    var bbox_left = all_cells[i].bbox.x + all_cells[i].x;
    var bbox_top = all_cells[i].bbox.y + all_cells[i].y;
    var bbox_right = bbox_left + all_cells[i].bbox.width;
    var bbox_bottom = bbox_top + all_cells[i].bbox.height;
    if (bbox.left === undefined){
      bbox.left = bbox_left;
      bbox.top = bbox_top;
      bbox.right = bbox_right;
      bbox.bottom = bbox_bottom;
    } else {
      if (bbox_left < bbox.left){
        bbox.left = bbox_left;
      }
      if (bbox_top < bbox.top){
        bbox.top = bbox_top;
      }
      if (bbox_right > bbox.right){
        bbox.right = bbox_right;
      }
      if (bbox_bottom > bbox.bottom){
        bbox.bottom = bbox_bottom;
      }
    }
  }

  if (bbox.left === undefined){
    // Handle the case that no cells are in cdraw.
    this.be.canvas_left = 0;
    this.be.canvas_top = 0;
    this.be.scale = 1.0;
  } else {
    var bbox_cx = (bbox.left + bbox.right) / 2;
    var bbox_cy = (bbox.top + bbox.bottom) / 2;
    var bbox_width = bbox.right - bbox.left + this.be.wire_arc_radius * 3;
    var bbox_height = bbox.bottom - bbox.top + this.be.wire_arc_radius * 4;

    // The truth table cuts a corner out of the viewable screen
    // area, so we try two different aspect ratios to avoid it
    // and see which one is better.

    // Try to the right of the truth table.
    var cdraw_left1 = this.be.truth_width;
    var cdraw_width1 = this.be.window_width - cdraw_left1;
    var cdraw_top1 = this.be.div_top.outerHeight();
    var cdraw_height1 = this.be.window_height - cdraw_top1;
    var x_scale1 = cdraw_width1 / bbox_width;
    var y_scale1 = cdraw_height1 / bbox_height;
    var scale1 = Math.min(x_scale1, y_scale1);

    // Try below the truth table.
    var cdraw_left2 = this.be.cbox_width;
    var cdraw_width2 = this.be.window_width - cdraw_left2;
    var cdraw_top2 = Math.max(cdraw_top1, this.be.truth_height);
    var cdraw_height2 = this.be.window_height - cdraw_top2;
    var x_scale2 = cdraw_width2 / bbox_width;
    var y_scale2 = cdraw_height2 / bbox_height;
    var scale2 = Math.min(x_scale2, y_scale2);

    if (scale1 > scale2){
      var scale = this.be.scale = Math.min(scale1, 2.0);
      var cdraw_cx = cdraw_left1 + cdraw_width1 / 2;
      var cdraw_cy = cdraw_top1 + cdraw_height1 / 2;
    } else {
      var scale = this.be.scale = Math.min(scale2, 2.0);
      var cdraw_cx = cdraw_left2 + cdraw_width2 / 2;
      var cdraw_cy = cdraw_top2 + cdraw_height2 / 2;
    }
    this.be.canvas_left = bbox_cx - cdraw_cx / scale;
    this.be.canvas_top = bbox_cy - cdraw_cy / scale;
  }
};

Circuit.prototype.cdraw_to_canvas_x = function(cdraw_x) {
  return cdraw_x / this.be.scale + this.be.canvas_left;
};

Circuit.prototype.cdraw_to_canvas_y = function(cdraw_y) {
  return cdraw_y / this.be.scale + this.be.canvas_top;
};

Circuit.prototype.canvas_to_cdraw_x = function(canvas_x) {
  return (canvas_x - this.be.canvas_left) * this.be.scale;
};

Circuit.prototype.canvas_to_cdraw_y = function(canvas_y) {
  return (canvas_y - this.be.canvas_top) * this.be.scale;
};

Circuit.prototype.update_view = function() {
  // canvas_cdraw_width/height indicates the size of the overall cdraw
  // (larger than viewable) area in canvas coordinates.
  var canvas_cdraw_width = this.cdraw_width / this.be.scale;
  var canvas_cdraw_height = this.cdraw_height / this.be.scale;
  this.be.cdraw.setViewBox(this.be.canvas_left, this.be.canvas_top,
                           canvas_cdraw_width, canvas_cdraw_height);

  // canvas_cdrag_width/height indicates the size of the cdrag area in
  // canvas coordinates.
  var canvas_cdrag_width = this.be.cbox_width / this.be.scale;
  var canvas_cdrag_height = this.be.window_height / this.be.scale;
  this.be.cdrag.setViewBox(this.be.canvas_left, this.be.canvas_top,
                           canvas_cdrag_width, canvas_cdrag_height);
};

Circuit.prototype.canvas_drag_start = function(x, y) {
  this.old_drag_x = x;
  this.old_drag_y = y;

  this.be.div_cdraw.css({"cursor": "all-scroll"});
};

Circuit.prototype.canvas_drag_move = function(x, y) {
  var screen_dx = x - this.old_drag_x;
  var screen_dy = y - this.old_drag_y;
  var canvas_dx = screen_dx / this.be.scale;
  var canvas_dy = screen_dy / this.be.scale;
  this.be.canvas_left -= canvas_dx;
  this.be.canvas_top -= canvas_dy;
  this.update_view();

  this.old_drag_x = x;
  this.old_drag_y = y;
};

Circuit.prototype.canvas_drag_end = function() {
  this.be.div_cdraw.css({"cursor": "default"});
};

Circuit.prototype.canvas_pinch_start = function(x1, y1, x2, y2) {
  this.pinch_orig_distance = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
  this.pinch_orig_scale = this.be.scale;
};

Circuit.prototype.canvas_pinch_move = function(x1, y1, x2, y2) {
  var pinch_distance = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
  var new_scale = (this.pinch_orig_scale *
                   (pinch_distance / this.pinch_orig_distance));
  if (new_scale > 2.0) new_scale = 2.0;

  this.rescale(x1, y1, new_scale);
};

Circuit.prototype.canvas_mousewheel = function(event) {
  // Ignore events with bucky-key modifiers.  E.g. ctrl-scroll zooms the
  // whole window, so we don't want to also zoom the draw view.
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

  var new_scale = this.be.scale / Math.pow(0.85, event.deltaY);
  if (new_scale > 2.0) new_scale = 2.0;

  this.rescale(event.pageX, event.pageY, new_scale);
}

Circuit.prototype.rescale = function(x, y, new_scale) {
  var old_canvas_mx = x / this.be.scale;
  var old_canvas_my = y / this.be.scale;
  var new_canvas_mx = x / new_scale;
  var new_canvas_my = y / new_scale;
  this.be.canvas_left -= (new_canvas_mx - old_canvas_mx);
  this.be.canvas_top -= (new_canvas_my - old_canvas_my);
  this.be.scale = new_scale;

  this.update_view();
};

Circuit.prototype.cbox_drag_start = function(x, y) {
  this.cbox_drag_x = x;
  this.cbox_drag_width = this.be.div_cbox.width();
  this.be.div_cbox_container.css({"cursor": "col-resize"});
};

Circuit.prototype.cbox_drag_move = function(x, y) {
  var cbox_width = this.cbox_drag_width + x - this.cbox_drag_x;
  cbox_width = Math.max(cbox_width, this.be.em_size*4);
  var scale = cbox_width / (this.be.em_size*8);
  this.be.div_cbox.width(cbox_width);
  this.be.div_cbox.height(this.be.box_height * scale);
  this.be.cbox_width = this.be.div_cbox_container.outerWidth();
  this.be.div_cdrag.width(this.be.cbox_width);
  this.resize();
  this.update_view();
};

Circuit.prototype.cbox_drag_end = function() {
  this.be.div_cbox_container.css({"cursor": "default"});
};

Circuit.prototype.click_info_hide = function() {
  this.info_hidden = true;
  this.be.div_info.css({display: "none"});
  $('#info-stub').css({display: "inline-block"});
  $('#main-stub').css({display: "inline-block"});
  this.resize();
}

Circuit.prototype.click_info_unhide = function() {
  this.info_hidden = false;
  $('#info-stub').css({display: "none"});
  $('#main-stub').css({display: "none"});
  this.be.div_info.css({display: "block"});
  this.resize();
}

// This is called as soon as the DOM is ready.
$(function() {
  new Circuit();
});
