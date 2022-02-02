/* eslint-disable no-nested-ternary */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
function kebabCase(str) {
  return [].map.call(str, (w, i) => {
    if (i && w === w.toUpperCase()) {
      return `-${w.toLowerCase()}`;
    }

    return w.toLowerCase();
  }).join('');
}

function emptyElement(element, from = 0) {
  while (element.childNodes[from]) {
    element.removeChild(element.childNodes[from]);
  }
}

function applyClass(element, cls) {
  if (cls === null) {
    element.classList = '';
  } else {
    element.classList = (
      Array.isArray(cls)
        ? cls.join(' ')
        : cls
    );
  }
}

function cleanAttributes(node) {
  while (node.attributes.length > 0) {
    node.removeAttribute(node.attributes[0].name);
  }
}

function applyStyle(element, style) {
  if (style === null) {
    element.removeAttribute('style');
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
    switch (name) {
    case 'listeners':
    case 'children':
      break;
    case 'class':
      applyClass(node, props[name]);
      break;
    case 'style':
      applyStyle(node, props[name]);
      break;
    default:
      applyAttribute(node, name, props[name]);
      break;
    }
  });
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
    throw Error('Dependencies not same length');
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
  return typeof element === 'string';
}

function isTextNode(node) {
  return node?.constructor?.name === 'Text';
}

function getNode(node, element) {
  if (isTextElement(element)) {
    if (isTextNode(node)) {
      return [node, true];
    }

    return [document.createTextNode(''), false];
  }

  const canRecycleElement = (
    node?.localName === element.type
      && node?.childNodes?.length === element?.props?.children?.length
  );

  if (canRecycleElement) {
    return [node, true];
  }

  return [document.createElement(element.type), false];
}

function render(doc, elements) {
  if (elements?.type === 'host') {
    if (
      nodes?.get(doc)?.props?.dependencies
        && elements?.props?.dependencies
        && dependenciesAreEqual(nodes.get(doc)?.props?.dependencies, elements?.props.dependencies)
    ) {
      return;
    }

    applyProps(doc, elements.props);
    removeListeners(doc, nodes?.get(doc)?.props?.listeners);
    applyListeners(doc, elements?.props?.listeners);

    if (elements?.props?.children?.type === 'shadow') {
      render(doc.shadowRoot, elements?.props?.children?.props?.children);
    } else {
      render(doc, elements?.props?.children);
    }

    nodes.set(doc, elements);
    return;
  }

  elements = (Array.isArray(elements) ? elements: [elements]);
  const childNodes = [].slice.call(doc.childNodes);
  emptyElement(doc, childNodes.length - (childNodes.length - elements.length));

  elements.filter(Boolean).forEach((element, index) => {
    const [node, recycled] = getNode(childNodes[index], element);

    // check dependencies
    if (
      nodes?.get(node)?.props?.dependencies
        && element?.props.dependencies
        && dependenciesAreEqual(nodes.get(node)?.props?.dependencies, element?.props.dependencies)
    ) {
      return;
    }

    // update node
    if (isTextElement(element)) {
      if (node.nodeValue !== element) {
        node.nodeValue = element;
      }
    } else {
      applyProps(node, element.props);
      removeListeners(node, nodes?.get(node)?.props?.listeners);
      applyListeners(node, element?.props?.listeners);
      render(node, element?.props?.children);
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
    return Object.keys(this.properties).filter((key) => this.properties[key]?.attribute);
  }

  static get mode() {
    return 'open';
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
    Object.assign(this._context, (
      typeof newContext === 'function'
        ? newContext(this._context)
        : newContext
    ));

    this._render();
  }

  constructor() {
    super();

    this._context = {};

    Object.keys(this.constructor.properties).forEach((key) => {
      this._context[key] = this.constructor.properties[key].value ?? null;
    });

    const elements = this.render(this._context);

    if (elements.type === 'host' && elements?.props?.children?.type === 'shadow') {
      this.attachShadow({ mode: this.constructor.mode });
    } else if (elements) {
      emptyElement(this);
    }

    this._render(elements);
  }

  static register() {
    customElements.define(this.tag, this);
    // eslint-disable-next-line no-console
    console.log('[WComponent][register]', this.tag);
  }
}

function jsx(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.length > 1 ? children : children[0],
    }
  };
}

export {
  WComponent as default,
  jsx,
};
