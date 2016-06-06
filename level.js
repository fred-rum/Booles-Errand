// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Level(be) {
  this.be = be;

  try {
    for (var i = 0; i < this.puzzle.length; i++){
      var key_completed = 'boole.' + this.puzzle[i].name + '.completed';
      this.puzzle[i].completed = localStorage.getItem(key_completed);
    }
  }
  catch(e) {
    // continue
  }

  var html = [];
  html.push('<table class="levels"><tr class="levels" id="uilevels"><td></td><td>&#9733;</td><td><b>Interface lessons only (&#9733;).</b></td></tr>');
  for (var i = 0; i < this.puzzle.length; i++){
    if (this.puzzle[i].section){
      html.push('<tr><td colspan="3"><b>', this.puzzle[i].section, '</b></td></tr>');
    }
    html.push('<tr class="levels" id="level', i, '">');
    html.push('<td><svg id="complete', i, '" display="block" width="1em" height="1em" viewBox="0 0 33 33"></svg></td><td>');
    if (this.puzzle[i].ui) {
      html.push('&#9733;');
    }
    html.push('</td><td>', this.puzzle[i].name, '</td></tr>');
  }
  html.push('</table>');
  $("#levels").html(html.join(''));

  $('#uilevels').click($.proxy(this.click_uilevels, this));
  for (var i = 0; i < this.puzzle.length; i++){
    if (this.puzzle[i].completed) this.mark_complete(i);
    $('#level' + i).click($.proxy(this.click_level, this, i));
  }

  $("#button-main").click($.proxy(this.click_main, this));
  $("#button-main2").click($.proxy(this.click_main, this));
}

Level.prototype.mark_complete = function(level_num) {
  var id = '#complete' + level_num;
  $(id).html('<path d="M7.5,16.5l6,12l12,-24" class="checkmark"/>')
};

Level.prototype.begin = function(level_num) {
  var save_str = undefined;

  if (level_num === undefined){
    var anchor = decodeURI(window.location.hash.substring(1));
    if (anchor != ''){
      var a = anchor.split('?', 2);
      var level_name = a[0];
      if (a.length == 2) save_str = a[1];
      for (var i = 0; i < this.puzzle.length; i++){
        if (this.puzzle[i].name == level_name){
          level_num = i;
          break;
        }
      }
    } else {
      level_num = this.next_level(0);
    }
  }

  if (!level_num) level_num = 0;
  this.level_num = level_num;
  var level = this.level = this.puzzle[level_num];

  if (level.hide === undefined){
    level.hide = new Set();
  } else if (Array.isArray(level.hide)){
    level.hide = new Set(level.hide);
  }

  this.box_cells = {};
  this.be.box_height = this.be.box_spacing;
  if (level.avail === undefined){
    level.avail = ['inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'];
  }
  for (var i = 0; i < level.avail.length; i++){
    var name = level.avail[i];
    if (typeof name == 'string'){
      var cell = this.add_box_cell(name);
    } else {
      cell.update_quantity(name);
      cell.el_qty_text.setAttr('visibility', 'visible');
    }
  }
  this.be.cbox.setViewBox(0, 0, this.be.em_size*8, this.be.box_height);

  this.named_cells = {};
  this.all_cells = [];

  this.be.div_infotxt.html(this.text(level.intro));
  smartquotes(this.be.div_infotxt[0]);
  //this.be.div_infotxt.append('<br>version ' + 33);

  // Get a list of the input and output pins.
  this.input_names = [];
  this.output_names = [];
  for (var cell_name in level.cells){
    var cell_obj = level.cells[cell_name];
    if (cell_obj.type == "input") this.input_names.push(cell_name);
    if (cell_obj.type == "output") this.output_names.push(cell_name);
  }

  // Initialize the truth table with columns for the input and output pins.
  this.init_table();

  // Initialize the cells required by the level while ignoring IO connections.
  for (var cell_name in level.cells){
    var cell_obj = level.cells[cell_name];
    var cell = new Cell(this.be, "cdraw",
                        cell_obj.type,
                        cell_obj.x / 20 * this.be.io_spacing,
                        cell_obj.y / 20 * this.be.io_spacing,
                        cell_name,
                        true);
    this.named_cells[cell_name] = cell;
    this.add_cell(cell);

    if (cell_obj.width) {
      cell.update_width(cell_obj.width);
    }
  }

  // Connect the cell IOs as required by the level.
  for (var cell_name in level.cells){
    var conn_list = level.cells[cell_name].io;
    if (conn_list){
      for (var i = 0; i < conn_list.length; i++){
        var io_name = conn_list[i][0];
        var cell_name2 = conn_list[i][1];
        var io_name2 = conn_list[i][2];
        var unlocked = conn_list[i][3];
        new Wire(this.be,
                 this.named_cells[cell_name].io[io_name],
                 this.named_cells[cell_name2].io[io_name2],
                 false, // pending_del
                 !unlocked); // locked
      }
    }
  }

  // Restore additional cells and wire connections from the save data.
  if (save_str){
    this.decode_save(save_str);
  } else {
    window.location.hash = encodeURI(level.name);
  }
  this.update_widths();

  // Initialize the level to the first row of the table, and
  // correspondingly set up the initial input values and output
  // (expected) values.
  this.cur_seq = 0;
  this.cur_line = 0;
  this.select_seq(0);

  this.be.sim.begin_level(level.hide.has("speed"), this.sequenced);
};

Level.prototype.init_table = function() {
  var level = this.level;
  this.sequenced = false;
  this.row_result = [];
  var html = [];
  if (level.hide.has("truth")){
    // Create the truth table HTML, but hidden.  This is easier than
    // not creating the HTML and trying to prevent the various
    // actions that normally happen in the truth table.
    html.push('<table style="display: none;"><tr>');
  } else {
    html.push('<table class="truth"><tr>');
  }
  this.table_header(html, this.input_names);
  this.table_header(html, this.output_names);
  html.push('<th class="check"></th></tr>');
  var num_rows = 0;
  this.row_seq = [];
  this.row_line = [];
  for (var i = 0; i < level.truth.length; i++){
    if (Array.isArray(level.truth[i])){
      if (level.truth[i].length > 1) this.sequenced = true;
    } else {
      // A non-sequencing table row can be specified without the array,
      // but we force it into array format here.
      level.truth[i] = [level.truth[i]];
    }
    var truth_seq = level.truth[i];
    truth_seq.first_row = num_rows;
    for (var j = 0; j < truth_seq.length; j++){
      var last_line = (j == truth_seq.length - 1);
      html.push('<tr class="truthbody" id="row', num_rows, '">');
      this.table_line(html, this.input_names, truth_seq[j], last_line);
      this.table_line(html, this.output_names, truth_seq[j], last_line);
      html.push('<td class="check"><svg id="check', num_rows, '" display="block" width="1em" height="1em" viewBox="0 0 33 33"></svg></td></tr>');
      this.row_result.push(undefined);
      this.row_seq.push(i);
      this.row_line.push(j);
      num_rows++;
    }
  }
  html.push('</table>');
  $("#truthtable").html(html.join(''));

  for (var i = 0; i < num_rows; i++){
    var row = $('#row' + i);
    row.hover($.proxy(this.row_enter, this, i),
              $.proxy(this.row_leave, this, i));
    row.click($.proxy(this.row_click, this, i));
    row.dblclick($.proxy(this.row_dblclick, this, i));
    this.be.bdrag.drag(row, this, 'truth',
                       {dblclick: this.row_dblclick});
  }
};

Level.prototype.table_header = function(html, port_names) {
  for (var i = 0; i < port_names.length; i++){
    html.push('<th');
    this.push_padding(html, i, port_names.length, true);
    html.push('>', port_names[i].toUpperCase(), '</th>');
  }
};

Level.prototype.table_line = function(html, port_names, truth_line, last_line) {
  for (var i = 0; i < port_names.length; i++){
    html.push('<td');
    this.push_padding(html, i, port_names.length, last_line);
    html.push('>');
    if (truth_line[port_names[i]] !== undefined){
      html.push(truth_line[port_names[i]]);
    }
    html.push('</td>');
  }
};

Level.prototype.push_padding = function(html, i, num, last_line) {
  var tdb = last_line ? ' tdb' : '';
  if (i == 0){
    if (i < num-1){
      html.push(' class="tdl', tdb, '"');
    } else {
      html.push(' class="tdlr', tdb, '"');
    }
  } else if (i == num-1){
    html.push(' class="tdr', tdb, '"');
  } else if (last_line){
    html.push(' class="tdb"');
  }
};

Level.prototype.row_enter = function(row, event) {
  this.hover_row = row;
  var old_row = this.cur_row();
  if (row === this.row_allows_simple_click){
    if (row != old_row){
      $("#row" + row).css({"background-color": "#ddd"});
    }
  } else {
    var seq = this.row_seq[row];
    for (var i = 0; i < this.level.truth[seq].length; i++) {
      var i_row = this.level.truth[seq].first_row + i;
      if (i_row != old_row){
        $("#row" + i_row).css({"background-color": "#ddd"});
      }
    }
  }
};

Level.prototype.row_leave = function(row, event) {
  this.hover_row = undefined;
  var old_row = this.cur_row();
  for (var i = 0; i < this.row_result.length; i++){
    if (i != old_row) $("#row" + i).css({"background-color": ""});
  }
};

Level.prototype.update_hover = function() {
  if (this.hover_row !== undefined){
    var row = this.hover_row;
    this.row_leave(row);
    this.row_enter(row);
  }
};

Level.prototype.row_click = function(row, event) {
  var old_row = this.cur_row();
  if (row === this.row_allows_simple_click){
    if (row == old_row + 1){
      // The user is selecting the next line of a sequence, and the
      // current line is complete and passed.  Go ahead and advance to
      // the next line, rather than starting the sequence over.
      this.next_line();
    } else {
      // The user is re-selecting the current line of a sequence after
      // previously selecting it.  This is probably a double click, so
      // this click is ignored.
    }
  } else {
    this.reset_sim();
    this.select_seq(this.row_seq[row]);
  }
};

Level.prototype.row_dblclick = function(row, event) {
  this.be.sim.click_play();
};

Level.prototype.cur_row = function() {
  return this.level.truth[this.cur_seq].first_row + this.cur_line;
}

Level.prototype.select_row = function(row) {
  $("#row" + this.cur_row()).css({"background-color": ""});
  $("#row" + row).css({"background-color": "#ff8"});
  this.cur_seq = this.row_seq[row];
  this.cur_line = this.row_line[row];
  this.update_hover();
  this.update_pins();
};

Level.prototype.select_seq = function(seq) {
  this.reset_sim();
  this.select_row(this.level.truth[seq].first_row);
};

Level.prototype.next_line = function() {
  this.start();
  this.select_row(this.cur_row() + 1);
};

Level.prototype.update_pins = function() {
  for (var i = 0; i < this.input_names.length; i++){
    // We want the value to appear right away on the IO stub, so we
    // push it all the way through to the input pin's output port.
    // This also registers the value for propagation on the next wire
    // (if any).
    var cell = this.named_cells[this.input_names[i]];
    cell.propagate_value();
    cell.fit_input_text();
  }
  for (var i = 0; i < this.output_names.length; i++){
    var cell = this.named_cells[this.output_names[i]];
    cell.calc_output();
    cell.fit_output_text();
  }
};

Level.prototype.reset_sim = function() {
  this.row_allows_simple_click = false;
  this.update_hover();
  this.be.sim.reset();
  for (var i = 0; i < this.all_cells.length; i++){
    this.all_cells[i].reset();
  }
};

Level.prototype.add_box_cell = function(type) {
  var cell = new Cell(this.be, "cbox", type, 0, 0);
  this.box_cells[type] = cell;
  var bbox = cell.bbox;
  var cx = (this.be.em_size*4) - bbox.x - bbox.width/2; // align center
  var cy = this.be.box_height - bbox.y; // align top edge
  cell.move(cx, cy);
  this.be.box_height += bbox.height + this.be.box_spacing;
  return cell;
};

Level.prototype.update_box_quantity = function(type, change) {
  var cell = this.be.level.box_cells[type];
  if (cell === undefined) return false;
  if (cell.quantity !== undefined){
    if (cell.quantity + change < 0) return false;
    cell.update_quantity(cell.quantity + change);
  }
  return true;
};

Level.prototype.value = function(name) {
  var truth = this.puzzle[this.level_num].truth;
  return truth[this.cur_seq][this.cur_line][name];
};

Level.prototype.add_cell = function(cell) {
  this.all_cells.push(cell);
};

Level.prototype.remove_cell = function(cell) {
  for (var i = 0; i < this.all_cells.length; i++){
    if (cell == this.all_cells[i]){
      this.all_cells.splice(i, 1);
      return;
    }
  }
};

Level.prototype.update_url = function() {
  var save = [this.level.name];

  for (var i = 0; i < this.all_cells.length; i++) {
    if (!this.all_cells[i].locked) break;
  }
  save.push('?1s', i);

  for (var i = 0; i < this.all_cells.length; i++) {
    var emitted_cell = false;
    var cell = this.all_cells[i];
    if (!cell.locked){
      save.push(';', Math.round(cell.x / this.be.io_spacing * 20),
                ',', cell.type,
                ',', Math.round(cell.y / this.be.io_spacing * 20));
      emitted_cell = true;
    }
    for (var port_name in cell.io) {
      var io = cell.io[port_name];
      if (io.type == 'output'){
        for (var j = 0; j < io.w.length; j++) {
          var wire = io.w[j];
          if (!wire.locked) {
            if (emitted_cell) {
              save.push('+');
            } else {
              save.push('-', i, ',');
            }
            save.push(port_name,
                      ',', this.all_cells.indexOf(wire.i.cell),
                      ',', wire.i.name);
          }
        }
      }
    }
  }

  var hash_str = save.join('');
  window.location.hash = encodeURI(hash_str);
};

Level.prototype.decode_save = function(save_str) {
  try {
    var ex_version_skip = /^1s([0-9]+)/;
    var ex_cell = /^;(-?[0-9]+),([a-z][a-z0-9]*),(-?[0-9]+)/;
    var ex_plus = /^\+([a-z][a-z0-9]*),([0-9]+),([a-z][a-z0-9]*)/;
    var ex_minus = /^-([0-9]+),([a-z][a-z0-9]*),([0-9]+),([a-z][a-z0-9]*)/;

    var m;
    var wires = [];

    if (m = ex_version_skip.exec(save_str)){
      var skip = Number(m[1]);
      if (skip != this.all_cells.length) throw "wrong skip";
      save_str = save_str.substring(m[0].length);
    } else {
      throw "bad version/skip string";
    }

    while (save_str != ''){
      if (m = ex_cell.exec(save_str)){
        var x = Number(m[1]);
        var type = m[2];
        var y = Number(m[3]);
        if (!this.update_box_quantity(type, -1)) {
          throw "exhausted cell type: " + type
        }
        this.add_cell(new Cell(this.be, "cdraw", type,
                               x / 20 * this.be.io_spacing,
                               y / 20 * this.be.io_spacing));

        save_str = save_str.substring(m[0].length);

        while (save_str != ''){
          if (m = ex_plus.exec(save_str)){
            wires.push({o_cell: this.all_cells.length-1,
                        o_port: m[1],
                        i_cell: Number(m[2]),
                        i_port: m[3]});
            save_str = save_str.substring(m[0].length);
          } else {
            break;
          }
        }
      } else if (m = ex_minus.exec(save_str)){
        wires.push({o_cell: Number(m[1]),
                    o_port: m[2],
                    i_cell: Number(m[3]),
                    i_port: m[4]});
        save_str = save_str.substring(m[0].length);
      } else {
        throw "not recognized: " + save_str;
      }
    }

    for (var i = 0; i < wires.length; i++){
      var w = wires[i];
      if (w.o_cell >= this.all_cells.length) throw "bad o_cell #: " + w.o_cell;
      if (w.i_cell >= this.all_cells.length) throw "bad i_cell #: " + w.i_cell;
      var o_cell = this.all_cells[w.o_cell];
      var i_cell = this.all_cells[w.i_cell];
      var io_o = o_cell.io[w.o_port];
      var io_i = i_cell.io[w.i_port];
      if (!io_o) throw "bad o port: " + w.o_port;
      if (!io_i) throw "bad i port: " + w.i_port;
      if (io_i.w.length > 0){
        if (io_i.w[0].o == io_o){
          // If the save data duplicates a locked wire, we silently
          // discard it without throwing an exception.
        } else {
          throw "input port busy: " + w.i_port;
        }
      } else {
        var w = new Wire(this.be, io_o, io_i);
        var failure = this.update_widths();
        if (failure) {
          w.remove();
          throw failure;
        }
      }
    }
  }
  catch (ex) {
    //onsole.log(ex);
    //onsole.log("remaining:", save_str)
    // Exit without decoding any more.
  }
};

Level.prototype.click_play = function() {
  this.row_allows_simple_click = false;
  this.update_hover();
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
  if (this.cleaning_up) return; // Ignore circuit changes while cleaning up.

  this.row_allows_simple_click = false;
  this.select_seq(this.cur_seq);
  this.update_hover();

  for (var i = 0; i < this.row_result.length; i++){
    this.record_result(i, undefined);
  }

  this.be.sim.start();
};

Level.prototype.done = function(fresh_play) {
  var result = true;
  for (var cell_name in this.named_cells){
    if (this.named_cells[cell_name].type == "output"){
      var cell_result = this.named_cells[cell_name].done_check();
      result = result && cell_result;
    }
  }
  this.record_result(this.cur_row(), result);

  if (!result) return;

  if (this.cur_line < this.level.truth[this.cur_seq].length - 1){
    // Advance to the next line of the sequence if not pause-at-line.
    this.be.sim.pass_row($.proxy(this.next_line, this), fresh_play, 'line');
    if (this.be.sim.paused()){
      // Attempting to continue to the next line triggered pause-at-line.
      // In that case, clicking on the next line should advance simulation
      // to that line, rather than resetting to the beginning of the sequence.
      this.row_allows_simple_click = this.cur_row() + 1;
      this.update_hover();
    }
    return;
  }

  // Look for the first failure after the current sequence, if any;
  // otherwise, the first failure overall.
  var first_failed_seq = null;
  for (var i = 0; i < this.row_result.length; i++){
    var seq = this.row_seq[i];
    if (!this.row_result[i] &&
        ((first_failed_seq === null) ||
         ((first_failed_seq < this.cur_seq) && (seq >= this.cur_seq)))){
      first_failed_seq = seq;
    }
  }

  // There is a failed sequence, so advance to that sequence.
  if (first_failed_seq !== null){
    this.be.sim.pass_row($.proxy(this.select_seq, this, first_failed_seq),
                         fresh_play, 'seq');
    return;
  }

  // There are no failed rows/sequences.
  this.be.sim.click_pause();

  this.level.completed = true;
  try {
    var key_completed = 'boole.' + this.level.name + '.completed';
    localStorage.setItem(key_completed, "true");
  }
  catch(e) {
    // continue
  }
  this.mark_complete(this.level_num);

  var outro = this.text(this.level.outro);
  var next = this.next_level(this.level_num + 1);
  if (this.ui_only){
    if (next){
      var html = outro + '<p><button type="button" id="next-puzzle">Next interface lesson</button></p>';
      this.be.div_infotxt.html(html);
      $("#next-puzzle").click($.proxy(this.change_level, this, next));
    } else {
      var html = outro + '<p>You\'ve completed all of the interface lessons.  Are you ready for some puzzles? <button type="button" id="next-main">Main menu</button></p>';
      this.be.div_infotxt.html(html);
      $("#next-main").click($.proxy(this.click_main, this));
    }
  } else { // !this.ui_only
    if (next){
      var html = outro + '<p><button type="button" id="next-puzzle">Next puzzle</button></p>';
      this.be.div_infotxt.html(html);
      $("#next-puzzle").click($.proxy(this.change_level, this, next));
    } else {
      var html = outro + '<p>Congratulations!  You\'ve completed the last puzzle! <button type="button" id="next-main">Main menu</button></p>';
      this.be.div_infotxt.html(html);
      $("#next-main").click($.proxy(this.click_main, this));
    }
  }
  smartquotes(this.be.div_infotxt[0]);
  this.be.circuit.resize(false);
  this.be.circuit.update_view();
};

Level.prototype.change_level = function(level_num) {
  this.cleaning_up = true;

  for (var i = 0; i < this.all_cells.length; i++){
    this.all_cells[i].remove();
  }

  this.be.sim.click_pause();
  this.be.sim.reset();

  for (var type in this.box_cells) {
    this.box_cells[type].remove();
  }

  this.cleaning_up = false;

  this.be.circuit.begin_level(level_num);
};

Level.prototype.record_result = function(row, result) {
  this.row_result[row] = result;

  var id = "#check" + row;
  if (result === undefined){
    $(id).html('');
  } else if (result){
    $(id).html('<path d="M7.5,16.5l6,12l12,-24" class="checkmark"/>');
  } else {
    $(id).html('<path d="M4.5,4.5l24,24m0,-24l-24,24" class="xmark"/>');
  }
};

Level.prototype.click_main = function() {
  this.be.sim.click_pause();
  $("#level" + this.level_num).css({"background-color": "#ff8"});
  $("#main_container").css({display: "block"});

  this.ui_only = true;
  if (this.next_level(0) === undefined) $("#uilevels").remove();
  this.ui_only = false;
};

Level.prototype.click_level = function(level_num, event) {
  $("#main_container").css({display: "none"});
  $("#level" + this.level_num).css({"background-color": ""});

  if (level_num === this.level_num){
    // The user selected the same level he was previously on.
    // Return to the level without resetting it.
    return;
  } else {
    this.change_level(level_num);
  }
};

Level.prototype.click_uilevels = function(event) {
  // If the button for "click_uilevels" is present, then there must
  // be UI levels available.
  this.ui_only = true;
  this.click_level(this.next_level(0), event);
};

Level.prototype.next_level = function(start) {
  for (var i = start; i < this.puzzle.length; i++){
    if ((this.puzzle[i].ui || !this.ui_only) &&
        !this.puzzle[i].completed) return i;
  }
  return undefined;
};

Level.prototype.update_widths = function(pending) {
  for (var i = 0; i < this.all_cells.length; i++){
    var cell = this.all_cells[i];
    if (((cell.type == 'input') || (cell.type == 'condenser')) &&
        (cell.width > 1)){
      var failure = cell.propagate_width(cell.width);
      if (failure) break;
    }
  }

  // Even if there's a failure, we still perform this step in order to
  // clear the prospective_width values.
  for (var i = 0; i < this.all_cells.length; i++){
    var cell = this.all_cells[i];
    if (!cell.locked && (cell.type != 'condenser')) {
      var new_width = cell.prospective_width || 1;
      var old_width = (pending && cell.pending_width) || cell.width;
      if (this.update_box_quantity(cell.type, old_width - new_width)){
        cell.update_width(new_width, pending);
      } else {
        if (!failure) failure = 'exhausted cells';
      }
      cell.prospective_width = undefined;
    }
  }

  return failure;
};

Level.prototype.commit_widths = function() {
  for (var i = 0; i < this.all_cells.length; i++){
    var cell = this.all_cells[i];
    if (!cell.locked && (cell.type != 'condenser')) {
      cell.update_width(cell.pending_width);
    }
    cell.pending_width = undefined;
  }
};

Level.prototype.text = function(str) {
  return (str || '').replace(/&play;/g,'<svg style="vertical-align:middle" width="1em" height="1em" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="20" ry="20" class="playborder"/><path d="M37,25v50l30,-25z" class="playcenter"/></svg>');
};
