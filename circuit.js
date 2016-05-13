// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Circuits() {
    ExtendRaphael();

    // this.be is a data structure for "global" values for the whole circuit.
    this.be = {}
    this.be.paper = Raphael("holder", "100%", "100%");

    // Sizes are based on the "em" size in the document.  Thus,
    // devices with very small pixels (like phones) will scale up as
    // appropriate.
    var em_size = $('.box').width() / 8;
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

    // Create Z-level references
    this.be.z_cell = this.be.paper.path("M0,0");
    this.be.z_wire = this.be.paper.path("M0,0");
    this.be.z_io = this.be.paper.path("M0,0");
    this.be.z_handle = this.be.paper.path("M0,0");

    // null cell
    new Cell(this.be, "null");


    this.be.sim = new Sim();
    this.be.drag = new Drag(this.be);

    var c0 = new Cell(this.be, "const", 1, 2);
    var c1 = new Cell(this.be, "buf", 2, 0);
    var c2 = new Cell(this.be, "inv", 2, 2);
    var c3 = new Cell(this.be, "and", 3, 1);
    var c4 = new Cell(this.be, "xnor", 3, 0);

    new Wire(this.be, c1.io["o"], c2.io["i"]);
    new Wire(this.be, c2.io["o"], c1.io["i"]);
    new Wire(this.be, c2.io["o"], c3.io["i1"]);

    c0.drive_output(0);
}

// This is called as soon as the DOM is ready.
$(function() {
  new Circuits();
});
