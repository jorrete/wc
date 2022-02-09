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
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
function jsx(type, props, ...children) {
  if (typeof type === "function") {
    return type(children);
  }
  return {
    isComponent: true,
    type,
    children,
    props
  };
}
function jsxFrag(children) {
  return {
    isFragment: true,
    children
  };
}
function flattenElements(elementSeeds) {
  return (Array.isArray(elementSeeds) ? elementSeeds : [elementSeeds]).reduce((result, elementSeed) => [
    ...result,
    ...elementSeed.isFragment ? elementSeed.children : [elementSeed]
  ], []);
}
function getTargetChildrens(target) {
  return [].slice.call(target.childNodes).reduce((result, node) => {
    if (node.nodeName === "#text" && (node.nodeValue || "").trim().length === 0) {
      return result;
    }
    result.push(node);
    return result;
  }, []);
}
function getMachElement(index, targetChildrens, recycledChildrens, elementSeed) {
  for (let i = 0; i < targetChildrens.length; i++) {
    const element = targetChildrens[i];
    if (recycledChildrens.includes(element)) {
      continue;
    }
    if ("localName" in element && element.localName === elementSeed.type || (element == null ? void 0 : element.nodeName) === "#text" && !elementSeed.type) {
      return [
        element,
        i === index ? "complete" : "partial"
      ];
    }
  }
  return [
    elementSeed.type ? document.createElement(elementSeed.type) : document.createTextNode(""),
    "new"
  ];
}
function applyClass(element, cls) {
  if (cls === null) {
    element.removeAttribute("class");
  } else {
    if (Array.isArray(cls)) {
      element.classList.add(...cls);
    } else {
      element.classList.add(...cls.split(" "));
    }
  }
}
function cleanAttributes(element, props) {
  if (!props) {
    return;
  }
  for (const key in oldProps.get(element) || {}) {
    if (!(key in props)) {
      element.removeAttribute(key);
    }
  }
}
function applyStyle(element, style) {
  element.removeAttribute("style");
  if (style !== null) {
    Object.assign(element.style, style);
  }
}
function applyAttribute(element, name, value) {
  const actualValue = element.getAttribute(name);
  if (value === null) {
    element.removeAttribute(name);
  } else if (String(value) !== String(actualValue)) {
    element.setAttribute(name, value);
  }
}
const oldProps = new WeakMap();
function getLiteners(props) {
  if (!props) {
    return {};
  }
  return Object.keys(props).filter((key) => key.startsWith("on")).reduce((result, key) => {
    return __spreadProps(__spreadValues({}, result), {
      [key.replace("on", "").toLowerCase()]: props[key]
    });
  }, {});
}
function removeListeners(element, props) {
  const listeners = getLiteners(props);
  if (!listeners) {
    return;
  }
  Object.keys(listeners).forEach((name) => {
    element.removeEventListener(name, listeners[name]);
  });
}
function applyListeners(element, props) {
  removeListeners(element, oldProps.get(element));
  const listeners = getLiteners(props);
  if (!listeners) {
    return;
  }
  Object.keys(listeners).forEach((name) => {
    element.addEventListener(name, listeners[name]);
  });
}
function applyPropsToShadow(element, props) {
  props = props || {};
  applyListeners(element, props);
  oldProps.set(element, props);
}
function applyPropsToElement(element, props) {
  props = props || {};
  cleanAttributes(element, props);
  applyListeners(element, props);
  Object.keys(props).forEach((name) => {
    const prop = props[name];
    if (name.startsWith("on")) {
      return;
    } else if (name === "class") {
      applyClass(element, prop);
    } else if (name === "style") {
      applyStyle(element, prop);
    } else {
      applyAttribute(element, name, prop);
    }
  });
  oldProps.set(element, props);
}
function render(target, elementSeeds) {
  var _a;
  elementSeeds = flattenElements(elementSeeds);
  const targetChildrens = getTargetChildrens(target);
  const recycledChildrens = [];
  for (let i = 0; i < elementSeeds.length; i++) {
    const elementSeed = elementSeeds[i];
    const [element, matchType] = getMachElement(i, targetChildrens, recycledChildrens, elementSeed);
    if (elementSeed.isComponent) {
      applyPropsToElement(element, elementSeed == null ? void 0 : elementSeed.props);
      render(element, elementSeed.children);
    } else {
      const content = elementSeed;
      if (element.textContent !== content) {
        element.textContent = content;
      }
    }
    if (matchType !== "complete") {
      target.appendChild(element);
    }
    if (matchType !== "new") {
      recycledChildrens.push(element);
    }
  }
  for (let i = 0; i < targetChildrens.length; i++) {
    const children = targetChildrens[i];
    if (!recycledChildrens.includes(children)) {
      (_a = children == null ? void 0 : children.parentElement) == null ? void 0 : _a.removeChild(children);
    }
  }
}
let PRE_TAG = "wc";
function setWCPredicate(predicate) {
  PRE_TAG = predicate;
}
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
class WComponent extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "_context", {});
    __publicField(this, "_timestamp", null);
    var _a, _b;
    const constructor = this.constructor;
    this._context = Object.keys(constructor.properties).reduce((result, key) => {
      var _a2, _b2;
      const initialValue = constructor.properties[key].value;
      const format = constructor.properties[key].format || function(value) {
        return value;
      };
      const attributeValue = this.getAttribute(key);
      return __spreadProps(__spreadValues({}, result), {
        [key]: (_b2 = (_a2 = attributeValue && format(attributeValue)) != null ? _a2 : initialValue) != null ? _b2 : null
      });
    }, {});
    const elementSeed = this.getElementSeed();
    const firstChild = (_a = elementSeed.children) == null ? void 0 : _a[0];
    const hasShadow = (firstChild == null ? void 0 : firstChild.type) === "shadow";
    if (hasShadow) {
      this.attachShadow({ mode: ((_b = firstChild == null ? void 0 : firstChild.props) == null ? void 0 : _b.mode) || "open" });
    } else {
      emptyElement(this);
    }
    this.doRender(elementSeed);
  }
  static get tag() {
    return `${PRE_TAG}-${kebabCase(this.name)}`;
  }
  static get observedAttributes() {
    return Object.keys(this.properties).filter((key) => {
      var _a;
      return ((_a = this.properties[key]) == null ? void 0 : _a.attribute) === true;
    });
  }
  render(context) {
    console.log(context);
    throw Error("implement me");
  }
  getElementSeed() {
    return this.render(this._context);
  }
  doRender(elementSeed) {
    if (elementSeed.type !== "host") {
      throw Error('Root tag in render must be "host"');
    }
    const timestamp = new Date();
    this._timestamp = timestamp;
    window.requestAnimationFrame(() => {
      if (timestamp !== this._timestamp) {
        return;
      }
      applyPropsToElement(this, elementSeed.props);
      if (this.shadowRoot) {
        applyPropsToShadow(this.shadowRoot, elementSeed.children[0].props);
        render(this.shadowRoot || this, elementSeed.children[0].children);
      } else {
        render(this, elementSeed.children);
      }
    });
  }
  attributeChangedCallback(name, _, newValue) {
    var _a;
    const format = ((_a = this.constructor.properties) == null ? void 0 : _a[name].format) || function(value) {
      return value;
    };
    const actualValue = this._context[name];
    const formattedValue = format(newValue);
    if (formattedValue === actualValue) {
      return;
    }
    this.updateContext({
      [name]: formattedValue
    });
  }
  updateContext(newContext) {
    Object.assign(this._context, typeof newContext === "function" ? newContext(this._context) : newContext);
    this.doRender(this.getElementSeed());
  }
  static register() {
    customElements.define(this.tag, this);
    console.log("[WComponent][register]", this.tag);
  }
}
__publicField(WComponent, "shadow", null);
__publicField(WComponent, "properties", {});
export { WComponent as default, jsx, jsxFrag, render, setWCPredicate };
