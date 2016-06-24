// Copyright 2016 Chris Nelson - All rights reserved.

'use strict';

// Circuit is the "main" object.  It creates all the other top-level
// objects.  It handles resizing of the various panels within the
// window.  It handles drag and zoom of the drawing canvas.
function Circuit() {
  ExtendRaphael();

  // "be" == "Boole's Errand'.  this.be is a data structure for
  // "global" values for the whole circuit.  Any objects that need to
  // access "global" values keeps a pointer to this.be.
  this.be = {}
  this.be.circuit = this;
  this.be.bdrag = new Bdrag(this.be);

  this.be.cdrag = Raphael('cdrag', '100%', '100%');
  this.be.cbox = Raphael('cbox', '100%', '100%');
  this.be.cdraw = Raphael('cdraw', '100%', '100%');

  // We keep copies of various jQuery objects so that they don't need
  // to be created multiple times, especially in resize(), where
  // performance is important.
  this.be.window = $(window);
  this.be.div_truth = $('#truth');
  this.be.div_info = $('#info');
  this.be.div_infotxt = $('#infotxt');
  this.be.div_info_stub = $('#info-stub');
  this.be.div_controls = $('#sim-controls');
  this.be.div_main_stub = $('#main-stub');
  this.be.div_cdrag = $('#cdrag');
  this.be.div_cdraw = $('#cdraw');
  this.be.div_cbox = $('#cbox');

  // For window panels that have fixed dimensions, record those dimensions.
  // When a cell is dragged, it is marked to be deleted if it is dragged onto
  // one of these panels.
  var div_zoom = $('#zoom-controls');
  this.be.zoom_width = div_zoom.outerWidth();
  this.be.zoom_height = div_zoom.outerHeight();

  this.be.main_stub_width = this.be.div_main_stub.outerWidth();
  this.be.main_stub_height = this.be.div_main_stub.outerHeight();

  // Other div dimensions are resized dynamically as appropriate.  The first
  // puzzle level will determine the desired size of certain panels, then call
  // this.resize() to adjust all panels to match.

  // We set the initial drawing canvas dimensions to 0 so that the first call
  // to this.resize() is guaranteed to increase its size to something
  // reasonable.
  this.cdraw_width = 0;
  this.cdraw_height = 0;

  // Sizes are based on the "em" size in the document.  Thus, devices with very
  // small pixels (like phones) will scale up as appropriate.  It happens that
  // the em size on my development browser is 16 pixels, so many dimensions are
  // a multiple of 1/16 em.
  //
  // The width of div_truth is initially set to 8em purely so that I can
  // measure it.  It'll get resized to fit the truth table later.
  var em_size = this.be.em_size = this.be.div_truth.width() / 8;
  this.be.io_spacing = em_size * 10/8;
  this.be.io_handle_radius = this.be.io_spacing * 3/8;
  this.be.io_target_radius = this.be.io_handle_radius * 2;

  this.be.stub_len = em_size * 5/8;
  this.be.stub_end_len = em_size * 6/16;

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
  this.be.stroke_io_fail = this.be.io_handle_radius * 0.4;

  // The vertical gap between cells in cbox.
  this.be.box_spacing = this.be.io_spacing;

  // Create Z-level references.  Raphael doesn't support the Z index, and even
  // if it did, what we really need is a relative ordering among a constantly
  // shifting set of elements.  The following references are named after the
  // primary components that are ordered *before* each reference.  E.g. a cell
  // can be moved above all other cells by ordering it just before z_cell.
  this.be.z_cell = this.be.cdraw.path('M0,0');
  this.be.z_wire = this.be.cdraw.path('M0,0');
  this.be.z_io = this.be.cdraw.path('M0,0');

  // The null cell provides a mobile, invisible attachment point for the end of
  // a wire that is not connected to a real cell's IO.
  new Cell(this.be, 'cdraw', 'null', 0, 0, 'null');

  this.be.sim = new Sim(this.be);
  this.be.drag = new Drag(this.be);

  // Set events on the background of the drawing canvas.
  this.be.bdrag.drag(this.be.div_cdraw, this, 'canvas',
                     {start: this.canvas_drag_start,
                      move: this.canvas_drag_move,
                      end: this.canvas_drag_end,
                      pinch_start: this.canvas_pinch_start,
                      pinch_move: this.canvas_pinch_move});

  this.be.div_cdraw.mousewheel($.proxy(this.canvas_mousewheel, this));

  // Set events on buttons that trigger Circuit tasks.  These buttons always
  // exist, so we only need to set the trigger once, but some buttons may be
  // hidden at times.
  $('#button-info-hide').click($.proxy(this.click_info_hide, this));
  $('#button-info-unhide').click($.proxy(this.click_info_unhide, this));

  $('#zoom-in').click($.proxy(this.click_zoom_in, this));
  $('#zoom-out').click($.proxy(this.click_zoom_out, this));
  $('#zoom-fit').click($.proxy(this.click_zoom_fit, this));

  // Set an event on window resize.  This may also be triggered by a change in
  // device orientation.
  this.be.window.resize($.proxy(this.resize_event, this)); 

  // The canvas is initially displayed at a 1:1 ratio.  We need to know this
  // while initializing the cells in order to calculate font scaling.
  this.be.scale = 1.0;

  // Measure the initial window size and set the canvas size accordingly.
  this.update_window_size();

  // Initialize the Level object and begin the first puzzle.  A puzzle is
  // always in progress throughout the game, although the user may not be able
  // to interact with it when the main menu is showing.
  this.be.level = new Level(this.be);
  this.begin_level();
}

// Circuit.begin_level() calls Level.begin(), which calls Sim.begin_level().
// Each function initializes its own variables and interface.
Circuit.prototype.begin_level = function(level_num) {
  this.be.level.begin(level_num);

  this.unhide_info();

  this.resize();
  this.fit_view();
  this.update_view();
};

Circuit.prototype.update_window_size = function() {
  // Record the window dimensions.  They get used all over.
  this.be.window_width = this.be.window.width();
  this.be.window_height = this.be.window.height();

  if (this.be.window_width > this.cdraw_width) {
    this.cdraw_width = this.be.window_width + 1000;
    this.be.div_cdraw.width(this.cdraw_width);
  }
  if (this.be.window_height > this.cdraw_height) {
    this.cdraw_height = this.be.window_height + 1000;
    this.be.div_cdraw.height(this.cdraw_height);

    // It would be nice if we could simply leave div_cdrag as 100% of the
    // window height.  However, the window may be a non-integer height that we
    // cannot measure accurately, which would screw up the scaling at the
    // boundary between cdrag and cdraw.  Therefore we adjust the height of the
    // cdrag canvas to exactly match the height of the cdraw canvas.
    this.be.div_cdrag.height(this.cdraw_height);
  }
};

// Handler for the window resize event.
Circuit.prototype.resize_event = function() {
  // Determine the (approximate) center of view.  We'll use these
  // values later.
  var old_cdraw_cx = (this.be.window_width + this.be.cbox_width)/2
  var old_cdraw_cy = (this.be.window_height + this.be.info_height)/2;

  this.update_window_size();

  this.resize();

  if (this.be.view_is_fit) {
    // After the user has clicked 'fit' (or when a new puzzle is begun, which
    // is automatically fit), resizing the window (or reorienting the screen)
    // cause the view to be fit again.  This allows the user to get comfortable
    // before making any manual changes, which unset view_is_fit.
    this.fit_view();
  } else {
    // Keep the current drawing scale, but adjust the canvas_left/top
    // coordinates so that what was centered before is re-centered now.  This
    // takes into account not only the change in the window size, but also the
    // possible new sizes of the panels that border the viewable area.
    var new_cdraw_cx = (this.be.window_width + this.be.cbox_width)/2
    var new_cdraw_cy = (this.be.window_height + this.be.info_height)/2;
    var cdraw_dx = new_cdraw_cx - old_cdraw_cx;
    var cdraw_dy = new_cdraw_cy - old_cdraw_cy;
    var canvas_dx = cdraw_dx / this.be.scale;
    var canvas_dy = cdraw_dy / this.be.scale;
    this.be.canvas_left -= canvas_dx;
    this.be.canvas_top -= canvas_dy;
  }

  this.update_view();
};

// Update the position and size of all window panels.  This may be in reaction
// to a change in the window size or to a change in the desired size of
// individual panels.
//
// The width of the truth table determines the width of the info panel, which
// determines the height of the info panel, which determines the minimum height
// of the truth table, which causes the cbox to scale and so determines the
// width of the cbox.  But if the truth table and info stub heights are fixed,
// then the width of the cbox determines the width of the truth table.
// Finally, the info stub and the sim controls are placed relative to the truth
// table, cbox, and info panel.
Circuit.prototype.resize = function() {
  if (this.be.hide_truth && this.be.hide_cbox) {
    // Hide the truth div altogether (but only if the cbox div will also be
    // hidden).
    this.be.truth_width = 0;
  } else {
    // The actual div_truth may be smaller than what we set due to its
    // max-width property, so we measure it to get its current width.  Here, we
    // measure the outer width since that's what useful for positioning
    // adjacent elements.
    this.be.truth_width = this.be.div_truth.outerWidth();
  }

  if (this.info_hidden) {
    // For now, just measure the info panel stub height.  We'll set its
    // position and measure its width later.
    this.be.info_height = this.be.div_info_stub.outerHeight();
  } else {
    // The info panel is anchored to the top right of the screen, so we just
    // need to adjust its width to match the space remaining to the right of
    // the truth table.  Note that this may reflow the info text and thus
    // change the height of the info panel.
    //
    // The border of the truth div may make it a non-integer width, and the
    // window itself may be a non-integer width (e.g. if the user has zoomed in
    // the whole browser).  jQuery rounds up both of these values to the next
    // higher integer.  To avoid a potential gap between the truth table and
    // the info panel, shoot for a 1 pixel overlap.  Since info is below truth
    // in the z-index, this won't be visible, and the minor difference in text
    // position won't be noticeable, either.
    this.be.div_info.width(this.be.window_width - this.be.truth_width + 1);

    // The info panel extends all the way to the right, so there's no
    // need to be exact about its width.
    this.be.info_width = Infinity;

    // Measure the resulting height of the info panel.
    this.be.info_height = this.be.div_info.outerHeight();
  }

  // Make sure that div_truth is at least as tall as div_info.
  //
  // We can measure the height of the truth table itself, but that doesn't tell
  // me the desired height of its container (with border).  Because of the
  // max_height constraint, we can't just measure it once and assume that it
  // stays that height, so we re-measure it every time we resize.  We may have
  // set the div_truth height manually in the past, so if I want to measure its
  // natural height to fit its contents, I have to set it back to auto first.
  this.be.div_truth.outerHeight('auto');
  this.be.truth_height = this.be.div_truth.outerHeight();
  if (this.be.truth_height < this.be.info_height) {
    this.be.div_truth.outerHeight(this.be.truth_height = this.be.info_height);
    // The truth table max height is at least as tall as the info panel max
    // height, so the newly set height is guaranteed to be used, and we don't
    // need to remeasure it.
  }

  if (this.be.hide_cbox) {
    this.be.cbox_width = 0;
  } else {
    // The cbox is anchored to the bottom left of the screen, so we just need
    // to adjust its height to match the space remaining below the truth table.
    //
    // The border of the truth div may make it a non-integer height, and the
    // window itself may be a non-integer height (e.g. if the user has zoomed
    // in the whole browser).  jQuery rounds up both of these values to the
    // next higher integer.  To avoid a potential gap between the truth table
    // and the cbox, shoot for a 1 pixel overlap.  Since cbox is below truth in
    // the z-index, this won't be visible, and the minor difference in cell
    // (and scrollbar) position won't be noticeable either.
    var cbox_height = this.be.window_height - this.be.truth_height + 1;
    this.be.div_cbox.height(cbox_height);

    var max_width = this.be.window_width / 5;
    var max_scale = max_width / (this.be.em_size * 8);

    var cbox_scale = Math.max(0.5,
                              Math.min(1.0,
                                       max_scale,
                                       cbox_height / this.be.box_height));
    this.be.cbox.setSize(this.be.em_size * 8 * cbox_scale,
                         this.be.box_height * cbox_scale);
    this.be.cbox_width = this.be.div_cbox.outerWidth();

    // The measured cbox_width appears to be rounded up if fractional, which is
    // what we want for setting the cdrag width.
    this.be.div_cdrag.width(this.be.cbox_width);
  }

  if (this.be.hide_truth && this.info_hidden) {
    // If the info panel is hidden, then we allow the hidden truth table width
    // to be subordinate to the cbox width.  Possibly this applies to only the
    // 'Hidden truths' puzzle since it is the only one that hides the truth
    // table, but has gates available in cbox.

    // If the info panel is not hidden, then changing the truth width changes
    // the info width, which changes the info height, which changes the cbox
    // height, which changes the cbox width, which changes the truth width,
    // which is a circular dependency chain.  So we don't reduce the truth
    // width when the info panel is showing.

    // If the info panel is hidden and the truth table is visible, then the
    // truth table is always wider than the cbox width for the browsers I've
    // tried.  So I don't bother with the extra code that would be needed to
    // try to reduce its width here.
    this.be.truth_width = this.be.cbox_width;
    this.be.div_truth.outerWidth(this.be.truth_width);
  }
  if (this.info_hidden) {
    var info_stub_offset = {
      top: 0,
      left: this.be.truth_width - 1
    };
    this.be.div_info_stub.offset(info_stub_offset);
    this.be.info_width = this.be.truth_width + this.be.div_info_stub.outerWidth();
  }

  // Position the sim controls.

  if (this.info_hidden) {
    var avail_width = (this.be.window_width -
                       this.be.info_width - this.be.main_stub_width);
    var cx = this.be.info_width + avail_width/2;
    this.be.controls_top = -1;
  } else {
    if (this.be.info_height == this.be.truth_height) {
      avail_width = this.be.window_width - this.be.cbox_width;
    } else {
      avail_width = this.be.window_width - this.be.truth_width;
    }
    cx = this.be.window_width - avail_width/2;
    this.be.controls_top = this.be.info_height - 1;
  }

  // Position the sim controls at the left edge (to avoid an
  // accidental line break at their right edge), then measure their
  // desired width after any necessary line break to meet the
  // avail_width constraint.
  this.be.div_controls.css({top: this.be.controls_top,
                            left: 0,
                            'max-width': avail_width});
  this.be.controls_width = this.be.div_controls.outerWidth();
  this.be.controls_height = this.be.div_controls.outerHeight();

  // Horizontally center the sim controls in the available space using
  // their actual width (with the avail_width contraint).
  this.be.controls_left = cx - this.be.controls_width/2;
  this.be.div_controls.css({left: this.be.controls_left});

  this.be.sim.resize_slider();
};

Circuit.prototype.fit_view = function() {
  var bbox = {};
  var all_cells = this.be.level.all_cells;
  for (var i = 0; i < all_cells.length; i++) {
    var bbox_left = all_cells[i].bbox.left + all_cells[i].x;
    var bbox_right = all_cells[i].bbox.right + all_cells[i].x;
    var bbox_top = all_cells[i].bbox.top + all_cells[i].y;
    var bbox_bottom = all_cells[i].bbox.bottom + all_cells[i].y;
    if (bbox.left === undefined) {
      bbox.left = bbox_left;
      bbox.top = bbox_top;
      bbox.right = bbox_right;
      bbox.bottom = bbox_bottom;
    } else {
      if (bbox_left < bbox.left) bbox.left = bbox_left;
      if (bbox_top < bbox.top) bbox.top = bbox_top;
      if (bbox_right > bbox.right) bbox.right = bbox_right;
      if (bbox_bottom > bbox.bottom) bbox.bottom = bbox_bottom;
    }
  }

  if (bbox.left === undefined) {
    // Handle the case that no cells are in cdraw.
    this.be.canvas_left = 0;
    this.be.canvas_top = 0;
    this.be.scale = 1.0;
  } else {
    var bbox_width = bbox.right - bbox.left + this.be.em_size;
    var bbox_height = bbox.bottom - bbox.top + this.be.em_size;
    var bbox_cx = (bbox.left + bbox.right) / 2;
    var bbox_cy = (bbox.top + bbox.bottom) / 2;

    // The truth table cuts a corner out of the viewable screen
    // area, so we try two different aspect ratios to avoid it
    // and see which one is better.

    // Try to the right of the truth table.
    var cdraw_left1 = this.be.truth_width;
    var cdraw_width1 = this.be.window_width - cdraw_left1;
    var cdraw_top1 = this.be.info_height + this.be.div_controls.outerHeight();
    var cdraw_height1 = this.be.window_height - this.be.zoom_height - cdraw_top1;
    var x_scale1 = cdraw_width1 / bbox_width;
    var y_scale1 = cdraw_height1 / bbox_height;
    var scale1 = Math.min(x_scale1, y_scale1);

    // Try below the truth table.
    var cdraw_left2 = this.be.cbox_width;
    var cdraw_width2 = this.be.window_width - cdraw_left2;
    var cdraw_top2 = Math.max(cdraw_top1, this.be.truth_height);
    var cdraw_height2 = this.be.window_height - this.be.zoom_height - cdraw_top2;
    var x_scale2 = cdraw_width2 / bbox_width;
    var y_scale2 = cdraw_height2 / bbox_height;
    var scale2 = Math.min(x_scale2, y_scale2);

    if (scale1 > scale2) {
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

  this.be.view_is_fit = true;
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
  var canvas_cdrag_height = this.cdraw_height / this.be.scale;
  this.be.cdrag.setViewBox(this.be.canvas_left, this.be.canvas_top,
                           canvas_cdrag_width, canvas_cdrag_height);
};

Circuit.prototype.canvas_drag_start = function(x, y) {
  this.old_drag_x = x;
  this.old_drag_y = y;

  $(document.body).addClass('cursor-force-all-scroll');
};

Circuit.prototype.canvas_drag_move = function(x, y) {
  // Since the user made a change to the canvas position, we won't
  // automatically refit it on a window resize.
  this.be.view_is_fit = false;

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
  $(document.body).removeClass('cursor-force-all-scroll');
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
  this.rescale(event.pageX, event.pageY, new_scale);
};

Circuit.prototype.rescale = function(x, y, new_scale) {
  // Since the user made a change to the canvas scale, we won't
  // automatically refit it on a window resize.
  this.be.view_is_fit = false;

  if (new_scale > 2.0) new_scale = 2.0;
  var old_canvas_mx = x / this.be.scale;
  var old_canvas_my = y / this.be.scale;
  var new_canvas_mx = x / new_scale;
  var new_canvas_my = y / new_scale;
  this.be.canvas_left -= (new_canvas_mx - old_canvas_mx);
  this.be.canvas_top -= (new_canvas_my - old_canvas_my);
  this.be.scale = new_scale;

  this.update_view();
};

Circuit.prototype.click_zoom_in = function() {
  this.zoom(1/0.85);
};

Circuit.prototype.click_zoom_out = function() {
  this.zoom(0.85);
};

Circuit.prototype.zoom = function(ratio) {
  this.rescale((this.be.window_width + this.be.cbox_width) / 2,
               (this.be.window_height + this.be.info_height) / 2,
               this.be.scale * ratio);
};

Circuit.prototype.click_zoom_fit = function() {
  this.be.circuit.fit_view();
  this.be.circuit.update_view();
};

Circuit.prototype.click_info_hide = function() {
  this.info_hidden = true;
  this.be.div_info.css({display: 'none'});
  this.be.div_info_stub.css({display: 'block'});
  this.be.div_main_stub.css({display: 'block'});
  this.resize();
  this.update_view();
};

Circuit.prototype.click_info_unhide = function() {
  this.unhide_info();
  this.resize();
  this.update_view();
};

Circuit.prototype.unhide_info = function() {
  this.info_hidden = false;
  this.be.div_info_stub.css({display: 'none'});
  this.be.div_main_stub.css({display: 'none'});
  this.be.div_info.css({display: 'block'});
};

Circuit.prototype.save_data = function(key, data) {
  try {
    localStorage.setItem(key, data);
    return false;
  }
  catch(e) {
    return true;
  }
};

Circuit.prototype.load_data = function(key) {
  try {
    return localStorage.getItem(key);
  }
  catch(e) {
    return undefined;
  }
};

// This is called as soon as the DOM is ready.
$(function() {
  new Circuit();
});
