// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Circuit() {
  ExtendRaphael();

  // this.be is a data structure for "global" values for the whole circuit.
  this.be = {}
  this.be.cdrag = Raphael("cdrag", "100%", "100%");
  this.be.cbox = Raphael("cbox", "100%", "100%");
  this.be.cdraw = Raphael("cdraw", "100%", "100%");
  this.bbox = {};

  // An inline SVG sits on the baseline, so if it is 100% of the div
  // height, then the space left for descenders will cause a vertical
  // scrollbar to appear.  Setting display: block instead of inline
  // prevents that.
  $("#cbox svg").attr({"display": "block"});
  $("#cdraw svg").attr({"display": "block"});

  this.be.window = $(window);
  this.be.div_truth = $("#truth");
  this.be.div_info = $("#info");
  this.be.div_cdrag = $("#cdrag");
  this.be.div_cdraw = $("#cdraw");
  this.be.div_cbox_container = $("#cbox_container");
  this.be.div_cbox = $("#cbox");

  // We want cdrag to be wide enough to overlap the border between
  // cbox and cdraw.
  this.be.cbox_width = this.be.div_cbox_container.outerWidth();
  this.be.cdraw_left = this.be.cbox_width;
  this.be.div_cdrag.width(this.be.cdraw_left);

  // Other div dimensions are resized dynamically as sppropriate.
  // The first puzzle level will reflow the text and call this.resize().
  this.canvas_width = 0;
  this.canvas_height = 0;
  this.be.view_width = 0;
  this.be.view_height = 0;

  this.be.window.resize($.proxy(this.resize_event, this)); 

  // Sizes are based on the "em" size in the document.  Thus,
  // devices with very small pixels (like phones) will scale up as
  // appropriate.
  var em_size = this.be.div_cbox_container.width() / 8;
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
  new Cell(this.be, "cdraw", "null", 0, 0);

  this.be.circuit = this;
  this.be.sim = new Sim(this.be);
  this.be.drag = new Drag(this.be);

  $("#button-play").click($.proxy(this.be.sim.click_play, this.be.sim));
  $("#button-pause").click($.proxy(this.be.sim.click_pause, this.be.sim));

  this.be.level = new Level(this.be);
  this.be.level.begin(0);
  this.center_view();
  this.resize(true);
}

Circuit.prototype.resize_event = function() {
  this.resize(true);
};

Circuit.prototype.resize = function(center) {
  this.be.window_width = this.be.window.width();
  this.be.window_height = this.be.window.height();
  this.be.truth_width = this.be.div_truth.outerWidth();

  // Move the div_info to the right of div_truth and decrease its width
  // accordingly.  Note that this may reflow the text and thus change the
  // height of div_info.
  var info_width = this.be.window_width - this.be.truth_width;
  var info_offset = {
    top: 0,
    left: this.be.truth_width
  };
  this.be.div_info.offset(info_offset);
  this.be.div_info.width(info_width);

  // I might have set the div_truth size in the past, so if I want to
  // measure its desired height, I have to set it back to auto first.
  this.be.div_truth.outerHeight("auto");
  this.be.truth_height = this.be.div_truth.outerHeight();

  // Make sure the truth table div is at least as tall as the info div.
  var info_height = this.be.div_info.outerHeight();
  if (this.be.truth_height < info_height) {
    this.be.truth_height = info_height;
    this.be.div_truth.outerHeight(this.be.truth_height);
  }
  this.be.cdraw_top = info_height;

  // Move the cbox below div_truth and decrease its height accordingly.
  var cbox_height = this.be.window_height - this.be.truth_height;
  var cbox_offset = {
    top: this.be.truth_height,
    left: 0
  };
  this.be.div_cbox_container.offset(cbox_offset);
  this.be.div_cbox_container.height(cbox_height);

  // cdrag has the same position and size as cbox.
  this.be.div_cdrag.offset(cbox_offset);
  this.be.div_cdrag.height(cbox_height);

  // Move the cdraw area below div_info and to the right of div_cbox.
  // Also decrease its height and width accordingly.
  var new_view_width = this.be.window_width - this.be.cdraw_left;
  var new_view_height = this.be.window_height - this.be.cdraw_top;

  if (!center){
    // If we don't want the view to change, we adjust the recorded
    // center coordinates to continue to point to the center of the view.
    this.be.view_cx += (this.be.view_width - new_view_width)/2;
    this.be.view_cy += (this.be.view_height - new_view_height)/2;
  }

  this.be.view_width = new_view_width;
  this.be.view_height = new_view_height;

  if (this.be.view_width > this.canvas_width){
    this.canvas_width = this.be.view_width;
    this.be.div_cdraw.width(this.be.view_width);
  }
  if (this.be.view_height > this.canvas_height){
    this.canvas_height = this.be.view_height;
    this.be.div_cdraw.height(this.be.view_height);
  }
  this.adjust_viewbox();
};

Circuit.prototype.add_to_viewbox = function(bbox) {
  var changed = false;

  if (this.bbox.left === undefined){
    this.bbox.left = bbox.left;
    this.bbox.right = bbox.right;
    this.bbox.top = bbox.top;
    this.bbox.bottom = bbox.bottom;
    changed = true;
  } else {
    if (bbox.left < this.bbox.left){
      this.bbox.left = bbox.left;
      changed = true;
    }
    if (bbox.right > this.bbox.right){
      this.bbox.right = bbox.right;
      changed = true;
    }
    if (bbox.top < this.bbox.top){
      this.bbox.top = bbox.top;
      changed = true;
    }
    if (bbox.bottom > this.bbox.bottom){
      this.bbox.bottom = bbox.bottom;
      changed = true;
    }
  }
};

Circuit.prototype.center_view = function() {
  this.be.view_cx = (this.bbox.left + this.bbox.right) / 2;
  this.be.view_cy = (this.bbox.top + this.bbox.bottom) / 2;
  this.adjust_viewbox();
};

Circuit.prototype.adjust_viewbox = function() {
  var canvas_cx = this.canvas_width - this.be.view_width/2;
  var canvas_cy = this.canvas_height - this.be.view_height/2;

  var canvas_left = this.be.view_cx - canvas_cx;
  var canvas_top = this.be.view_cy - canvas_cy;

  this.be.cdraw.setViewBox(canvas_left, canvas_top,
                           this.canvas_width, this.canvas_height);
};

// This is called as soon as the DOM is ready.
$(function() {
  new Circuit();
});
