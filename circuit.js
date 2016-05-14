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
  this.be.div_info = $("#msgs");
  this.be.div_cdrag = $("#cdrag");
  this.be.div_cdraw = $("#cdraw");
  this.be.div_cbox_container = $("#cbox_container");
  this.be.div_cbox = $("#cbox");

  // cbox_container is a fixed (not resizable) width, but the CSS
  // can't specify that the cdrag div is "8em+1px".  So we fix the
  // cdrag width once, and then never have to touch it again.
  this.be.cbox_width = this.be.div_cbox_container.outerWidth();
  this.be.div_cdrag.width(this.be.cbox_width);

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

  this.be.sim = new Sim();
  this.be.drag = new Drag(this.be);

  $("#button-play").click($.proxy(this.be.sim.click_play, this.be.sim));
  $("#button-pause").click($.proxy(this.be.sim.click_pause, this.be.sim));


  this.box_height = this.be.box_spacing;
  this.add_box_cell("buf");
  this.add_box_cell("inv");
  this.add_box_cell("and");
  this.add_box_cell("nand");
  this.add_box_cell("or");
  this.add_box_cell("nor");
  this.add_box_cell("xor");
  this.add_box_cell("xnor");
  this.add_box_cell("const");
  this.be.div_cbox.height(this.box_height);

  var c0 = new Cell(this.be, "cdraw", "const", 100, 300);
  var c1 = new Cell(this.be, "cdraw", "buf", 200, 100);
  var c2 = new Cell(this.be, "cdraw", "inv", 200, 300);
  var c3 = new Cell(this.be, "cdraw", "and", 300, 200);
  var c4 = new Cell(this.be, "cdraw", "xnor", 300, 100);

  new Wire(this.be, c1.io["o"], c2.io["i"]);
  new Wire(this.be, c2.io["o"], c1.io["i"]);
  new Wire(this.be, c2.io["o"], c3.io["i1"]);
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
  var cdraw_width = this.be.window_width - this.be.cbox_width;
  var cdraw_height = this.be.window_height - this.be.cdraw_top;
  var cdraw_offset = {
    top: this.be.cdraw_top,
    left: this.be.cbox_width
  };
  this.be.div_cdraw.offset(cdraw_offset);
  this.be.div_cdraw.height(cdraw_height);
  this.be.div_cdraw.width(cdraw_width);
};

Circuit.prototype.add_box_cell = function(name) {
  var c = new Cell(this.be, "cbox", name, 0, 0);
  var bbox = c.el_cell.getBBox(false);
  var cx = (this.be.cbox_width/2) - bbox.x - bbox.width/2; // align center
  var cy = this.box_height - bbox.y; // align top edge
  c.move(cx, cy);
  this.box_height += bbox.height + this.be.box_spacing;
};

// This is called as soon as the DOM is ready.
$(function() {
  new Circuit();
});
