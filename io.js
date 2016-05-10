function Io(cell, name, type, x, y, hx, hy) {
    this.cell = cell;
    this.name = name;
    this.type = type;

    // x,y is the point to/from which wires are drawn.
    this.x = x;
    this.y = y;

    // hx,hy is the center point of the IO handle.
    this.hx = hx;
    this.hy = hy;

    this.w = [];

    // If any properties of vis_state are true, then the IO handle is visible.
    this.vis_state = {};


    // Public members

    this.connect = function(wire) {
	if ((this.type == "output") && (this.w.length > 0)) {
	    // We want the new wire to be ordered together with the existing
	    // wires connected to the same output.  But we also want the new
	    // wire to be on top.  So we reorder all existing wires to be
	    // displayed at the same Z height as the new wire.
	    for (var i = 0; i < this.w.length; i++) {
		this.w[i].draw_bg.insertBefore(wire.draw_bg);
		this.w[i].draw_fg.insertBefore(wire.draw_fg);
	    }
	}
	this.w.push(wire);
    };

    this.disconnect = function(wire) {
	for (var i = 0; i < this.w.length; i++){
	    if (wire == this.w[i]){
		this.w.splice(i, 1);
		return;
	    }
	}
    };

    this.redraw = function() {
	for (var i = 0; i < this.w.length; i++){
	    this.w[i].redraw();
	}
    };


    // Private functions & members

    this.set_vis = function(type, value) {
	this.vis_state[type] = value;
	for (var name in this.vis_state){
	    if (this.vis_state[name]){
		this.draw.setAttr("visibility", "visible");
		return;
	    }
	}
	this.draw.setAttr("visibility", "hidden");
    }


    var tw = 15;
    var attr = {
	"stroke-width": 1,
	stroke: "#f80",
	fill: "#ff0",
	opacity: "0.80"
    };
    this.draw = this.paper.circle(hx, hy, tw/2, tw/2).attr(attr);
    this.draw.setAttr("visibility", "hidden");
    this.draw.setAttr("pointer-events", "all");


    if (type != "null"){
	this.draw.dblclick($.proxy(this.drag.double_click, this.drag, this));
	this.draw.drag($.proxy(this.drag.drag_move, this.drag, this),
		       $.proxy(this.drag.drag_start, this.drag, this),
		       $.proxy(this.drag.drag_end, this.drag, this));
	this.draw.hover($.proxy(this.drag.hover_start, this.drag, this),
			$.proxy(this.drag.hover_end, this.drag, this));
    }
}
