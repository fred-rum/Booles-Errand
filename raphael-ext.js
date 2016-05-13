// Copyright 2016 Christopher P. Nelson - All rights reserved.

function ExtendRaphael () {
  Raphael.el.setAttr = function(attrName, value) {
    this.node.setAttribute(attrName, value);
  };
  for (var method in Raphael.el) {
    if (Raphael.el.hasOwnProperty(method) &&
        !Raphael.st.hasOwnProperty(method)) {
      Raphael.st[method] = (function (methodname) {
        return function () {
          var arg = arguments;
          return this.forEach(function (el) {
            el[methodname].apply(el, arg);
          });
        };
      })(method);
    }
  }
}
