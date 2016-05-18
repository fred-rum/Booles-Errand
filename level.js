// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Level(be) {
  this.be = be;
}

Level.prototype.begin = function(level_num) {
  if (level_num === undefined){
    level_num = 0;
    var anchor = decodeURI(window.location.hash.substring(1));
    for (var i = 0; i < this.puzzle.length; i++){
      if (this.puzzle[i].name == anchor){
        level_num = i;
        break;
      }
    }
  }

  this.level_num = level_num;
  var level = this.level = this.puzzle[level_num];
  window.location.hash = encodeURI(level.name);
  this.truth_row = 0;

  this.box_cells = [];
  this.box_height = this.be.box_spacing;
  if (level.avail === undefined){
    level.avail = ['buf', 'inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor',
                   'const'];
  }
  for (var i = 0; i < level.avail.length; i++){
    var name = level.avail[i];
    if (typeof name == 'string')
      this.add_box_cell(name);
  }
  this.be.div_cbox.height(this.box_height);

  this.named_cells = {};
  this.all_cells = [];

  this.be.div_info.html(level.intro || "");

  var input_names = [];
  var output_names = [];

  if (level.cells){
    // First, initialize the cells while ignoring IO connections.
    for (var cell_name in level.cells){
      var cell_obj = level.cells[cell_name];
      if ((cell_obj.type == "input") || (cell_obj.type == "output")){
        // Other cells can be locked in puzzle.js, but I/O cells are
        // *always* locked.
        cell_obj.locked = true;
      }
      var cell = new Cell(this.be, "cdraw",
                          cell_obj.type,
                          cell_obj.x,
                          cell_obj.y,
                          cell_name,
                          cell_obj.locked);
      this.named_cells[cell_name] = cell;
      this.add_cell(cell);
      if (cell_obj.type == "input") input_names += cell_name;
      if (cell_obj.type == "output") output_names += cell_name;
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
                   this.named_cells[cell_name].io[io_name],
                   this.named_cells[cell_name2].io[io_name2],
                   false);
        }
      }
    }
  }
  this.input_names = input_names;
  this.output_names = output_names;

  if (level.truth){
    this.result = [];
    var html = [];
    html.push('<table><tr>');
    this.table_header(html, input_names);
    this.table_header(html, output_names);
    html.push('<th class="check"></th></tr>');
    for (var i = 0; i < level.truth.length; i++){
      html.push('<tr class="truthbody" id="row', i, '">');
      this.table_row(html, input_names, level.truth[i]);
      this.table_row(html, output_names, level.truth[i]);
      html.push('<td class="check"><svg id="check', i, '" display="block" width="1em" height="1em" viewBox="0 0 33 33"></svg></td></tr>');

      this.result.push(undefined);
    }
    html.push('</table>');
    $("#truthtable").html(html.join(''));

    for (var i = 0; i < level.truth.length; i++){
      $('#row' + i).click($.proxy(this.row_click, this, i));
    }

    this.select_row(0);
  }
};

Level.prototype.table_header = function(html, port_names) {
  for (var i = 0; i < port_names.length; i++){
    html.push('<th');
    this.push_padding(html, i, port_names.length);
    html.push('>', port_names[i].toUpperCase(), '</th>');
  }
};

Level.prototype.table_row = function(html, port_names, truth_row) {
  for (var i = 0; i < port_names.length; i++){
    html.push('<td');
    this.push_padding(html, i, port_names.length);
    html.push('>', truth_row[port_names[i]][0], '</td>');
  }
};

Level.prototype.push_padding = function(html, i, num) {
  if (i == 0){
    if (i < num-1){
      html.push(' class="tdl"');
    } else {
      html.push(' class="tdlr"');
    }
  } else if (i == num-1){
    html.push(' class="tdr"');
  }
};

Level.prototype.row_click = function(row, event) {
  this.select_row(row);
};

Level.prototype.select_row = function(row) {
  $("#row" + this.truth_row).css({"background-color": ""});
  this.truth_row = row;
  $("#row" + this.truth_row).css({"background-color": "#ff8"});
  this.reset_sim();
  for (var i = 0; i < this.input_names.length; i++){
    var cell = this.named_cells[this.input_names[i]];
    cell.update_value();
    cell.fit_input_text();
  }
  for (var i = 0; i < this.input_names.length; i++){
    var cell = this.named_cells[this.output_names[i]];
    cell.fit_output_text();
  }
};

Level.prototype.reset_sim = function() {
  this.be.sim.reset();
  for (var i = 0; i < this.all_cells.length; i++){
    this.all_cells[i].reset();
  }
};

Level.prototype.add_box_cell = function(name) {
  var c = new Cell(this.be, "cbox", name, 0, 0);
  this.box_cells.push(c);
  var bbox = c.el_cell.getBBox(false);
  var cx = (this.be.cbox_width/2) - bbox.x - bbox.width/2; // align center
  var cy = this.box_height - bbox.y; // align top edge
  c.move(cx, cy);
  this.box_height += bbox.height + this.be.box_spacing;
};

Level.prototype.value = function(name) {
  var truth = this.puzzle[this.level_num].truth;
  return truth[this.truth_row][name][0];
};

Level.prototype.add_cell = function(cell) {
  cell.calc_bbox();
  this.all_cells.push(cell);
};

Level.prototype.remove_cell = function(cell) {
  for (var i = 0; i < this.all_cells.length; i++){
    if (cell == this.all_cells[i]){
      this.all_cells.splice(i, 1);
    }
  }
};

Level.prototype.start = function() {
  // While the circuit is running, we mark all check pins as pending
  // to avoid confusing the user (even if we're sure of the final
  // value).
  for (var cell_name in this.named_cells){
    if (this.named_cells[cell_name].type == "output"){
      this.named_cells[cell_name].check_pending();
    }
  }
};

Level.prototype.circuit_changed = function() {
  for (var i = 0; i < this.result.length; i++){
    this.record_result(i, undefined);
  }

  this.be.sim.start();
};

Level.prototype.done = function() {
  var result = true;
  for (var cell_name in this.named_cells){
    if (this.named_cells[cell_name].type == "output"){
      var cell_result = this.named_cells[cell_name].done_check()
      result = result && cell_result;
    }
  }
  this.record_result(this.truth_row, result);

  if (result){
    // Look for the first failure after the current truth_row, if any;
    // otherwise, the first failure overall.
    var first_failure = null;
    for (var i = 0; i < this.result.length; i++){
      if (!this.result[i] &&
          ((first_failure === null) ||
           ((first_failure < this.truth_row) && (i >= this.truth_row)))){
        first_failure = i;
      }
    }

    if (first_failure !== null){
      this.select_row(first_failure);
    } else {
      var outro = this.level.outro || ""
      if (this.level_num < this.puzzle.length-1){
        var html = outro + '<button id="next-level">Next level</button>';
        this.be.div_info.html(html);
        $("#next-level").click($.proxy(this.change_level, this,
                                       this.level_num+1));
      } else {
        var html = outro + '<p>That\'s all the puzzles!</p>';
        this.be.div_info.html(html);
      }
      this.be.circuit.resize(false);
    }
  }
};

Level.prototype.change_level = function(level_num) {
  for (var i = 0; i < this.all_cells.length; i++){
    this.all_cells[i].remove();
  }
  this.be.sim.click_pause();
  this.be.sim.reset();

  for (var i = 0; i < this.box_cells.length; i++){
    this.box_cells[i].remove();
  }

  this.be.circuit.begin_level(level_num);
};

Level.prototype.record_result = function(row, result) {
  this.result[row] = result;

  var id = "#check" + row;
  if (result === undefined){
    $(id).html('');
  } else if (result){
    $(id).html('<path d="M7.5,16.5l6,12l12,-24" class="checkmark"/>');
  } else {
    $(id).html('<path d="M4.5,4.5l24,24m0,-24l-24,24" class="xmark"/>');
  }
};
