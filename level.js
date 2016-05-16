function Level(be) {
  this.be = be;
}

Level.prototype.begin = function(level_num) {
  this.level_num = level_num;
  var level = this.level = this.puzzle[level_num];

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

  this.cells = {};

  this.be.div_info.html(level.intro || "");
  this.be.circuit.resize();

  if (level.cells){
    // First, initialize the cells while ignoring IO connections.
    for (var cell_name in level.cells){
      var cell_obj = level.cells[cell_name];
      var cell = new Cell(this.be, "cdraw",
                          cell_obj.type,
                          cell_obj.x,
                          cell_obj.y,
                          cell_name);
      this.cells[cell_name] = cell;
    }

    // Now connect IOs according to the cell data.
    for (var cell_name in level.cells){
      var conn_list = level.cells[cell_name].io;
      if (conn_list){
        for (var i = 0; i < conn_list.length; i++){
          var io_name = conn_list[i][0];
          var cell_name2 = conn_list[i][1];
          var io_name2 = conn_list[i][2];
          new Wire(this.be,
                   this.cells[cell_name].io[io_name],
                   this.cells[cell_name2].io[io_name2],
                   false);
        }
      }
    }
  }
};

Level.prototype.add_box_cell = function(name) {
  var c = new Cell(this.be, "cbox", name, 0, 0);
  var bbox = c.el_cell.getBBox(false);
  var cx = (this.be.cbox_width/2) - bbox.x - bbox.width/2; // align center
  var cy = this.box_height - bbox.y; // align top edge
  c.move(cx, cy);
  this.box_height += bbox.height + this.be.box_spacing;
};

Level.prototype.value = function(name) {
  var truth = this.puzzle[this.level_num].truth;
  return truth[0][name][0];
};

Level.prototype.done = function() {
  var result = true;
  for (var cell_name in this.cells){
    if (this.cells[cell_name].type == "output"){
      result = result && this.cells[cell_name].done_check();
    }
  }

  if (result){
    this.be.div_info.html(this.level.outro || "");
    this.be.circuit.resize();
  }
};
