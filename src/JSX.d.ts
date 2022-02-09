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

declare interface Attributes {
  [key: string]: unknown,
  style?: DOMCSSProperties,
}

declare namespace JSX {
  export interface IntrinsicElements {
    [key: string]: Attributes;
  }
}
