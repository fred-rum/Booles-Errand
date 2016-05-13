// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Circuit() {
  ExtendRaphael();

  // this.be is a data structure for "global" values for the whole circuit.
  this.be = {}
  this.be.cdrag = Raphael("cdrag", "100%", "100%");
  this.be.cbox = Raphael("cbox", "100%", "100%");
  this.be.cdraw = Raphael("cdraw", "100%", "100%");

  this.be.div_cdraw = $("#cdraw");
  this.be.div_cdrag = $("#cdrag");
  this.be.div_msgs = $("#msgs");
  this.be.div_cbox_container = $("#cbox_container");
  this.be.div_cbox = $("#cbox");
  $(window).resize($.proxy(this.resize, this)); 
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
  new Cell(this.be, "cdraw", "null");


  this.be.sim = new Sim();
  this.be.drag = new Drag(this.be);

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

  var c0 = new Cell(this.be, "cdraw", "const", 1, 2);
  var c1 = new Cell(this.be, "cdraw", "buf", 2, 0);
  var c2 = new Cell(this.be, "cdraw", "inv", 2, 2);
  var c3 = new Cell(this.be, "cdraw", "and", 3, 1);
  var c4 = new Cell(this.be, "cdraw", "xnor", 3, 0);

  new Wire(this.be, c1.io["o"], c2.io["i"]);
  new Wire(this.be, c2.io["o"], c1.io["i"]);
  new Wire(this.be, c2.io["o"], c3.io["i1"]);

  c0.drive_output(0);
}

Circuit.prototype.resize = function(){
  var overall_width = this.be.div_cdrag.width();
  var overall_height = this.be.div_cdrag.height();
  this.be.cdraw_left = this.be.div_cbox_container.outerWidth();
  this.be.cdraw_top = this.be.div_msgs.outerHeight();
  this.be.cdraw_width = overall_width - this.be.cdraw_left;
  this.be.cdraw_height = overall_height - this.be.cdraw_top;
  var cbox_offset = {
    top: this.be.cdraw_top,
    left: 0
  };
  this.be.div_cbox_container.offset(cbox_offset);
  this.be.div_cbox_container.height(overall_height - this.be.cdraw_top);
  var cdraw_offset = {
    top: this.be.cdraw_top,
    left: this.be.cdraw_left
  };
  this.be.div_cdraw.offset(cdraw_offset);
  this.be.div_cdraw.height(this.be.cdraw_height);
  this.be.div_cdraw.width(this.be.cdraw_width);
};

Circuit.prototype.add_box_cell = function(name) {
  var c = new Cell(this.be, "cbox", name, 0, 0);
  var bbox = c.el_cell.getBBox(false);
  var cx = (this.be.cdraw_left/2) - bbox.x - bbox.width/2; // align center
  var cy = this.box_height - bbox.y; // align top edge
  c.move(cx, cy);
  this.box_height += bbox.height + this.be.box_spacing;
};

// This is called as soon as the DOM is ready.
$(function() {
  new Circuit();
});
