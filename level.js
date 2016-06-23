// Copyright 2016 Chris Nelson - All rights reserved.

'use strict';

function Level(be) {
  this.be = be;

  for (var i = 0; i < this.puzzle.length; i++) {
    var key = 'boole.' + this.puzzle[i].name + '.completed';
    this.puzzle[i].completed = this.be.circuit.load_data(key);
  }

  var html = [];
  html.push('<table class="levels"><tr><td></td><td colspan="2">&#9733; <b>= Interface lessons</b></td></tr>');
  for (var i = 0; i < this.puzzle.length; i++) {
    if (this.puzzle[i].section) {
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
  $('#levels').html(html.join(''));

  for (var i = 0; i < this.puzzle.length; i++) {
    if (this.puzzle[i].completed) this.mark_complete(i);
    $('#level' + i).click($.proxy(this.click_level, this, i));
  }

  $('#button-help').click($.proxy(this.click_help, this));

  $('#button-main').click($.proxy(this.click_main, this));
  $('#button-main2').click($.proxy(this.click_main, this));

  $('#next-puzzle').click($.proxy(this.click_next, this));
  $('#next-main').click($.proxy(this.click_main, this));
}

Level.prototype.mark_complete = function(level_num) {
  var id = '#complete' + level_num;
  $(id).html('<path d="M7.5,16.5l6,12l12,-24" class="checkmark"/>')
};

Level.prototype.begin = function(level_num) {
  var save_str = undefined;

  if (level_num === undefined) {
    var anchor = decodeURI(window.location.hash.substring(1));
    if (anchor != '') {
      var a = anchor.split('?', 2);
      var level_name = a[0];
      if (a.length == 2) save_str = a[1];
      level_num = this.level_name_to_num(level_name);
    }
  }
  if (level_num === undefined) {
    var level_name = this.be.circuit.load_data('boole.state.level');
    level_num = this.level_name_to_num(level_name);
  }

  if (!level_num) level_num = 0;
  this.level_num = level_num;
  var level = this.level = this.puzzle[level_num];
  this.be.circuit.save_data('boole.state.level', level.name);

//  if (true) { // cheat
//    save_str = level.soln; // [level.soln.length-1]
//  } else
  if (this.be.showing_soln) {
    save_str = level.soln[this.be.showing_soln-1];
  } else if (!save_str) {
    save_str = this.be.circuit.load_data('boole.' + level.name + '.progress');
  }

  if (level.hide === undefined) {
    level.hide = {};
  } else if (Array.isArray(level.hide)) {
    var hide = {};
    for (var i = 0; i < level.hide.length; i++) {
      hide[level.hide[i]] = true;
    }
    level.hide = hide;
  }

  this.box_cells = {};
  this.be.box_height = this.be.box_spacing;
  if (level.avail === undefined) {
    level.avail = ['inv', 'and', 'nand', 'or', 'nor', 'xor', 'xnor'];
  }

  this.be.hide_cbox = (level.avail.length == 0);
  var display = this.be.hide_cbox ? 'none' : 'block';
  this.be.div_cbox.css({display: display});
  this.be.div_cdrag.css({display: display});

  for (var i = 0; i < level.avail.length; i++) {
    var name = level.avail[i];
    if (typeof name == 'string') {
      var cell = this.add_box_cell(name);
    } else {
      cell.update_quantity(name);
      cell.el_qty_text.setAttr('visibility', 'visible');
    }
  }
  this.be.cbox.setViewBox(0, 0, this.be.em_size*8, this.be.box_height);

  this.named_cells = {};
  this.all_cells = [];

  // Get a list of the input and output pins.
  this.input_names = [];
  this.output_names = [];
  for (var cell_name in level.cells) {
    var cell_obj = level.cells[cell_name];
    if (cell_obj.type == 'input') this.input_names.push(cell_name);
    if (cell_obj.type == 'output') this.output_names.push(cell_name);
  }

  this.mark_currently_completed(false);

  // Initialize the truth table with columns for the input and output pins.
  this.init_table();

  // Initialize the help menu.
  this.init_help();
  this.display_intro();

  // Initialize the cells required by the level while ignoring IO connections.
  for (var cell_name in level.cells) {
    var cell_obj = level.cells[cell_name];
    var cell = new Cell(this.be, 'cdraw',
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
  for (var cell_name in level.cells) {
    var conn_list = level.cells[cell_name].io;
    if (conn_list) {
      for (var i = 0; i < conn_list.length; i++) {
        var io_name = conn_list[i][0];
        var cell_name2 = conn_list[i][1];
        var io_name2 = conn_list[i][2];
        var unlocked = conn_list[i][3];
        if (!save_str || !unlocked) {
          // If there's a save_str, don't draw unlocked wires.
          // Instead, allow the save_str to determine those wires are
          // drawn or not.
          new Wire(this.be,
                   this.named_cells[cell_name].io[io_name],
                   this.named_cells[cell_name2].io[io_name2],
                   false, // pending_del
                   !unlocked); // locked
        }
      }
    }
  }

  // Restore additional cells and wire connections from the save data.
  if (save_str) {
    this.restore_progress(save_str);
  }
  this.update_widths();
  this.save_progress();

  // Initialize the level to the first row of the table, and
  // correspondingly set up the initial input values and output
  // (expected) values.
  this.cur_seq = 0;
  this.cur_line = 0;
  this.select_seq(0);

  this.be.sim.begin_level(level.hide.speed, this.sequenced);

  this.circuit_is_reset = true;
};

Level.prototype.level_name_to_num = function(name) {
  for (var i = 0; i < this.puzzle.length; i++) {
    if (this.puzzle[i].name == name) {
      return i;
    }
  }
  return undefined;
}

Level.prototype.init_table = function() {
  var level = this.level;
  this.sequenced = false;
  this.row_result = [];
  var html = [];

  this.be.hide_truth = level.hide.truth;
  var display = (this.be.hide_truth && this.be.hide_cbox) ? 'none' : 'block';
  this.be.div_truth.css({display: display});

  if (this.be.hide_truth) {
    // Create the truth table HTML, but hidden.  This is easier than
    // not creating the HTML and trying to prevent the various actions
    // that normally happen in the truth table.  (Note that the entire
    // truth_div may also be hidden as per the code above.)
    html.push('<table style="display: none;"><tr>');
  } else {
    html.push('<table id="truth-table" class="truth"><tr>');
  }
  this.table_header(html, this.input_names);
  this.table_header(html, this.output_names);
  html.push('<th class="check"></th></tr>');
  var num_rows = 0;
  this.row_seq = [];
  this.row_line = [];
  for (var i = 0; i < level.truth.length; i++) {
    if (Array.isArray(level.truth[i])) {
      if (level.truth[i].length > 1) this.sequenced = true;
    } else {
      // A non-sequencing table row can be specified without the array,
      // but we force it into array format here.
      level.truth[i] = [level.truth[i]];
    }
    var truth_seq = level.truth[i];
    truth_seq.first_row = num_rows;
    for (var j = 0; j < truth_seq.length; j++) {
      var last_line = (j == truth_seq.length - 1);
      html.push('<tr class="truthbody" id="row', num_rows, '">');
      if (truth_seq[j].rnd) {
        truth_seq[j] = {rnd: truth_seq[j].rnd};
        this.table_line_rnd(html, last_line);
      } else {
        this.table_line(html, this.input_names, truth_seq[j], last_line);
        this.table_line(html, this.output_names, truth_seq[j], last_line);
      }
      this.table_blank_check(html, num_rows);
      html.push('</tr>');
      this.row_result.push(undefined);
      this.row_seq.push(i);
      this.row_line.push(j);
      num_rows++;
    }
  }
  html.push('</table>');
  $('#truth').html(html.join(''));
  this.div_truth_table = $('#truth-table');
  if (level.hide.truth) {
    this.be.truth_table_width = 0;
  } else {
    this.be.truth_table_width = this.div_truth_table.width();
  }

  this.row_top = [];
  for (var i = 0; i < num_rows; i++) {
    var row = $('#row' + i);
    row.hover($.proxy(this.row_enter, this, i),
              $.proxy(this.row_leave, this, i));
    row.click($.proxy(this.row_click, this, i));
    row.dblclick($.proxy(this.row_dblclick, this, i));
    this.be.bdrag.drag(row, this, 'truth',
                       {dblclick: this.row_dblclick});

    this.row_top.push(row.offset().top);
  }
  this.row_top.push(this.div_truth_table.height());

};

Level.prototype.upper_str = function(str) {
  if (/[A-Z]/.test(str)) {
    return str;
  } else {
    return str.toUpperCase();
  }
};

Level.prototype.table_header = function(html, port_names) {
  for (var i = 0; i < port_names.length; i++) {
    html.push('<th');
    this.push_padding(html, i, port_names.length, true);
    html.push('>', this.upper_str(port_names[i]), '</th>');
  }
};

Level.prototype.table_line_rnd = function(html, span, last_line) {
  var span = this.input_names.length + this.output_names.length;
  html.push('<td class="tdlr tdb" colspan="', span, '">random</td>');
};

Level.prototype.table_line = function(html, port_names, truth_line, last_line) {
  for (var i = 0; i < port_names.length; i++) {
    html.push('<td');
    this.push_padding(html, i, port_names.length, last_line);
    html.push('>');
    if (truth_line[port_names[i]] !== undefined) {
      html.push(truth_line[port_names[i]]);
    }
    html.push('</td>');
  }
};

Level.prototype.push_padding = function(html, i, num, last_line) {
  var tdb = last_line ? ' tdb' : '';
  if (i == 0) {
    if (i < num-1) {
      html.push(' class="tdl', tdb, '"');
    } else {
      html.push(' class="tdlr', tdb, '"');
    }
  } else if (i == num-1) {
    html.push(' class="tdr', tdb, '"');
  } else if (last_line) {
    html.push(' class="tdb"');
  }
};

Level.prototype.table_blank_check = function(html, row) {
  html.push('<td class="check"><svg id="check', row, '" display="block" width="1em" height="1em" viewBox="0 0 33 33"></svg></td>');
};

Level.prototype.row_enter = function(row, event) {
  this.hover_row = row;
  var old_row = this.cur_row();
  if (row === this.row_allows_simple_click) {
    if (row != old_row) {
      $('#row' + row).css({'background-color': '#ddd'});
    }
  } else {
    var seq = this.row_seq[row];
    for (var i = 0; i < this.level.truth[seq].length; i++) {
      var i_row = this.level.truth[seq].first_row + i;
      if (i_row != old_row) {
        $('#row' + i_row).css({'background-color': '#ddd'});
      }
    }
  }
};

Level.prototype.row_leave = function(row, event) {
  this.hover_row = undefined;
  var old_row = this.cur_row();
  for (var i = 0; i < this.row_result.length; i++) {
    if (i != old_row) $('#row' + i).css({'background-color': ''});
  }
};

Level.prototype.update_hover = function() {
  if (this.hover_row !== undefined) {
    var row = this.hover_row;
    this.row_leave(row);
    this.row_enter(row);
  }
};

Level.prototype.row_click = function(row, event) {
  this.be.sim.click_pause();
  var old_row = this.cur_row();
  if (row === this.row_allows_simple_click) {
    if (row == old_row + 1) {
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
  $('#row' + this.cur_row()).css({'background-color': ''});
  $('#row' + row).css({'background-color': '#ff8'});
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
  this.not_done();
  this.select_row(this.cur_row() + 1);
};

Level.prototype.fast_test = function() {
  this.be.sim_fast = true;

  for (var i = 0; i < this.input_names.length; i++) {
    var cell = this.named_cells[this.input_names[i]];
    cell.propagate_value();
  }
  for (var i = 0; i < this.all_cells.length; i++) {
    var cell = this.all_cells[i];
    if ((cell.type == 'vdd') || (cell.type == 'gnd')) {
      cell.propagate_value();
    }
  }

  var result = true;
  for (var i = 0; i < this.output_names.length; i++) {
    var cell = this.named_cells[this.output_names[i]];
    var cell_result = cell.done_check();
    result = result && cell_result;
  }

  for (var i = 0; i < this.all_cells.length; i++) {
    this.all_cells[i].fast_reset();
  }

  this.be.sim_fast = false;

  return !result;
};

Level.prototype.update_pins = function() {
  var truth_obj = this.level.truth[this.cur_seq][this.cur_line];
  if (truth_obj.rnd && !truth_obj.initialized) {
    this.level[truth_obj.rnd].call(this, truth_obj);
    var row = this.cur_row();
    var html = [];
    this.table_line(html, this.input_names, truth_obj, true);
    this.table_line(html, this.output_names, truth_obj, true);
    this.table_blank_check(html, row);
    $('#row' + row).html(html.join(''));
    truth_obj.initialized = true;

    // The truth table may be wider now.  This looks a little awkward,
    // but it's hard to do determine its maximum width in advance.  To
    // minimize the awkwardness, don't let the table become narrower,
    // even if some rows were reset.
    if (this.be.truth_table_width) {
      var new_width = this.div_truth_table.width();
      if (new_width > this.be.truth_table_width) {
        this.be.truth_table_width = new_width;
        this.be.circuit.resize();
      }
    }

    // We don't want to let the user pick random values while the
    // circuit is reset, and then design a circuit that works only for
    // those random values.  Therefore, if the user initializes any
    // random rows in the truth table and then changes the circuit,
    // reset those rows.
    this.circuit_is_reset = false;
  }
  for (var i = 0; i < this.input_names.length; i++) {
    // We want the value to appear right away on the IO stub, so we
    // push it all the way through to the input pin's output port.
    // This also registers the value for propagation on the next wire
    // (if any).
    var cell = this.named_cells[this.input_names[i]];
    cell.propagate_value();
    cell.fit_input_text();
  }
  for (var i = 0; i < this.output_names.length; i++) {
    var cell = this.named_cells[this.output_names[i]];
    cell.calc_output();
    cell.fit_output_text();
  }
  for (var i = 0; i < this.all_cells.length; i++) {
    var cell = this.all_cells[i];
    if ((cell.type == 'vdd') || (cell.type == 'gnd')) {
      cell.propagate_value();
    }
  }
};

Level.prototype.reset_sim = function() {
  this.row_allows_simple_click = false;
  this.update_hover();
  this.be.sim.reset();
  for (var i = 0; i < this.all_cells.length; i++) {
    this.all_cells[i].reset();
  }
};

Level.prototype.add_box_cell = function(type) {
  var cell = new Cell(this.be, 'cbox', type, 0, 0);
  this.box_cells[type] = cell;
  var bbox = cell.bbox;
  var cx = (this.be.em_size*4) - (bbox.right + bbox.left) / 2; // align center
  var cy = this.be.box_height - bbox.top; // align top edge
  cell.move(cx, cy);
  this.be.box_height += (bbox.bottom - bbox.top) + this.be.box_spacing;
  return cell;
};

Level.prototype.update_box_quantity = function(type, change) {
  var cell = this.be.level.box_cells[type];
  if (cell === undefined) return false;
  if (cell.quantity !== undefined) {
    if (cell.quantity + change < 0) return false;
    cell.update_quantity(cell.quantity + change);
  }
  return true;
};

Level.prototype.value = function(name) {
  return this.level.truth[this.cur_seq][this.cur_line][name];
};

Level.prototype.add_cell = function(cell) {
  this.all_cells.push(cell);
};

Level.prototype.remove_cell = function(cell) {
  for (var i = 0; i < this.all_cells.length; i++) {
    if (cell == this.all_cells[i]) {
      this.all_cells.splice(i, 1);
      return;
    }
  }
};

Level.prototype.move_cell_to_end = function(cell) {
  for (var i = 0; i < this.all_cells.length; i++) {
    if (cell == this.all_cells[i]) {
      this.all_cells.splice(i, 1);
      this.all_cells.push(cell);
      return;
    }
  }
  // If cell is not found, don't push it onto the list.
};

Level.prototype.save_progress = function() {
  if (this.be.showing_soln) return;

  // Since the user made a change to the circuit, we won't
  // automatically refit it on a window resize.
  this.be.view_is_fit = false;

  var save_str = this.encode_progress();

  var failed = this.be.circuit.save_data('boole.' + this.level.name + '.progress',
                                         save_str);
  if (failed) {
    var hash_str = this.level.name + '?' + save_str;
    window.location.hash = encodeURI(hash_str);
  } else {
    window.location.hash = '';
  }

  if (this.cur_info == 'copy') {
    this.clear_sel();
    this.update_help_copy(save_str);
  }
};

Level.prototype.encode_progress = function() {
  var save = [];

  for (var i = 0; i < this.all_cells.length; i++) {
    if (!this.all_cells[i].locked) break;
  }
  save.push('1s', i);

  for (var i = 0; i < this.all_cells.length; i++) {
    var emitted_cell = false;
    var cell = this.all_cells[i];
    if (!cell.locked) {
      var type = cell.type;
      if ((type == 'condenser') || (type == 'expander')) type += cell.width;
      save.push(';', Math.round(cell.x / this.be.io_spacing * 20),
                ',', type,
                ',', Math.round(cell.y / this.be.io_spacing * 20));
      emitted_cell = true;
    }
    for (var port_name in cell.io) {
      var io = cell.io[port_name];
      if (io.type == 'output') {
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

  return save.join('');
};

Level.prototype.restore_progress = function(save_str) {
  this.cleaning_up = true; // ignore calls to circuit_changed();

  try {
    var ex_version_skip = /^1s([0-9]+)/;
    var ex_cell = /^;(-?[0-9]+),([a-z]*)([0-9]?),(-?[0-9]+)/;
    var ex_plus = /^\+([a-z][a-z0-9]*),([0-9]+),([a-z][a-z0-9]*)/;
    var ex_minus = /^-([0-9]+),([a-z][a-z0-9]*),([0-9]+),([a-z][a-z0-9]*)/;

    var m;
    var wires = [];

    if (m = ex_version_skip.exec(save_str)) {
      var skip = Number(m[1]);
      if (skip != this.all_cells.length) throw 'wrong skip';
      save_str = save_str.substring(m[0].length);
    } else {
      throw 'bad version/skip string';
    }

    while (save_str != '') {
      if (m = ex_cell.exec(save_str)) {
        var x = Number(m[1]);
        var type = m[2];
        var width = m[3];
        var y = Number(m[4]);
        save_str = save_str.substring(m[0].length);

        if (!this.update_box_quantity(type, -1)) {
          throw 'exhausted cell type: ' + type
        }
        if ((type == 'condenser') || (type == 'expander')) {
          width = Math.min(8, Math.max(2, width || 2));
        } else {
          width = undefined;
        }
        this.add_cell(new Cell(this.be, 'cdraw', type,
                               x / 20 * this.be.io_spacing,
                               y / 20 * this.be.io_spacing,
                               undefined, undefined, width));

        while (save_str != '') {
          if (m = ex_plus.exec(save_str)) {
            wires.push({o_cell: this.all_cells.length-1,
                        o_port: m[1],
                        i_cell: Number(m[2]),
                        i_port: m[3]});
            save_str = save_str.substring(m[0].length);
          } else {
            break;
          }
        }
      } else if (m = ex_minus.exec(save_str)) {
        wires.push({o_cell: Number(m[1]),
                    o_port: m[2],
                    i_cell: Number(m[3]),
                    i_port: m[4]});
        save_str = save_str.substring(m[0].length);
      } else {
        throw 'not recognized: ' + save_str;
      }
    }

    for (var i = 0; i < wires.length; i++) {
      var w = wires[i];
      if (w.o_cell >= this.all_cells.length) throw 'bad o_cell #: ' + w.o_cell;
      if (w.i_cell >= this.all_cells.length) throw 'bad i_cell #: ' + w.i_cell;
      var o_cell = this.all_cells[w.o_cell];
      var i_cell = this.all_cells[w.i_cell];
      var io_o = o_cell.io[w.o_port];
      var io_i = i_cell.io[w.i_port];
      if (!io_o) throw 'bad o port: ' + w.o_port;
      if (!io_i) throw 'bad i port: ' + w.i_port;
      if (io_i.w.length == 0) {
        var w = new Wire(this.be, io_o, io_i);
        if (this.update_widths() || this.check_critical_path()) {
          w.remove();
          this.update_widths();
        }
      }
    }
  }
  catch (ex) {
    //onsole.log(ex);
    //onsole.log('remaining:', save_str)
    // Exit without decoding any more.
  }

  this.cleaning_up = false;
};

Level.prototype.not_done = function() {
  // If there is anything to simulate in the current row, we mark all
  // check pins as pending.  To avoid confusing the user, we do this
  // even if we are sure of the final value.
  for (var cell_name in this.named_cells) {
    if (this.named_cells[cell_name].type == 'output') {
      this.named_cells[cell_name].check_pending();
    }
  }

  if (!this.be.sim.paused()) {
    // While simulation is delayed at the end of a row,
    // row_allows_simple_click is active for the user, but once the
    // delay is over and simulation resumes on the next row, then it
    // must become false once again.  The same is true if simulation
    // was paused at the end of the row, and then the user clicks
    // play.  However, if simulation was paused and the user manually
    // selects the next row (the one that allows the simple click),
    // this change of row causes not_done() to be called, but we keep
    // row_allows_simple_click active in case the user wants to double
    // click.  not_done() gets called again when the user clicks play
    // (or the equivalent such as a double click).
    this.row_allows_simple_click = false;
    this.update_hover();

    // If not_done() is called because the user clicked play, scroll
    // the current row of the truth table into view.  Note that if the
    // user clicks in the truth table, this automatically pauses
    // simulation before not_done() is called, so the truth table is
    // not scrolled in that case.
    this.scroll_truth();

    this.circuit_is_reset = false;
  }
};

Level.prototype.circuit_changed = function() {
  if (this.cleaning_up) return; // Ignore circuit changes while cleaning up.
  if (this.circuit_is_reset) return; // Ignore duplicate circuit changes.

  for (var i = 0; i < this.row_result.length; i++) {
    this.record_result(i, undefined);
    var i_seq = this.row_seq[i];
    if (i_seq != this.cur_seq) {
      var i_line = this.row_line[i];
      var truth_seq = this.level.truth[i_seq];
      if (truth_seq[i_line].rnd) {
        truth_seq[i_line] = {rnd: truth_seq[i_line].rnd};
        var html = [];
        this.table_line_rnd(html, true);
        this.table_blank_check(html, i);
        $('#row' + i).html(html.join(''));
      }
    }
  }

  this.mark_currently_completed(false);

  this.select_seq(this.cur_seq);

  // Normally the changing stimulus pin values would have already
  // triggered sim.start(), but in case they haven't...
  this.be.sim.not_done();

  this.be.sim.click_pause();

  this.circuit_is_reset = true;
};

// done() gets called by Sim when there are no events left to process.
Level.prototype.done = function() {
  var result = true;
  for (var i = 0; i < this.output_names.length; i++) {
    var cell = this.named_cells[this.output_names[i]];
    var cell_result = cell.done_check();
    result = result && cell_result;
  }
  this.record_result(this.cur_row(), result);

  if (!result) return 'fail';

  if (this.cur_line < this.level.truth[this.cur_seq].length - 1) {
    this.row_allows_simple_click = this.cur_row() + 1;
    this.update_hover();
    return 'line';
  }

  if (this.first_failed_seq() !== null) return 'seq';

  // There are no failed rows/sequences.
  if (!this.level.completed) {
    $('#help-outro').css({display: ''});

    this.level.completed = true;
    this.be.circuit.save_data('boole.' + this.level.name + '.completed', 'true');
    this.mark_complete(this.level_num);
  }

  this.mark_currently_completed(true);

  this.be.circuit.unhide_info();
  this.click_help_outro();

  return 'done';
};

Level.prototype.advance_truth = function(type) {
  if (type == 'line') {
    this.next_line();
  } else {
    // There is guaranteed to be a failed sequence somewhere, or we
    // wouldn't be here.
    this.select_seq(this.first_failed_seq());
  }

  this.scroll_truth();
};

Level.prototype.scroll_truth = function() {
  // Scroll the maximum amount to the right to ensure that the test
  // results are visible.
  this.be.div_truth.scrollLeft(this.be.truth_table_width);

  // Try to scroll the current sequence into view.
  // We don't need to include the current scroll amount because we get
  // the row offset from saved data, not from its current offset.
  var row = this.cur_row();
  var cy = (this.row_top[row] + this.row_top[row + 1]) / 2;
  var top = cy - this.be.truth_height/2;
  this.be.div_truth.scrollTop(top);
};

Level.prototype.first_failed_seq = function() {
  // Look for the first failure after the current sequence, if any;
  // otherwise, the first failure overall.
  for (var i = this.cur_row() + 1; i < this.row_result.length; i++) {
    if (!this.row_result[i]) return this.row_seq[i];
  }
  for (var i = 0; i < this.row_result.length; i++) {
    if (!this.row_result[i]) return this.row_seq[i];
  }
  return null;
};

Level.prototype.change_level = function(level_num, show_soln) {
  this.clear_sel();

  this.cleaning_up = true;
  for (var i = 0; i < this.all_cells.length; i++) {
    this.all_cells[i].remove();
  }

  this.be.sim.click_pause();
  this.be.sim.reset();

  for (var type in this.box_cells) {
    this.box_cells[type].remove();
  }

  this.cleaning_up = false;

  this.be.showing_soln = show_soln;
  this.be.circuit.begin_level(level_num);
};

Level.prototype.record_result = function(row, result) {
  this.row_result[row] = result;

  var id = '#check' + row;
  if (result === undefined) {
    $(id).html('');
  } else if (result) {
    $(id).html('<path d="M7.5,16.5l6,12l12,-24" class="checkmark"/>');
  } else {
    $(id).html('<path d="M4.5,4.5l24,24m0,-24l-24,24" class="xmark"/>');
  }
};

Level.prototype.click_main = function() {
  this.be.sim.click_pause();
  $('#level' + this.level_num).css({'background-color': '#ff8'});
  $('#main_container').css({display: 'block'});

  // Scroll the current level into view (centered, if possible).
  var main = $('#main');
  if (this.level_num == this.puzzle.length - 1) {
    var top = main.prop('scrollHeight');
  } else {
    var tr = $('#level' + this.level_num);
    var cy = main.scrollTop() + tr.offset().top + tr.height()/2;
    var top = cy - main.height()/2;
    // If top is negative or is too high, the browser will
    // automatically cap scrolling as needed.
  }
  $('#main').scrollTop(top);
};

Level.prototype.click_level = function(level_num, event) {
  $('#main_container').css({display: 'none'});
  $('#level' + this.level_num).css({'background-color': ''});

  if (level_num === this.level_num) {
    // The user selected the same level he was previously on.
    // Return to the level without resetting it.
    return;
  } else {
    this.change_level(level_num);
  }
};

Level.prototype.update_widths = function(pending) {
  for (var i = 0; i < this.all_cells.length; i++) {
    var cell = this.all_cells[i];
    if (((cell.type == 'input') && (cell.width > 1)) ||
        (cell.type == 'condenser') ||
        (cell.type == 'fadder')) {
      var failure = cell.propagate_width(cell.output_width);
      if (failure) break;
    }
  }

  // Even if there's a failure, we still perform this step in order to
  // clear the prospective_width values.
  for (var i = 0; i < this.all_cells.length; i++) {
    var cell = this.all_cells[i];
    if (!cell.locked &&
        (cell.type != 'condenser') &&
        (cell.type != 'expander') &&
        (cell.type != 'fadder')) {
      var new_width = cell.prospective_width || 1;
      var old_width = (pending && cell.pending_width) || cell.width;
      if (this.update_box_quantity(cell.type, old_width - new_width)) {
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
  for (var i = 0; i < this.all_cells.length; i++) {
    var cell = this.all_cells[i];
    if (!cell.locked &&
        (cell.type != 'condenser') &&
        (cell.type != 'expander') &&
        (cell.type != 'fadder')) {
      cell.update_width(cell.pending_width);
    }
    cell.pending_width = undefined;
  }
};

Level.prototype.critical_path = function() {
  var max_path = 0;

  for (var i = 0; i < this.all_cells.length; i++) {
    this.all_cells[i].max_path = undefined;
  }

  for (var i = 0; i < this.all_cells.length; i++) {
    var path = this.all_cells[i].critical_path();
    if (path > max_path) max_path = path;
  }

  return max_path;
};

Level.prototype.check_critical_path = function() {
  if (!this.level.max_path) return 0;
  var max_path = this.critical_path();
  if (max_path > this.level.max_path) {
    return max_path;
  } else {
    return 0;
  }
};

// Perform HTML substitutions on the info panel text.  This is
// different than the smartquotes substitions because it can add or
// delete HTML tags, not just replace text outside the tags.
Level.prototype.text = function(str) {
  return (str || '').replace(/&play;/g,'<svg width="1em" height="1em" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="20" ry="20" class="playborder"/><path d="M37,25v50l30,-25z" class="playcenter"/></svg>');
};

Level.prototype.init_help = function() {
  this.div_help_drop = $('#help-drop');
  this.div_help_drop.html('');

  this.cur_info = 'intro';

  this.div_help_drop.append('<p id="help-intro" class="help-drop help-selected">Show introduction</p>');
  $('#help-intro').click($.proxy(this.click_help_intro, this));

  if (!this.level.hint) {
    this.level.hint = [];
  } else if (!Array.isArray(this.level.hint)) {
    this.level.hint = [this.level.hint];
  }
  for (var i = 0; i < this.level.hint.length; i++) {
    var numtext = (this.level.hint.length == 1) ? '' : ' #' + (i+1);
    this.div_help_drop.append('<p id="help-hint' + i + '" class="help-drop">Show hint' + numtext + '</p>');
    $('#help-hint' + i).click($.proxy(this.click_help_hint, this, i));
  }

  if (!this.level.soln) {
    this.level.soln = [];
  } else if (!Array.isArray(this.level.soln)) {
    this.level.soln = [this.level.soln];
  }
  $('#helpiconfill').attr({fill: this.be.showing_soln ? '#fbb' : ''});
  for (var i = 0; i < this.level.soln.length; i++) {
    if (i+1 == this.be.showing_soln) {
      this.div_help_drop.append('<p id="help-restore" class="help-drop">Restore my progress</p>');
      $('#help-restore').click($.proxy(this.click_help_restart, this, false));
    } else {
      var numtext = (this.level.soln.length == 1) ? '' : ' #' + (i+1);
      this.div_help_drop.append('<p id="help-soln' + i + '" class="help-drop">Show sample solution' + numtext + '</p>');
      $('#help-soln' + i).click($.proxy(this.click_help_restart, this, i+1));
    }
  }

  this.div_help_drop.append('<p id="help-outro" class="help-drop">Show conclusion</p>');
  $('#help-outro').click($.proxy(this.click_help_outro, this));
  if (!this.level.completed) $('#help-outro').css({display: 'none'});

  if (!this.be.showing_soln) {
    this.div_help_drop.append('<p id="help-copy" class="help-drop">Copy my progress</p>');
    $('#help-copy').click($.proxy(this.click_help_copy, this));
  }
};

Level.prototype.click_help = function() {
  if (this.help_showing) {
    this.close_help();
    return;
  }

  this.div_help_drop.addClass('block-show');
  this.help_showing = true;

  $(window).on('mousedown.helpdrop', $.proxy(this.close_help, this));
  $(window).on('touchstart.helpdrop', $.proxy(this.close_help, this));
};

Level.prototype.close_help = function(event) {
  if (event && event.target.matches('.helpbutton,.help-drop')) {
    // Don't close the help menu on this mousedown/touchdown event
    // because if we did, then the subsequent 'click' event on
    // mouseup/touchend would re-open it.  Instead, we leave the menu
    // open on the mousedown/touchdown event, then have it close on
    // the subsequent 'click' event.
    return;
  }

  this.div_help_drop.removeClass('block-show');
  this.help_showing = false;
  $(window).off('mousedown.helpdrop');
  $(window).off('touchstart.helpdrop');
};

Level.prototype.select_help = function(label) {
  $('#help-' + this.cur_info).removeClass('help-selected');
  $('#help-' + label).addClass('help-selected');
  this.cur_info = label;

  this.clear_sel();
};

Level.prototype.clear_sel = function() {
  // Clear user's selection
  if (window.getSelection) {
    if (window.getSelection().empty) {  // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {  // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {  // IE?
    document.selection.empty();
  }
};

Level.prototype.click_help_intro = function() {
  this.select_help('intro');
  this.close_help();
  this.display_intro();
  this.be.circuit.resize(false);
  this.be.circuit.update_view();
};

Level.prototype.display_intro = function() {
  this.be.div_infotxt.html(this.text(this.level.intro));
  smartquotes(this.be.div_infotxt[0]);
};

Level.prototype.click_help_hint = function(num) {
  this.select_help('hint' + num);
  this.close_help();
  this.be.div_infotxt.html(this.text(this.level.hint[num]));
  smartquotes(this.be.div_infotxt[0]);
  this.be.circuit.resize(false);
  this.be.circuit.update_view();
};

Level.prototype.click_help_restart = function(show_soln) {
  this.close_help();
  this.change_level(this.level_num, show_soln);
};

Level.prototype.click_help_outro = function() {
  this.select_help('outro');
  this.close_help();

  this.be.div_infotxt.html(this.text(this.level.outro));
  smartquotes(this.be.div_infotxt[0]);
  this.be.circuit.resize(false);
  this.be.circuit.update_view();
};

Level.prototype.click_help_copy = function() {
  this.select_help('copy');
  this.close_help();
  this.update_help_copy(this.encode_progress());
};

Level.prototype.update_help_copy = function(save_str) {
  var url = window.location.href.split('#', 2)[0];
  url = encodeURI(url + '#' + this.level.name + '?' + save_str);
  var html = '<p>Copy this URL to save or share your progress for this challenge:</p><input type="text" id="copyinput" size="' + url.length + '" value="' + url + '"/>';
  this.be.div_infotxt.html(this.text(html));
  $('#copyinput').select();
  try {
    var success = document.execCommand('copy');
    if (success) {
      url = url.replace(/([-?].)/g, '<span>$1</span>');
      var html = '<p>The following URL has been copied to your clipboard:</p><p><b>' + url + '</b></p><p>Use it to save or share your progress for this challenge.</p>';
      this.be.div_infotxt.html(this.text(html));
    }
  }
  catch (e) {
    // Do nothing.
  }
  this.be.circuit.resize(false);
  this.be.circuit.update_view();
};

Level.prototype.click_next = function() {
  this.change_level(this.level_num + 1);
};

Level.prototype.mark_currently_completed = function(currently_completed) {
  if (currently_completed) {
    //$('#truth').css({'background-color': '#d0ffd0'});
    //$('.check').css({'background-color': '#d0ffd0'});
    $('#info').css({'background-color': '#d0ffd0'});
    $('#info-stub').css({'background-color': '#d0ffd0'});
    $('.help-drop').addClass('complete');
    $('.infobutton').addClass('complete');
    if (this.level_num == this.puzzle.length - 1) {
      $('#span-next-main').css({display: 'block'});
    } else {
      $('#span-next-puzzle').css({display: 'block'});
    }
    this.be.controls_height = this.be.div_controls.outerHeight();
  } else {
    //$('#truth').css({'background-color': ''});
    //$('.check').css({'background-color': ''});
    $('#info').css({'background-color': ''});
    $('#info-stub').css({'background-color': ''});
    $('.help-drop').removeClass('complete');
    $('.infobutton').removeClass('complete');
    $('#span-next-puzzle').css({display: 'none'});
    $('#span-next-main').css({display: 'none'});
  }
};
