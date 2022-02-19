declare module '*.scss?inline';

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

interface Attributes {
  [key: string]: unknown,
  style?: DOMCSSProperties | string,
}

declare namespace JSX {
  interface IntrinsicElements {
    [key: string]: Attributes;
  }
  export interface ElementChildrenAttribute {
    children: unknown;
  }
}
