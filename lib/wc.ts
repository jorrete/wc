function jsx(
  type: string | unknown,
  props: object,
  ...children: object[]
): object | object[] {
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

function jsxFrag(
  children: object[],
): object {
  return {
    isFragment: true,
    children,
  };
}

interface Map {
  [key: string]: unknown
}

interface ElementSeed {
  type: string,
  props: Map,
  children: ElementSeed[],
  isComponent?: boolean,
  isFragment?: boolean,
}

type FunctionComponent<T> = {
  (arg0: T): ElementSeed
}

type Node = HTMLElement | ChildNode

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
 * @returns {Node[]} [TODO:description]
 */
function getTargetChildrens(
  target: HTMLElement | DocumentFragment | Element,
): Node[] {
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
  targetChildrens: Node[],
  recycledChildrens: Node[],
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

type Class = string | string[] | null;

function applyClass(
  element: HTMLElement,
  cls: Class,
) {
  if (cls === null) {
    element.removeAttribute('class');
  } else {
    if (Array.isArray(cls)) {
      element.classList.add(...cls);
    } else {
      element.classList.add(...cls.split(' '));
    }
  }
}

function cleanAttributes(
  element: HTMLElement,
  props: object,
) {
  if (!props) {
    return;
  }

  for (const key in (oldProps.get(element) || {})) {
    if (!(key in props)) {
      element.removeAttribute(key);
    }
  }
}

function applyStyle(
  element: HTMLElement,
  style: object
) {
  element.removeAttribute('style');
  if (style !== null) {
    Object.assign(element.style, style);
  }
}

function applyAttribute(
  element: HTMLElement,
  name: string,
  value: unknown,
) {
  const actualValue = element.getAttribute(name);
  if (value === null) {
    element.removeAttribute(name);
  } else if (String(value) !== String(actualValue)) {
    element.setAttribute(name, value as string);
  }
}

// type EventListener = (event: object) => void;
const oldProps = new WeakMap();

interface Listeners {
  [key: string]: (event: object) => void
}

function getLiteners(
  props: Map,
): Listeners {
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

function removeListeners(
  element: HTMLElement | ShadowRoot,
  props: Map,
) {
  const listeners = getLiteners(props);

  if (!listeners) {
    return;
  }

  Object.keys(listeners).forEach((name) => {
    element.removeEventListener(name, listeners[name]);
  });
}

function applyListeners(
  element: HTMLElement | ShadowRoot,
  props: Map,
) {
  removeListeners(element, oldProps.get(element));

  const listeners = getLiteners(props);

  if (!listeners) {
    return;
  }

  Object.keys(listeners).forEach((name) => {
    element.addEventListener(name, listeners[name]);
  });
}

function applyPropsToShadow(
  element: HTMLElement | ShadowRoot,
  props: Map,
) {
  props = props || {};
  applyListeners(element, props);
  oldProps.set(element, props);
}

function applyPropsToElement(
  element: HTMLElement,
  props: Map,
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
      applyClass(element, prop as Class);
    } else if (name === 'style') {
      // TODO clean old styles
      applyStyle(element, prop as object);
    } else {
      applyAttribute(element, name, prop);
    }
  });
  oldProps.set(element, props);
}

function render(
  target: HTMLElement | DocumentFragment | Element,
  elementSeeds: ElementSeed | ElementSeed[],
) {
  elementSeeds = flattenElements(elementSeeds);
  const targetChildrens = getTargetChildrens(target);
  const recycledChildrens: Node[] = [];

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
      applyPropsToElement(element as HTMLElement, elementSeed?.props as Map);
      render(element as HTMLElement, elementSeed.children);
    // Text node
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
      children?.parentElement?.removeChild(children);
    }
  }
}

// eslint-disable-next-line prefer-const
let PRE_TAG = 'wc';

function setWCPredicate(predicate: string) {
  PRE_TAG = predicate;
}

function kebabCase(
  str: string,
) {
  return [].map.call(str, (w, i) => {
    if (i && w === (w as string).toUpperCase()) {
      return `-${(w as string).toLowerCase()}`;
    }

    return (w as string).toLowerCase();
  }).join('');
}

function emptyElement(
  element: HTMLElement,
  from: number = 0,
) {
  while (element.childNodes[from]) {
    element.removeChild(element.childNodes[from]);
  }
}

type properties = {
  [key: string]: {
    value: unknown,
    attribute?: boolean,
    format?: (arg0: unknown | null) => void,
  }
}

class WComponent extends HTMLElement {
  static shadow = null;

  static properties: properties = {};

  static get tag(): string {
    return `${PRE_TAG}-${kebabCase(this.name)}`;
  }
  static get observedAttributes() {
    return Object.keys(this.properties)
      .filter((key: string) => this.properties[key]?.attribute === true);
  }

  _context: Map = {};

  _timestamp: Date | null = null;

  render(context: Map): ElementSeed {
    console.log(context); // TODO remove
    throw Error('implement me');
  }

  getElementSeed(): ElementSeed {
    return this.render(this._context);
  }

  doRender(elementSeed: ElementSeed) {
    if (elementSeed.type !== 'host') {
      throw Error('Root tag in render must be "host"');
    }

    applyPropsToElement(this, elementSeed.props as Map);

    if (this.shadowRoot) {
      applyPropsToShadow(this.shadowRoot, elementSeed.children[0].props as Map);
      render(this.shadowRoot || this, elementSeed.children[0].children);
    } else {
      render(this, elementSeed.children);
    }
  }

  attributeChangedCallback(
    name: string,
    _: string | null,
    newValue: string | null,
  ) {
    const format = (
      (this.constructor as typeof WComponent).properties?.[name].format
      || function (value: unknown) { return value; }
    );
    const actualValue = this._context[name];
    const formattedValue = format(newValue);

    if (formattedValue === actualValue) {
      return;
    }

    this.updateContext({
      [name]: formattedValue,
    });
  }

  processContext(newContext: Map | ((arg0: Map) => Map)) {
    newContext = (
      typeof newContext === 'function'
        ? newContext(this._context)
        : newContext
    );
    Object.assign(this._context, newContext);
  }

  updateContext(newContext: Map) {
    this.processContext(newContext);

    const timestamp = new Date();
    this._timestamp  = timestamp;

    window.requestAnimationFrame(() => {
      if (timestamp !== this._timestamp) {
        return;
      }

      this.doRender(this.getElementSeed());
    });
  }

  connectedCallback() {
    console.log('connected');
  }

  constructor() {
    super();

    const constructor = (this.constructor as typeof WComponent);

    this._context = Object.keys(constructor.properties).reduce((result, key) => {
      const initialValue = constructor.properties[key].value;
      const format = constructor.properties[key].format || function (value: unknown) { return  value; };
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
      this.attachShadow({ mode: (firstChild?.props?.mode as ShadowRootMode) || 'open' });
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
  ElementSeed,
  FunctionComponent,
  Map,
  jsx,
  jsxFrag,
  render,
  setWCPredicate,
};
