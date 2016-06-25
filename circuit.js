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

// Measure the window size and adjust the cdraw and cdrag div dimensions
// accordingly.  Note that the actual canvas viewport is adjusted separately,
// in update_view().
Circuit.prototype.update_window_size = function() {
  // Record the window dimensions.  They get used all over.
  this.be.window_width = this.be.window.width();
  this.be.window_height = this.be.window.height();

  // We need cdraw to be at least as large as the window.  The window may be a
  // non-integer size, which jQuery rounds down, so we actually need cdraw to
  // be at least as large as the measured window size + 1.
  //
  // It's tempting to simply set the cdraw dimensions to a huge constant value,
  // but who knows what size displays the future will bring, and the browser
  // may be doing crazy scaling as well.  So we set the cdraw dimensions based
  // on the measured window size, plus some margin so that we won't have to
  // re-adjust every time that the window is resized.
  //
  // I assume that there's no advantage to reducing the size of the canvas when
  // the window shrinks, so I don't bother to do so.
  //
  // Because the canvas dimensions are set to '100%' of the div dimensions,
  // updating the div size automatically updates the canvas size.
  if (this.be.window_width >= this.cdraw_width) {
    this.cdraw_width = this.be.window_width + 1000;
    this.be.div_cdraw.width(this.cdraw_width);
  }

  if (this.be.window_height >= this.cdraw_height) {
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
    // table while also having gates available in the cbox.  Basically, this
    // code only exists because that one case looks super weird without it.

    // If the info panel is not hidden, then changing the truth width changes
    // the info width, which changes the info height, which changes the cbox
    // height, which changes the cbox width, which changes the truth width,
    // which is a circular dependency chain.  So we don't reduce the truth
    // width when the info panel is showing.

    // If the info panel is hidden and the truth table is visible, then the
    // truth table is always wider than the maximum cbox width for the browsers
    // I've tried.  So I don't bother with the extra code that would be needed
    // to try to reduce its width here.
    this.be.truth_width = this.be.cbox_width;
    this.be.div_truth.outerWidth(this.be.truth_width);
  }

  if (this.info_hidden) {
    // Position the info stub just to the right of the truth table.
    var info_stub_offset = {
      top: 0,
      left: this.be.truth_width - 1
    };
    this.be.div_info_stub.offset(info_stub_offset);

    // info_width is not actually the width of the info panel, but of the cdraw
    // region excluded from view by the info panel.  It does not need to be
    // precise, as the boundary for cell deletion looks natural.
    this.be.info_width = this.be.truth_width + this.be.div_info_stub.outerWidth();
  }

  // Position the sim controls.

  if (this.info_hidden) {
    // The sim controls are positioned at the top of the window between the
    // info panel stub and the main menu stub.
    var avail_width = (this.be.window_width -
                       this.be.info_width - this.be.main_stub_width);
    var cx = this.be.info_width + avail_width/2;

    // The info panel has extra padding at the top that we don't need if it's
    // placed at the top of the window, so we simply offset it to hide the
    // padding.
    this.be.controls_top = -1;
  } else {
    // The sim controls are positioned below the info panel.  If the truth
    // table height was increased to match info panel height, then the sim
    // controls are centered below both of those, and to the right of the cbox.
    // But if the truth table height is greater than the info panel height,
    // then the sim controls are centered to the right of the truth table.
    if (this.be.info_height == this.be.truth_height) {
      avail_width = this.be.window_width - this.be.cbox_width;
    } else {
      avail_width = this.be.window_width - this.be.truth_width;
    }
    cx = this.be.window_width - avail_width/2;

    // The info panel may be a non-integer height, in which case jQuery rounds
    // down.  To avoid a gap, we position the top of the sim controls one pixel
    // above the measured info panel height.  The sim controls have one pixel
    // of padding at the top which is hidden if the info panel is an exact
    // integer height.
    this.be.controls_top = this.be.info_height - 1;
  }

  // Position the sim controls at the left edge (to avoid an accidental line
  // break at their right edge), then measure their desired dimensions after
  // any necessary line break to meet the avail_width constraint.
  this.be.div_controls.css({top: this.be.controls_top,
                            left: 0,
                            'max-width': avail_width});
  this.be.controls_width = this.be.div_controls.outerWidth();
  this.be.controls_height = this.be.div_controls.outerHeight();

  // Horizontally center the sim controls in the available space using
  // their measured width (with the avail_width contraint).
  this.be.controls_left = cx - this.be.controls_width/2;
  this.be.div_controls.css({left: this.be.controls_left});

  // Sim needs to know the slider offset and width so that it can properly
  // handle mouse drag interaction.
  this.be.sim.measure_slider();
};

// Adjust the position and scale of the canvas to fit all of the cells.
Circuit.prototype.fit_view = function() {
  // If the view is currently fit, resizing the window refits the view.
  this.be.view_is_fit = true;

  // Default values in case we need to bail out.
  this.be.canvas_left = 0;
  this.be.canvas_top = 0;
  this.be.scale = 1.0;

  var all_cells = this.be.level.all_cells;
  if (all_cells.length == 0) return;

  // Each cell's bbox includes margin for wires (assuming that if the cell is
  // at the edge, then those wires curl towards the center).  Here at the top
  // level we add another 1/2 em margin so that the cells & wires aren't
  // directly touching the edge of the viewing area.
  var half_em = this.be.em_size/2;

  // Get the bounding box of all cells on the canvas.
  for (var i = 0; i < all_cells.length; i++) {
    var cell_left = all_cells[i].bbox.left + all_cells[i].x - half_em;
    var cell_top = all_cells[i].bbox.top + all_cells[i].y - half_em;
    var cell_right = all_cells[i].bbox.right + all_cells[i].x + half_em;
    var cell_bottom = all_cells[i].bbox.bottom + all_cells[i].y + half_em;
    if (bbox_left === undefined) {
      var bbox_left = cell_left;
      var bbox_top = cell_top;
      var bbox_right = cell_right;
      var bbox_bottom = cell_bottom;
    } else {
      if (cell_left < bbox_left) bbox_left = cell_left;
      if (cell_top < bbox_top) bbox_top = cell_top;
      if (cell_right > bbox_right) bbox_right = cell_right;
      if (cell_bottom > bbox_bottom) bbox_bottom = cell_bottom;
    }
  }

  // These variables form the ideal bounding box in cdraw (i.e. window
  // coordinates).  This cdraw bounding box will be reduced in size as needed
  // to prevent cells from overlapping the incursions into this space.
  var cdraw_left = this.be.cbox_width;
  var cdraw_top = this.be.info_height + this.be.div_controls.outerHeight();
  var cdraw_right = this.be.window_width;
  var cdraw_bottom = this.be.window_height;

  // Determine the ideal scale at which to fit the canvas into cdraw.
  var scale1 = (cdraw_right - cdraw_left) / (bbox_right - bbox_left);
  var scale2 = (cdraw_bottom - cdraw_top) / (bbox_bottom - bbox_top);
  var scale = Math.min(scale1, scale2);

  // The truth table may be an incursion into the ideal bounding box if it is
  // taller than the info panel.  If it is the same height, then the tl
  // incursion has no effect.
  var tl_left = this.be.truth_width;
  var tl_top = Math.max(cdraw_top, this.be.truth_height);

  // The zoom controls are an incursion into the ideal bounding box.
  var br_right = cdraw_right - this.be.zoom_width;
  var br_bottom = cdraw_bottom - this.be.zoom_height;

  // Review all cells again.  If any cell overlaps an incursion, reduce the
  // ideal bounding box and possibly reduce the scale until the cells don't
  // overlap the incursion.  This heuristic isn't perfect, but it works well
  // for most cases and still works OK where it's not perfect.
  //
  // The heuristic doesn't account for wires that may cross the incursion.
  // This is usually OK because there's probably no more than one wire across
  // that corner, and it's obvious where it goes.

  // If the scale must be reduced multiple times to avoid an incursion, a
  // constraint set by a previous cell may not be sufficient to avoid trouble
  // at a smaller scale.  We awkwardly deal with that by repeating the loop
  // until the scale stops reducing.
  while (scale !== old_scale) {
    var old_scale = scale;

    for (var i = 0; i < all_cells.length; i++) {
      var cell_left = all_cells[i].bbox.left + all_cells[i].x - half_em;
      var cell_top = all_cells[i].bbox.top + all_cells[i].y - half_em;

      var cell_cdraw_left = cdraw_left + (cell_left - bbox_left)*scale;
      var cell_cdraw_top = cdraw_top + (cell_top - bbox_top)*scale;

      if ((cell_cdraw_left < tl_left) && (cell_cdraw_top < tl_top)) {
        var scale1 = (cdraw_right - tl_left) / (bbox_right - cell_left);
        var scale2 = (cdraw_bottom - tl_top) / (bbox_bottom - cell_top);
        if (scale1 < scale2) {
          // tl_left is the tighter constraint, so avoid it by keep adjusting
          // the vertical dimensions of the ideal cdraw bounding box.  It may
          // be that we had some wiggle room in the vertical dimension, in
          // which case we can keep the same scale as before.
          if (scale2 < scale) scale = scale2;

          // Now adjust the top of the cdraw bounding box so that the cell
          // doesn't overlap the incursion.  I.e. position cell_top at tl_top
          // at the new scale.
          var cdraw_top = tl_top - scale * (cell_top - bbox_top);
        } else {
          // This is the same as above except that it positions cell_left at
          // to_left at the new scale.
          if (scale1 < scale) scale = scale1;
          var cdraw_left = tl_left - scale * (cell_left - bbox_left);
        }
      }

      // This is the same as above, but adjusting for the bottom-right
      // incursion instead of the top-left.
      var cell_right = all_cells[i].bbox.right + all_cells[i].x + half_em;
      var cell_bottom = all_cells[i].bbox.bottom + all_cells[i].y + half_em;

      var cell_cdraw_right = cdraw_right - (bbox_right - cell_right)*scale;
      var cell_cdraw_bottom = cdraw_bottom - (bbox_bottom - cell_bottom)*scale;

      if ((cell_cdraw_right > br_right) && (cell_cdraw_bottom > br_bottom)) {
        var scale1 = (br_right - cdraw_left) / (cell_right - bbox_left);
        var scale2 = (br_bottom - cdraw_top) / (cell_bottom - bbox_top);
        if (scale1 < scale2) {
          if (scale2 < scale) scale = scale2;
          var cdraw_bottom = br_bottom + scale * (bbox_bottom - cell_bottom);
        } else {
          if (scale1 < scale) scale = scale1;
          var cdraw_right = br_right + scale * (bbox_right - cell_right);
        }
      }
    }
  }

  if (scale <= 0) {
    // The window is so small that there's no room to draw anything.
    return;
  }

  // Limit the scale to keep cells from being drawn crazy enormous.  Note that
  // we do this after fitting incursions, so the cells will perceptually be
  // centered with the most possible margin on all sides.
  if (scale > 2) scale = 2;

  // Set the canvas_top/left offset so that the cell bounding box is centered
  // within the adjusted cdraw bounding box.
  var bbox_cx = (bbox_left + bbox_right) / 2;
  var bbox_cy = (bbox_top + bbox_bottom) / 2;

  var cdraw_cx = (cdraw_left + cdraw_right) / 2;
  var cdraw_cy = (cdraw_top + cdraw_bottom) / 2;

  this.be.scale = scale;
  this.be.canvas_left = bbox_cx - cdraw_cx / scale;
  this.be.canvas_top = bbox_cy - cdraw_cy / scale;
};

// Functions to convert a cdraw (window) coordinate to a canvas coordinate.
Circuit.prototype.cdraw_to_canvas_x = function(cdraw_x) {
  return cdraw_x / this.be.scale + this.be.canvas_left;
};
Circuit.prototype.cdraw_to_canvas_y = function(cdraw_y) {
  return cdraw_y / this.be.scale + this.be.canvas_top;
};

// Functions to convert a canvas coordinate to a cdraw (window) coordinate.
Circuit.prototype.canvas_to_cdraw_x = function(canvas_x) {
  return (canvas_x - this.be.canvas_left) * this.be.scale;
};
Circuit.prototype.canvas_to_cdraw_y = function(canvas_y) {
  return (canvas_y - this.be.canvas_top) * this.be.scale;
};

// Update the cdraw and cdrag canvas viewports according to the current canvas
// size, offset, and scale.
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

// Handle dragging of the canvas background (panning).
Circuit.prototype.canvas_drag_start = function(x, y) {
  // Record the original mouse coordinates.  Any movement of the mouse relative
  // to this point becomes an equivalent panning of the canvas.
  this.old_drag_x = x;
  this.old_drag_y = y;

  // Force the cursor *everywhere*, even its over something that would normally
  // have its own cursor, and even if it's outside the window.
  $(document.body).addClass('cursor-force-all-scroll');
};

Circuit.prototype.canvas_drag_move = function(x, y) {
  // Since the user made a change to the canvas position, we won't
  // automatically refit it on a window resize.  We don't do this in
  // canvas_drag_start because the user hasn't yet actually moved the canvas,
  // and it may have been a misclick or accidental touch that we should ignore.
  this.be.view_is_fit = false;

  // Turn the change in mouse coordinates into a difference in canvas
  // coordinates.
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

// Handle pinching on the canvas background (zooming).
Circuit.prototype.canvas_pinch_start = function(x1, y1, x2, y2) {
  // Measure the original distance between the user's fingers.
  this.pinch_orig_distance = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));

  // Record the original scale.  Thus, if the user pinches beyond the point the
  // the scale is maxed out, and then returns to the original pinch distance,
  // we'll intuitively return to the original scale rather than immediately
  // zooming out as soon as he starts decreasing the pinch distance.
  this.pinch_orig_scale = this.be.scale;
};

Circuit.prototype.canvas_pinch_move = function(x1, y1, x2, y2) {
  var pinch_distance = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
  var new_scale = (this.pinch_orig_scale *
                   (pinch_distance / this.pinch_orig_distance));
  if (new_scale > 2.0) new_scale = 2.0;

  // rescale() updates the scale while keeping x1,y1 fixed in place on the
  // canvas.  Note that x1,y1 corresponds the user's first finger, which also
  // pans the canvas as it moves, so its intuitive to keep it pointing at that
  // spot during the zoom as well.  In fact, if the user keeps the angle
  // between her fingers constant, the second finger will also continue to
  // point to a fixed spot on the canvas as the pinch/zoom happens.
  this.rescale(x1, y1, new_scale);
};

// There is no canvas_pinch_end function because none is needed.

// This function is called for mousewheel up/down events (zooming).  It also
// gets called for left/right events, but those have no effect if event.deltaY
// is 0.
Circuit.prototype.canvas_mousewheel = function(event) {
  // Ignore events with bucky-key modifiers.  E.g. ctrl-scroll zooms the
  // whole window, so we don't want to also zoom the draw view.
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

  // Each click of the mousewheel corresponds to a factor of 0.85 or 1/0.85.  I
  // presume that the jquery-mousewheel has resolved any oddities with
  // specialized mice that may click differently.
  var new_scale = this.be.scale / Math.pow(0.85, event.deltaY);

  // rescale() updates the scale while keeping the current mouse position fixed
  // in place on the canvas.
  this.rescale(event.pageX, event.pageY, new_scale);
};

// Update the scale while keeping fixed in place the canvas coordinate that
// corresponds to the parameter x,y cdraw/window coordinate.
Circuit.prototype.rescale = function(x, y, new_scale) {
  // Don't change view_is_fit if the scale doesn't actually change.  If the
  // user tries to scale beyond 2.0, new_scale will be greater than 2.0, so
  // we'll continue with the rest of the function, including setting
  // view_is_fit to false.  This seems intuitively right because the user at
  // least *tried* to change the view.
  if (new_scale == this.be.scale) return;

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

// Handle clicks on the zoom control buttons.  The mouse/touch is not in a
// meaningful position for these, so we simply zoom relative to the center of
// the viewable area.
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

// Handle a click on the 'fit' button.
Circuit.prototype.click_zoom_fit = function() {
  this.be.circuit.fit_view();
  this.be.circuit.update_view();
};

// Handle a click on the 'hide info panel' button.
Circuit.prototype.click_info_hide = function() {
  this.info_hidden = true;
  this.be.div_info.css({display: 'none'});
  this.be.div_info_stub.css({display: 'block'});
  this.be.div_main_stub.css({display: 'block'});
  this.resize();
};

// Handle a click on the 'unhide info panel' button.  There are other reasons
// for the info panel to be unhidden, so the meat of the function is performed
// in unhide_info().
Circuit.prototype.click_info_unhide = function() {
  this.unhide_info();
  this.resize();
};

// Unhide the info panel, e.g. because the user requested it or because there
// is important info to display.
Circuit.prototype.unhide_info = function() {
  this.info_hidden = false;
  this.be.div_info_stub.css({display: 'none'});
  this.be.div_main_stub.css({display: 'none'});
  this.be.div_info.css({display: 'block'});
};

// Save data in local storage (if possible).
Circuit.prototype.save_data = function(key, data) {
  try {
    localStorage.setItem(key, data);
    return false;
  }
  catch(e) {
    return true;
  }
};

// Get data from local storage (if possible).
Circuit.prototype.load_data = function(key) {
  try {
    return localStorage.getItem(key);
  }
  catch(e) {
    return undefined;
  }
};

// This is called as soon as the DOM is ready.  This function begins the game.
$(function() {
  new Circuit();
});
