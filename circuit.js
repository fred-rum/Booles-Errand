// Copyright 2016 Christopher P. Nelson - All rights reserved.

function Circuits() {
    ExtendRaphael();

    this.paper = Raphael("holder", "100%", "100%");

    Cell.prototype.paper = this.paper;
    Io.prototype.paper = this.paper;
    Wire.prototype.paper = this.paper;

    Io.prototype.drag = new Drag();

    var null_cell = new Cell("null", 0, 0);
    var null_io = null_cell.io["null"];
    null_io.draw.insertAfter(null_cell.draw);
    Cell.prototype.null_cell = null_cell;
    Wire.prototype.null_io = null_cell.io["null"];
    Drag.prototype.null_io = null_cell.io["null"];

    var c0 = new Cell("const", 100, 250);
    var c1 = new Cell("buf", 200, 200);
    var c2 = new Cell("inv", 400, 300);
    var c3 = new Cell("and", 400, 200);
    var c4 = new Cell("nor", 400, 100);

    new Wire(c1.io["o"], c2.io["i"]);
    new Wire(c2.io["o"], c1.io["i"]);
    new Wire(c2.io["o"], c3.io["i1"]);

    var sim = new Sim();
    c0.drive_output(0);
    sim.start();
}

var circuits;
$(function() {
  circuits = new Circuits();
});
