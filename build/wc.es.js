var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
function kebabCase(str) {
  return [].map.call(str, (w, i) => {
    if (i && w === w.toUpperCase()) {
      return `-${w.toLowerCase()}`;
    }
    return w.toLowerCase();
  }).join("");
}
function emptyElement(element, from = 0) {
  while (element.childNodes[from]) {
    element.removeChild(element.childNodes[from]);
  }
}
function applyClass(element, cls) {
  if (cls === null) {
    element.classList = "";
  } else {
    element.classList = Array.isArray(cls) ? cls.join(" ") : cls;
  }
}
function cleanAttributes(node) {
  while (node.attributes.length > 0) {
    node.removeAttribute(node.attributes[0].name);
  }
}
function applyStyle(element, style) {
  if (style === null) {
    element.removeAttribute("style");
  } else {
    Object.assign(element.style, style);
  }
}
function applyAttribute(element, name, value) {
  const actualValue = element.getAttribute(name);
  if (value === null && actualValue !== null) {
    element.removeAttribute(name);
  } else if (value !== actualValue) {
    element.setAttribute(name, value);
  }
}
function applyProps(node, props) {
  if (!props) {
    return;
  }
  cleanAttributes(node);
  Object.keys(props).forEach((name) => {
    if (name.startsWith("on")) {
      return;
    }
    switch (name) {
      case "listeners":
      case "children":
        break;
      case "class":
        applyClass(node, props[name]);
        break;
      case "style":
        applyStyle(node, props[name]);
        break;
      default:
        applyAttribute(node, name, props[name]);
        break;
    }
  });
}
function setLiteners(props) {
  props.listeners = Object.keys(props).filter((key) => key.startsWith("on")).reduce((result, key) => {
    return __spreadProps(__spreadValues({}, result), {
      [key.replace("on", "").toLowerCase()]: props[key]
    });
  }, {});
}
function applyListeners(element, listeners) {
  if (!listeners) {
    return;
  }
  Object.keys(listeners).forEach((name) => {
    element.addEventListener(name, listeners[name]);
  });
}
function removeListeners(element, listeners) {
  if (!listeners) {
    return;
  }
  Object.keys(listeners).forEach((name) => {
    element.removeEventListener(name, listeners[name]);
  });
}
function dependenciesAreEqual(depsA, depsB) {
  if (depsA.length !== depsB.length) {
    throw Error("Dependencies not same length");
  }
  for (let index = 0; index < depsB.length; index++) {
    if (depsA[index] !== depsB[index]) {
      return false;
    }
  }
  return true;
}
const nodes = new WeakMap();
function isTextElement(element) {
  return typeof element === "string";
}
function isTextNode(node) {
  var _a;
  return ((_a = node == null ? void 0 : node.constructor) == null ? void 0 : _a.name) === "Text";
}
function getNode(node, element) {
  if (Array.isArray(element)) {
    return [document.createDocumentFragment(), false];
  }
  if (isTextElement(element)) {
    if (isTextNode(node)) {
      return [node, true];
    }
    return [document.createTextNode(""), false];
  }
  const canRecycleElement = (node == null ? void 0 : node.localName) === element.type;
  if (canRecycleElement) {
    return [node, true];
  }
  return [document.createElement(element.type), false];
}
function render(doc, elements) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  if ((elements == null ? void 0 : elements.type) === "host") {
    if (((_b = (_a = nodes == null ? void 0 : nodes.get(doc)) == null ? void 0 : _a.props) == null ? void 0 : _b.dependencies) && ((_c = elements == null ? void 0 : elements.props) == null ? void 0 : _c.dependencies) && dependenciesAreEqual((_e = (_d = nodes.get(doc)) == null ? void 0 : _d.props) == null ? void 0 : _e.dependencies, elements == null ? void 0 : elements.props.dependencies)) {
      return;
    }
    setLiteners(elements.props);
    applyProps(doc, elements.props);
    removeListeners(doc, (_g = (_f = nodes == null ? void 0 : nodes.get(doc)) == null ? void 0 : _f.props) == null ? void 0 : _g.listeners);
    applyListeners(doc, (_h = elements == null ? void 0 : elements.props) == null ? void 0 : _h.listeners);
    if (((_j = (_i = elements == null ? void 0 : elements.props) == null ? void 0 : _i.children) == null ? void 0 : _j.type) === "shadow") {
      render(doc.shadowRoot, (_m = (_l = (_k = elements == null ? void 0 : elements.props) == null ? void 0 : _k.children) == null ? void 0 : _l.props) == null ? void 0 : _m.children);
    } else {
      render(doc, (_n = elements == null ? void 0 : elements.props) == null ? void 0 : _n.children);
    }
    nodes.set(doc, elements);
    return;
  }
  elements = Array.isArray(elements) ? elements : [elements];
  const childNodes = [].slice.call(doc.childNodes);
  emptyElement(doc, childNodes.length - (childNodes.length - elements.length));
  elements.filter(Boolean).forEach((element, index) => {
    var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2;
    const [node, recycled] = getNode(childNodes[index], element);
    if (((_b2 = (_a2 = nodes == null ? void 0 : nodes.get(node)) == null ? void 0 : _a2.props) == null ? void 0 : _b2.dependencies) && (element == null ? void 0 : element.props.dependencies) && dependenciesAreEqual((_d2 = (_c2 = nodes.get(node)) == null ? void 0 : _c2.props) == null ? void 0 : _d2.dependencies, element == null ? void 0 : element.props.dependencies)) {
      return;
    }
    if (isTextElement(element)) {
      if (node.nodeValue !== element) {
        node.nodeValue = element;
      }
    } else if (Array.isArray(element)) {
      render(node, element);
    } else {
      setLiteners(element.props);
      applyProps(node, element.props);
      removeListeners(node, (_f2 = (_e2 = nodes == null ? void 0 : nodes.get(node)) == null ? void 0 : _e2.props) == null ? void 0 : _f2.listeners);
      applyListeners(node, (_g2 = element == null ? void 0 : element.props) == null ? void 0 : _g2.listeners);
      render(node, (_h2 = element == null ? void 0 : element.props) == null ? void 0 : _h2.children);
    }
    nodes.set(node, element);
    if (!childNodes[index]) {
      doc.appendChild(node);
    } else if (!recycled) {
      childNodes[index].replaceWith(node);
    }
  });
}
class WComponent extends HTMLElement {
  static get tag() {
    return `wc-${kebabCase(this.name)}`;
  }
  static get properties() {
    return {};
  }
  static get observedProps() {
    return Object.keys(this.properties).filter((key) => {
      var _a;
      return ((_a = this.properties[key]) == null ? void 0 : _a.attribute) === true;
    });
  }
  static get mode() {
    return "open";
  }
  static get template() {
    return null;
  }
  _render(elements) {
    window.requestAnimationFrame(() => {
      render(this, elements || this.render(this._context));
    });
  }
  updateContext(newContext) {
    Object.assign(this._context, typeof newContext === "function" ? newContext(this._context) : newContext);
    this._render();
  }
  constructor() {
    super();
    var _a, _b;
    this._context = {};
    Object.keys(this.constructor.properties).forEach((key) => {
      var _a2;
      this._context[key] = (_a2 = this.constructor.properties[key].value) != null ? _a2 : null;
    });
    const elements = this.render(this._context);
    if (elements.type === "host" && ((_b = (_a = elements == null ? void 0 : elements.props) == null ? void 0 : _a.children) == null ? void 0 : _b.type) === "shadow") {
      this.attachShadow({ mode: this.constructor.mode });
    } else if (elements) {
      emptyElement(this);
    }
    this._render(elements);
  }
  static register() {
    customElements.define(this.tag, this);
    console.log("[WComponent][register]", this.tag);
  }
}
function jsx(type, props, ...children) {
  if (typeof type === "function") {
    return type(children);
  }
  return {
    type,
    props: __spreadProps(__spreadValues({}, props), {
      children: children.length > 1 ? children : children[0]
    })
  };
}
function jsxFrag(children) {
  return children;
}
export { WComponent as default, jsx, jsxFrag, render };
