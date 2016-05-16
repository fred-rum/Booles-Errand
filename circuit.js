// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Circuit() {
  ExtendRaphael();

  // this.be is a data structure for "global" values for the whole circuit.
  this.be = {}
  this.be.cdrag = Raphael("cdrag", "100%", "100%");
  this.be.cbox = Raphael("cbox", "100%", "100%");
  this.be.cdraw = Raphael("cdraw", "100%", "100%");

  this.be.window = $(window);
  this.be.div_truth = $("#truth");
  this.be.div_info = $("#info");
  this.be.div_cdrag = $("#cdrag");
  this.be.div_cdraw = $("#cdraw");
  this.be.div_cbox_container = $("#cbox_container");
  this.be.div_cbox = $("#cbox");

  // We want cdrag to be wide enough to overlap the border between
  // cbox and cdraw.  The border is attached to cdraw so that the
  // gaps between the dotted line have a grey color, which better
  // matches the scrollbar that is potentially on the right side of
  // cbox.  cdraw isn't positioned or sized yet, but we can still
  // query it to get its border width.
  var border_width = this.be.div_cdraw.outerWidth( )- this.be.div_cdraw.width();
  this.be.cbox_width = this.be.div_cbox_container.width();
  this.be.cdraw_left = this.be.cbox_width + border_width;
  this.be.div_cdrag.width(this.be.cdraw_left);

  // Other div dimensions are resized dynamically as sppropriate.
  this.be.window.resize($.proxy(this.resize, this)); 
  this.resize();

  // Sizes are based on the "em" size in the document.  Thus,
  // devices with very small pixels (like phones) will scale up as
  // appropriate.
  var em_size = $('#cbox_container').width() / 8;
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

  this.be.sim = new Sim(this.be);
  this.be.drag = new Drag(this.be);

  $("#button-play").click($.proxy(this.be.sim.click_play, this.be.sim));
  $("#button-pause").click($.proxy(this.be.sim.click_pause, this.be.sim));

  this.be.level = new Level(this.be);
  this.be.level.begin(0);
}

Circuit.prototype.resize = function(){
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
  var cdraw_width = this.be.window_width - this.be.cdraw_left;
  var cdraw_height = this.be.window_height - this.be.cdraw_top;
  var cdraw_offset = {
    top: this.be.cdraw_top,
    left: this.be.cbox_width // not cdraw_left; that doesn't include the border
  };
  this.be.div_cdraw.offset(cdraw_offset);
  this.be.div_cdraw.height(cdraw_height);
  this.be.div_cdraw.width(cdraw_width);
};

// This is called as soon as the DOM is ready.
$(function() {
  new Circuit();
});
