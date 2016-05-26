// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Bdrag(be) {
  this.be = be;
}

Bdrag.prototype.drag = function (jel, context, type, fn_start, fn_move, fn_end) {
  var data = {
    jel: jel,
    context: context,
    type: type,
    fn_start: fn_start,
    fn_move, fn_move,
    fn_end, fn_end
  };
  jel.on('mousedown.booletouch', $.proxy(this.mousedown, this, data));
  jel.on('touchstart.booletouch', $.proxy(this.touchstart, this, data));
};

Bdrag.prototype.undrag = function (jel) {
  jel.off('mousedown.booletouch');
  jel.off('touchstart.booletouch');

  if ((this.dragging == 'mouse') && (this.mousedata.jel == jel)) {
    var doc = $(document);
    doc.off("mousemove.booledrag");
    doc.off("mouseup.booledrag");
  }

  if ((this.dragging == 'touch') && (this.touchdata.jel == jel)) {
    var doc = $(document);
    doc.off("touchmove.booledrag");
    doc.off("touchend.booledrag");
  }
};

Bdrag.prototype.mousedown = function (data, event) {
  $('#info').add('<br>mousedown');
  event.preventDefault();
  if (this.dragging) return;
  this.dragging = 'mouse';
  this.mousedata = data;

  var doc = $(document);
  doc.on("mousemove.booledrag", $.proxy(this.mousemove, this));
  doc.on("mouseup.booledrag", $.proxy(this.mouseup, this));

  data.fn_start.call(data.context, event.pageX, event.pageY);
};

Bdrag.prototype.mousemove = function (event) {
  this.mousedata.fn_move.call(this.mousedata.context, event.pageX, event.pageY);
};

Bdrag.prototype.mouseup = function (event) {
  $('#info').add('<br>mouseup');
  this.dragging = false;

  var doc = $(document);
  doc.off("mousemove.booledrag");
  doc.off("mouseup.booledrag");

  this.mousedata.fn_end.call(this.mousedata.context);
};

Bdrag.prototype.touchstart = function (data, event) {
  $('#info').add('<br>touchstart');
  event.preventDefault();
  if (this.dragging) return;
  this.dragging = 'touch';
  this.touchdata = data;

  var doc = $(document);
  doc.on("touchmove.booledrag", $.proxy(this.touchmove, this));
  doc.on("touchend.booledrag", $.proxy(this.touchend, this));

  var e = event.originalEvent || event;
  var t = e.changedTouches[0];
  this.mouseid = t.identifier;

  data.fn_start.call(data.context, t.pageX, t.pageY);
};

Bdrag.prototype.touchmove = function (event) {
  var e = event.originalEvent || event;
  for (var i = 0; i < e.touches.length; i++) {
    if (e.touches[i].identifier == this.mouseid){
      this.touchdata.fn_move.call(this.touchdata.context,
                                  e.touches[i].pageX, e.touches[i].pageY);
    }
  }
};

Bdrag.prototype.touchend = function (event) {
  $('#info').add('<br>touchend');
  this.dragging = false;

  var e = event.originalEvent || event;
  for (var i = 0; i < e.touches.length; i++) {
    if (e.touches[i].identifier == this.mouseid){
      var doc = $(document);
      doc.off("touchmove.booledrag");
      doc.off("touchend.booledrag");
      this.touchdata.fn_end.call(this.touchdata.context);
    }
  }
};
