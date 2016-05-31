// Copyright 2016 Christopher P. Nelson - All rights reserved.

"use strict";

function Bdrag(be) {
  this.be = be;
  this.touchdata = {};
  this.tapdata = {};
}

Bdrag.prototype.drag = function (jel, context, type, callbacks, extra) {
  var data = {
    jel: jel,
    context: context,
    type: type,
    callbacks: callbacks,
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
  // Accept only button 1 (if a button is specified).
  if ((event.which !== undefined) && (event.which != 1)) return;

  event.preventDefault();
  if (this.dragging) return;
  this.dragging = 'mouse';
  this.mousedata = data;

  var doc = $(document);
  doc.on('mousemove.booledrag', $.proxy(this.mousemove, this));
  doc.on('mouseup.booledrag', $.proxy(this.mouseup, this));

  if (data.callbacks.start) {
    data.callbacks.start.call(data.context,
                              event.pageX, event.pageY,
                              data.extra);
  }
};

Bdrag.prototype.mousemove = function (event) {
  if (this.mousedata.callbacks.move) {
    this.mousedata.callbacks.move.call(this.mousedata.context,
                                       event.pageX, event.pageY,
                                       this.mousedata.extra);
  }
};

Bdrag.prototype.mouseup = function (event) {
  this.dragging = false;

  var doc = $(document);
  doc.off('mousemove.booledrag');
  doc.off('mouseup.booledrag');

  if (this.mousedata.callbacks.end) {
    this.mousedata.callbacks.end.call(this.mousedata.context,
                                      this.mousedata.extra);
  }
};

Bdrag.prototype.touchstart = function (data, event) {
  var e = event.originalEvent || event;
  if (data.type != 'cbox') event.preventDefault();
  event.stopPropagation();
  if (this.dragging == 'mouse') return;

  if (e.timeStamp !== undefined){
    var tapdata = this.tapdata[data.type];
    if ((tapdata !== undefined) && (tapdata.jel == data.jel)){
      var delay = e.timeStamp - tapdata.timeStamp;
      if ((delay < 500) && (delay > 0) && data.callbacks.dblclick){
        data.callbacks.dblclick.call(data.context,
                                     e.changedTouches[0].pageX,
                                     e.changedTouches[0].pageY,
                                     data.extra);
        // We allow processing to continue for the touch in case the
        // user wants to drag out a new wire immediately from the
        // double tap.
      }
    }
    this.tapdata[data.type] = {
      jel: data.jel,
      timeStamp: e.timeStamp
    };
  }

  // It is possible for touchstart to be called with multiple touches
  // at once, as long as they are all on the same object.  Normally,
  // we accept only the first, but we accept up to two for a canvas
  // pinch.
  for (var j = 0; j < e.changedTouches.length; j++) {
    var t = e.changedTouches[j];

    // Detect second touch for a pinch.
    if ((data.type == 'canvas') && this.touchdata['canvas'] &&
        (data.pinchid === undefined)){
      data.pinchid = t.identifier;
      for (var i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier == data.touchid){
          data.callbacks.pinch_start.call(data.context,
                                          e.touches[i].pageX,
                                          e.touches[i].pageY,
                                          t.pageX, t.pageY);
        }
      }
      break;
    }

    if (this.touchdata[data.type]) break;

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

    if (data.callbacks.start) {
      data.callbacks.start.call(data.context, t.pageX, t.pageY, data.extra);
    }
  }
};

// touchmove also handles touchend and touchcancel by looking for
// touches that are no longer present.  (Some form of this is
// necessary since the iPad doesn't send proper changedTouches when
// two touches end at once.)
Bdrag.prototype.touchmove = function (event) {
  var e = event.originalEvent || event;
  var types = ['canvas', 'cbox', 'speed', 'cell'];
  for (var j = 0; j < types.length; j++) {
    var type = types[j];
    var data = this.touchdata[type];
    if (data){
      if (data.callbacks.move) {
        for (var i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier == data.touchid){
            var x = e.touches[i].pageX;
            var y = e.touches[i].pageY;
            data.callbacks.move.call(data.context, x, y, data.extra);
            break;
          }
        }
      }

      var deleteme = (i == e.touches.length);
      var deletepinch = false;

      if (data.pinchid !== undefined){
        for (var i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier == data.pinchid){
            if (deleteme){
              deleteme = false;
              data.touchid = data.pinchid;
              data.pinchid = undefined;
              if (data.callbacks.end) {
                data.callbacks.end.call(data.context,
                                        data.extra);
              }
              if (data.callbacks.start) {
                data.callbacks.start.call(data.context,
                                          e.touches[i].pageX,
                                          e.touches[i].pageY,
                                          data.extra);
              }
            } else {
              data.callbacks.pinch_move.call(data.context,
                                             x, y,
                                             e.touches[i].pageX,
                                             e.touches[i].pageY);
            }
            break;
          }
        }
        deletepinch = (i == e.touches.length);
      }

      if (deleteme) {
        if (data.callbacks.end) {
          data.callbacks.end.call(data.context, data.extra);
        }
        this.touchdata[type] = undefined;
      } else if (deletepinch){
        data.pinchid = undefined;
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
