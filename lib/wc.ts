type DOMCSSProperties = {
  [key in keyof Omit<
  CSSStyleDeclaration,
  | 'item'
  | 'setProperty'
  | 'removeProperty'
  | 'getPropertyValue'
  | 'getPropertyPriority'
  >]?: string | number | null | undefined;
};

declare interface HTMLAttributes {
  style?: DOMCSSProperties;
  update?: any[],
  class?: string[],
}

declare namespace JSX {
  export interface IntrinsicElements {
    h1: object,
    div: HTMLAttributes,
  }
}

function jsxFrag(children: object[]): object {
  return {
    isFragment: true,
    children,
  };
}

function jsx(type: string | unknown, props: object, ...children: object[]): object | object[] {
  if (typeof type === 'function') {
    return type(children);
  }

  return {
    isComponent: true,
    type,
    children,
    props,
  };
}

interface ElementProps {
  id?: string,
  class?: string[],
}

interface ElementSeed {
  type: string,
  props: ElementProps,
  children: ElementSeed[],
  isComponent?: boolean,
  isFragment?: boolean,
}

function addClassToElement(element: HTMLElement, cls: string[]) {
  element.classList.add(...cls);
}

function isElementMatch(element: HTMLElement | ChildNode, elementSeed: ElementSeed) {
  if (element && 'localName' in element && element.localName === elementSeed.type) {
    return true;
  }

  return false;
}

/**
 * Detect fragment and flattern children son we can match actual DOM element
 * children with new elements in the loop
 *
 * @param {ElementSeed | ElementSeed[]} elementSeeds - [TODO:description]
 * @returns {ElementSeed[]} [TODO:description]
 */
function flattenElements(
  elementSeeds: ElementSeed | ElementSeed[]
): ElementSeed[] {
  return (Array.isArray(elementSeeds) ? elementSeeds : [elementSeeds])
    .reduce((result: ElementSeed[], elementSeed: ElementSeed) => [
      ...result,
      ...(elementSeed.isFragment ? elementSeed.children : [elementSeed]),
    ], []);
}

/**
 * Get DOM element childrens from target ignoring empty text nodes
 *
 * @param {HTMLElement | DocumentFragment} target - [TODO:description]
 * @returns {unknown[]} [TODO:description]
 */
function getTargetChildrens(
  target: HTMLElement | DocumentFragment,
): unknown[] {
  return [].slice.call(target.childNodes)
    .reduce((result: ChildNode[], node: ChildNode) => {
      // ignore emtpy text nodes caused by indentation
      if (node.nodeName === '#text' && (node.nodeValue || '').trim().length === 0) {
        return result;
      }

      result.push(node);
      return result;
    }, []);
}

type MatchType = 'new' | 'partial' | 'complete';

function getMachElement(
  index: number,
  targetChildrens: (HTMLElement | ChildNode)[],
  recycledChildrens: (HTMLElement | ChildNode)[],
  elementSeed: ElementSeed,
): [HTMLElement | ChildNode, MatchType] {
  for (let i = 0; i < targetChildrens.length; i++) {
    const element = targetChildrens[i];

    if (recycledChildrens.includes(element)) {
      continue;
    }

    if (
      'localName' in element && element.localName === elementSeed.type
      || (element as ChildNode)?.nodeName === '#text' && !elementSeed.type
    ) {
      return [
        element,
        i === index ? 'complete' : 'partial',
      ];
    }
  }

  return [
    (
      elementSeed.type
        ? document.createElement(elementSeed.type)
        : document.createTextNode('')
    ),
    'new',
  ];
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

function cleanAttributes(element, props) {
  if (!props) {
    return;
  }

  for (const key in (oldProps.get(element) || {})) {
    if (!(key in props)) {
      element.removeAttribute(key);
    }
  }
}

function applyStyle(element, style) {
  element.removeAttribute('style');
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

  return Object.keys(props)
    .filter((key) => key.startsWith('on'))
    .reduce((result, key) => {
      return {
        ...result,
        [key.replace('on', '').toLowerCase()]: props[key],
      };
    },{});
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

function dependenciesAreEqual(depsA = [], depsB = []) {
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

function applyPropsToShadow(
  element: (HTMLElement | ChildNode),
  props: object,
) {
  props = props || {};
  // new props
  applyListeners(element, props);
  oldProps.set(element, props);
}

function applyPropsToElement(
  element: (HTMLElement | ChildNode),
  props: object,
) {
  props = props || {};

  // clean
  cleanAttributes(element, props);

  // new props
  applyListeners(element, props);

  // new attributes
  Object.keys(props).forEach((name) => {
    const prop = props[name];

    if (name.startsWith('on')) {
      return;
    } else if (name === 'class') {
      applyClass(element, prop);
    } else if (name === 'style') {
      // TODO clean old styles
      applyStyle(element, prop);
    } else {
      applyAttribute(element, name, prop);
    }
  });
  oldProps.set(element, props);
}

function render(
  target: HTMLElement | DocumentFragment,
  elementSeeds: ElementSeed | ElementSeed[],
) {
  elementSeeds = flattenElements(elementSeeds);
  const targetChildrens = getTargetChildrens(target);
  const recycledChildrens: unknown[] = [];

  // loop over element seeds to reuse or create DOM elements
  for (let i = 0; i < elementSeeds.length; i++) {
    const elementSeed = elementSeeds[i];
    const [element, matchType] = getMachElement(
      i,
      targetChildrens,
      recycledChildrens,
      elementSeed,
    );

    // HTMLElement
    if (elementSeed.isComponent)  {
      applyPropsToElement(element, elementSeed?.props);
      render(element as HTMLElement, elementSeed.children);
    // NodeText
    } else {
      const content = elementSeed as unknown as string;
      if (element.textContent !== content) {
        element.textContent = content;
      }
    }

    if (matchType !== 'complete') {
      target.appendChild(element);
    }

    if (matchType !== 'new') {
      recycledChildrens.push(element);
    }
  }

  // clean childrens that has not been recycled
  for (let i = 0; i < targetChildrens.length; i++) {
    const children = targetChildrens[i];

    if (!recycledChildrens.includes(children)) {
      children.parentElement.removeChild(children);
    }
  }
}

// eslint-disable-next-line prefer-const
let PRE_TAG = 'wc';

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

class WComponent extends HTMLElement {
  static shadow = null;

  static get tag() {
    return `${PRE_TAG}-${kebabCase(this.name)}`;
  }

  static get properties() {
    return {};
  }

  static get observedAttributes() {
    return Object.keys(this.properties).filter((key) => this.properties[key]?.attribute === true);
  }

  _context = {};

  render(context) {
    throw Error('implement me');
  }

  getElementSeed() {
    return this.render(this._context);
  }

  doRender(elementSeed) {

    if (elementSeed.type !== 'host') {
      throw Error('Root tag in render must be "host"');
    }
    const timestamp = new Date();

    this._timestamp  = timestamp;

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

  attributeChangedCallback(name, oldValue, newValue) {
    const format = this.constructor.properties?.[name].format || function (value) { return value; };
    const actualValue = this._context[name];
    const formattedValue = format(newValue);

    if (formattedValue === actualValue) {
      return;
    }

    this.updateContext({
      [name]: formattedValue,
    });
  }

  updateContext(newContext) {
    Object.assign(this._context, (
      typeof newContext === 'function'
        ? newContext(this._context)
        : newContext
    ));

    this.doRender(this.getElementSeed());
  }

  constructor() {
    super();

    this._context = Object.keys(this.constructor.properties).reduce((result, key) => {
      const initialValue = this.constructor.properties[key].value;
      const format = this.constructor.properties[key].format || function (value) { return  value; };
      const attributeValue = this.getAttribute(key);
      return {
        ...result,
        [key]: (
          (attributeValue && format(attributeValue))
          ?? initialValue
          ?? null
        ),
      };
    }, {});

    const elementSeed = this.getElementSeed();

    const firstChild = elementSeed.children?.[0];
    const hasShadow = firstChild?.type === 'shadow';

    if (hasShadow) {
      this.attachShadow({ mode: firstChild?.props?.mode || 'open' });
    } else {
      emptyElement(this);
    }

    this.doRender(elementSeed);
  }

  static register() {
    customElements.define(this.tag, this);
    // eslint-disable-next-line no-console
    console.log('[WComponent][register]', this.tag);
  }
}

export {
  WComponent as default,
  PRE_TAG,
  jsx,
  jsxFrag,
  render,
};
