/* type DOMCSSProperties = {
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
} */
