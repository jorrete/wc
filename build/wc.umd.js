var H=Object.defineProperty,U=Object.defineProperties;var z=Object.getOwnPropertyDescriptors;var L=Object.getOwnPropertySymbols;var B=Object.prototype.hasOwnProperty,I=Object.prototype.propertyIsEnumerable;var y=(n,o,u)=>o in n?H(n,o,{enumerable:!0,configurable:!0,writable:!0,value:u}):n[o]=u,m=(n,o)=>{for(var u in o||(o={}))B.call(o,u)&&y(n,u,o[u]);if(L)for(var u of L(o))I.call(o,u)&&y(n,u,o[u]);return n},E=(n,o)=>U(n,z(o));var h=(n,o,u)=>(y(n,typeof o!="symbol"?o+"":o,u),u);(function(n,o){typeof exports=="object"&&typeof module!="undefined"?o(exports):typeof define=="function"&&define.amd?define(["exports"],o):(n=typeof globalThis!="undefined"?globalThis:n||self,o(n.WebComponent={}))})(this,function(n){"use strict";function o(e,t,...i){return typeof e=="function"?e(i):{isComponent:!0,type:e,children:i,props:t}}function u(e){return{isFragment:!0,children:e}}function T(e){return(Array.isArray(e)?e:[e]).reduce((t,i)=>[...t,...i.isFragment?i.children:[i]],[])}function O(e){return[].slice.call(e.childNodes).reduce((t,i)=>(i.nodeName==="#text"&&(i.nodeValue||"").trim().length===0||t.push(i),t),[])}function N(e,t,i,r){for(let f=0;f<t.length;f++){const s=t[f];if(!i.includes(s)&&("localName"in s&&s.localName===r.type||(s==null?void 0:s.nodeName)==="#text"&&!r.type))return[s,f===e?"complete":"partial"]}return[r.type?document.createElement(r.type):document.createTextNode(""),"new"]}function R(e,t){t===null?e.removeAttribute("class"):Array.isArray(t)?e.classList.add(...t):e.classList.add(...t.split(" "))}function P(e,t){if(!!t)for(const i in d.get(e)||{})i in t||e.removeAttribute(i)}function k(e,t){e.removeAttribute("style"),t!==null&&Object.assign(e.style,t)}function V(e,t,i){const r=e.getAttribute(t);i===null?e.removeAttribute(t):String(i)!==String(r)&&e.setAttribute(t,i)}const d=new WeakMap;function w(e){return e?Object.keys(e).filter(t=>t.startsWith("on")).reduce((t,i)=>E(m({},t),{[i.replace("on","").toLowerCase()]:e[i]}),{}):{}}function W(e,t){const i=w(t);!i||Object.keys(i).forEach(r=>{e.removeEventListener(r,i[r])})}function C(e,t){W(e,d.get(e));const i=w(t);!i||Object.keys(i).forEach(r=>{e.addEventListener(r,i[r])})}function F(e,t){t=t||{},C(e,t),d.set(e,t)}function A(e,t){t=t||{},P(e,t),C(e,t),Object.keys(t).forEach(i=>{const r=t[i];i.startsWith("on")||(i==="class"?R(e,r):i==="style"?k(e,r):V(e,i,r))}),d.set(e,t)}function p(e,t){var f;t=T(t);const i=O(e),r=[];for(let s=0;s<t.length;s++){const c=t[s],[a,l]=N(s,i,r,c);if(c.isComponent)A(a,c==null?void 0:c.props),p(a,c.children);else{const g=c;a.textContent!==g&&(a.textContent=g)}l!=="complete"&&e.appendChild(a),l!=="new"&&r.push(a)}for(let s=0;s<i.length;s++){const c=i[s];r.includes(c)||(f=c==null?void 0:c.parentElement)==null||f.removeChild(c)}}let j="wc";function M(e){j=e}function $(e){return[].map.call(e,(t,i)=>i&&t===t.toUpperCase()?`-${t.toLowerCase()}`:t.toLowerCase()).join("")}function q(e,t=0){for(;e.childNodes[t];)e.removeChild(e.childNodes[t])}class b extends HTMLElement{constructor(){super();h(this,"_context",{});h(this,"_timestamp",null);var s,c;const t=this.constructor;this._context=Object.keys(t.properties).reduce((a,l)=>{var _,v;const g=t.properties[l].value,D=t.properties[l].format||function(G){return G},x=this.getAttribute(l);return E(m({},a),{[l]:(v=(_=x&&D(x))!=null?_:g)!=null?v:null})},{});const i=this.getElementSeed(),r=(s=i.children)==null?void 0:s[0];(r==null?void 0:r.type)==="shadow"?this.attachShadow({mode:((c=r==null?void 0:r.props)==null?void 0:c.mode)||"open"}):q(this),this.doRender(i)}static get tag(){return`${j}-${$(this.name)}`}static get observedAttributes(){return Object.keys(this.properties).filter(t=>{var i;return((i=this.properties[t])==null?void 0:i.attribute)===!0})}render(t){throw console.log(t),Error("implement me")}getElementSeed(){return this.render(this._context)}doRender(t){if(t.type!=="host")throw Error('Root tag in render must be "host"');const i=new Date;this._timestamp=i,window.requestAnimationFrame(()=>{i===this._timestamp&&(A(this,t.props),this.shadowRoot?(F(this.shadowRoot,t.children[0].props),p(this.shadowRoot||this,t.children[0].children)):p(this,t.children))})}attributeChangedCallback(t,i,r){var a;const f=((a=this.constructor.properties)==null?void 0:a[t].format)||function(l){return l},s=this._context[t],c=f(r);c!==s&&this.updateContext({[t]:c})}updateContext(t){Object.assign(this._context,typeof t=="function"?t(this._context):t),this.doRender(this.getElementSeed())}static register(){customElements.define(this.tag,this),console.log("[WComponent][register]",this.tag)}}h(b,"shadow",null),h(b,"properties",{}),n.default=b,n.jsx=o,n.jsxFrag=u,n.render=p,n.setWCPredicate=M,Object.defineProperty(n,"__esModule",{value:!0}),n[Symbol.toStringTag]="Module"});
