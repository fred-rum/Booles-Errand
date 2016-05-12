// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Circuits() {
    ExtendRaphael();

    this.be = {}
    this.be.paper = Raphael("holder", "100%", "100%");
    this.be.sim = new Sim();
    this.be.drag = new Drag(this.be);

    this.be.null_cell = new Cell(this.be, "null", 0, 0);
    this.be.null_io = this.be.null_cell.io["null"];
    this.be.null_io.draw.insertAfter(this.be.null_cell.draw); // ?

    var c0 = new Cell(this.be, "const", 100, 250);
    var c1 = new Cell(this.be, "buf", 200, 200);
    var c2 = new Cell(this.be, "inv", 400, 300);
    var c3 = new Cell(this.be, "and", 400, 200);
    var c4 = new Cell(this.be, "xnor", 400, 100);

    new Wire(this.be, c1.io["o"], c2.io["i"]);
    new Wire(this.be, c2.io["o"], c1.io["i"]);
    new Wire(this.be, c2.io["o"], c3.io["i1"]);

    c0.drive_output(0);
}

// This is called as soon as the DOM is ready.
$(function() {
  new Circuits();
});
