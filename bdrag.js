// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Bdrag(be) {
  this.be = be;
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
};

Bdrag.prototype.mousedown = function (data, event) {
  event.preventDefault();
  if (this.dragging) return;
  this.dragging = 'mouse';
  this.mousedata = data;

  var doc = $(document);
  doc.on('mousemove.booledrag', $.proxy(this.mousemove, this));
  doc.on('mouseup.booledrag', $.proxy(this.mouseup, this));

  data.fn_start.call(data.context, event.pageX, event.pageY, data.extra);
};

Bdrag.prototype.mousemove = function (event) {
  this.mousedata.fn_move.call(this.mousedata.context, event.pageX, event.pageY,
                              this.mousedata.extra);
};

Bdrag.prototype.mouseup = function (event) {
  this.dragging = false;

  var doc = $(document);
  doc.off('mousemove.booledrag');
  doc.off('mouseup.booledrag');

  this.mousedata.fn_end.call(this.mousedata.context,
                             this.mousedata.extra);
};

Bdrag.prototype.touchstart = function (data, event) {
  var e = event.originalEvent || event;
  var t = e.changedTouches[0];
  event.preventDefault();
  event.stopPropagation();
  if (this.dragging == 'mouse') return;

  if ((data.type == 'canvas') &&
      this.touchdata['canvas'] &&
      (this.touchdata['canvas'].pinchid === undefined)){
    this.touchdata['canvas'].pinchid = t.identifier;
    for (var i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier == this.touchdata['canvas'].touchid){
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
    doc.on('touchmove.booledrag', $.proxy(this.touchmove, this));
    doc.on('touchend.booledrag', $.proxy(this.touchmove, this));
    doc.on('touchcancel.booledrag', $.proxy(this.touchmove, this));
  }
  this.dragging = 'touch';

  data.touchid = t.identifier;
  data.pinchid = undefined;
  this.touchdata[data.type] = data;

  data.fn_start.call(data.context, t.pageX, t.pageY, data.extra);
};

// touchmove also handles touchend and touchcancel by looking for
// touches that are no longer present.  (Some form of this is
// necessary since the iPad doesn't send proper changedTouches when
// two touches end at once.)
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
          break;
        }
      }

      var deleteme = (i == e.touches.length);
      var deletepinch = false;

      if (this.touchdata[type].pinchid !== undefined){
        for (var i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier == this.touchdata[type].pinchid){
            if (deleteme){
              deleteme = false;
              this.touchdata[type].touchid = this.touchdata[type].pinchid;
              this.touchdata[type].pinchid = undefined;
              this.touchdata[type].fn_end.call(data.context,
                                               data.extra);
              this.touchdata[type].fn_start.call(data.context,
                                                 e.touches[i].pageX,
                                                 e.touches[i].pageY,
                                                 data.extra);
            } else {
              this.be.circuit.canvas_pinch_move(x, y,
                                                e.touches[i].pageX,
                                                e.touches[i].pageY);
            }
            break;
          }
        }
        deletepinch = (i == e.touches.length);
      }

      if (deleteme) {
        this.touchdata[type].fn_end.call(this.touchdata[type].context,
                                         this.touchdata[type].extra);
        this.touchdata[type] = undefined;
      } else if (deletepinch){
        this.touchdata[type].pinchid = undefined;
      }
    }
  }

  if (!e.touches.length) {
    this.dragging = false;
    var doc = $(document);
    doc.off('touchmove.booledrag');
    doc.off('touchend.booledrag');
    doc.off('touchcancel.booledrag');
  }
};
