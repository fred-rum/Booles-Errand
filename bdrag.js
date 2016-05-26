// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Bdrag() {
  this.touchdata = {};
  this.tapdata = {};
}

Bdrag.prototype.drag = function (jel, context, type, fn_start, fn_move, fn_end,
                                 fn_dbltap, extra) {
  var data = {
    jel: jel,
    context: context,
    type: type,
    fn_start: fn_start,
    fn_move: fn_move,
    fn_end: fn_end,
    fn_dbltap: fn_dbltap,
    extra: extra
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
  //$('#info').append('<br>mousedown');
  event.preventDefault();
  if (this.dragging) return;
  this.dragging = 'mouse';
  this.mousedata = data;

  var doc = $(document);
  doc.on("mousemove.booledrag", $.proxy(this.mousemove, this));
  doc.on("mouseup.booledrag", $.proxy(this.mouseup, this));

  data.fn_start.call(data.context, event.pageX, event.pageY, data.extra);
};

Bdrag.prototype.mousemove = function (event) {
  this.mousedata.fn_move.call(this.mousedata.context, event.pageX, event.pageY,
                              this.mousedata.extra);
};

Bdrag.prototype.mouseup = function (event) {
  //$('#info').append('<br>mouseup');
  this.dragging = false;

  var doc = $(document);
  doc.off("mousemove.booledrag");
  doc.off("mouseup.booledrag");

  this.mousedata.fn_end.call(this.mousedata.context,
                             this.mousedata.extra);
};

Bdrag.prototype.touchstart = function (data, event) {
  var e = event.originalEvent || event;
  var t = e.changedTouches[0];
  //$('#info').append('<br>touchstart' + t.identifier);
  event.preventDefault();
  event.stopPropagation();
  if (this.dragging == 'mouse') return;

  if ((data.type == 'canvas') &&
      this.touchdata['canvas'] &&
      (this.touchdata['canvas'].pinchid === undefined)){
    $('#info').append('<br>pinchstart' + t.identifier);
    this.touchdata['canvas'].pinchid = t.identifier;
    for (var i = 0; i < e.touches.length; i++) {
      $('#info').append('<br>checking touch ' + i);
      if (e.touches[i].identifier == this.touchdata['canvas'].touchid){
        $('#info').append('<br>yes');
        this.be.circuit.canvas_pinch_start(e.touches[i].pageX,
                                           e.touches[i].pageY,
                                           t.pageX, t.pageY);
      }
    }
    return;
  }

  if (this.touchdata[data.type]) return;

  if (e.timeStamp !== undefined){
    var tapdata = this.tapdata[data.type];
    if ((tapdata !== undefined) && (tapdata.jel == data.jel)){
      var delay = e.timeStamp - tapdata.timeStamp;
      if ((delay < 500) && (delay > 0) && data.fn_dbltap){
        data.fn_dbltap.call(data.context, data.extra);
      }
    }
    this.tapdata[data.type] = {
      jel: data.jel,
      timeStamp: e.timeStamp
    };
  }

  if (!this.dragging){
    var doc = $(document);
    doc.on("touchmove.booledrag", $.proxy(this.touchmove, this));
    doc.on("touchend.booledrag", $.proxy(this.touchend, this));
    doc.on("touchcancel.booledrag", $.proxy(this.touchend, this));
  }
  this.dragging = 'touch';

  data.touchid = t.identifier;
  data.pinchid = undefined;
  this.touchdata[data.type] = data;

  data.fn_start.call(data.context, t.pageX, t.pageY, data.extra);
};

Bdrag.prototype.touchmove = function (event) {
  var e = event.originalEvent || event;
  var types = ['canvas', 'speed', 'cell'];
  for (var j = 0; j < types.length; j++) {
    var type = types[j];
    if (this.touchdata[type]){
      for (var i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier == this.touchdata[type].touchid){
          var x = e.touches[i].pageX;
          var y = e.touches[i].pageY;
          this.touchdata[type].fn_move.call(this.touchdata[type].context,
                                            x, y,
                                            this.touchdata[type].extra);
        }
      }
      if (this.touchdata[type].pinchid !== undefined){
        $('#info').append('<br>pinchmove?');
        for (var i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier == this.touchdata[type].pinchid){
            this.be.circuit.canvas_pinch_move(x, y,
                                              e.touches[i].pageX,
                                              e.touches[i].pageY);
          }
        }
      }
    }
  }
};

Bdrag.prototype.touchend = function (event) {
  var e = event.originalEvent || event;
  var types = ['canvas', 'speed', 'cell'];
  for (var j = 0; j < types.length; j++) {
    var type = types[j];
    if (this.touchdata[type]) {
      // Because the iPad sometimes sends the touchend event without all
      // changedTouches, we instead search for missing touches.  This also
      // works for canceltouch.
      for (var i = 0; i < e.touches.length; i++) {
        //$('#info').append('<br>touchend' + e.touches[i].identifier);
        if (e.touches[i].identifier == this.touchdata[type].touchid) break;
      }
      if (i == e.touches.length){
        this.touchdata[type].fn_end.call(this.touchdata[type].context,
                                         this.touchdata[type].extra);
        this.touchdata[type] = undefined;
      }
    }
  }

  if (this.touchdata['canvas'] &&
      (this.touchdata['canvas'].pinchid !== undefined)){
    // The first canvas touch remains, but does its pinch touch remain?
    for (var i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier == this.touchdata[type].pinchid) break;
    }
    if (i == e.touches.length){
      this.touchdata['canvas'].pinchid = undefined;
    }
  }

  if (!e.touches.length) {
    this.dragging = false;
    var doc = $(document);
    doc.off("touchmove.booledrag");
    doc.off("touchend.booledrag");
    doc.off("touchcancel.booledrag");
  }
};
