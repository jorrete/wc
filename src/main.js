import './foo';
import Bar from './Bar';
import {render} from 'wc';
// import {CSSStyleDeclaration} from 'typescript/lib/lib.dom';

render(document.getElementById('foo'), Bar());

// const style: CSSStyleDeclaration = {};
// style.backgroundColor = '3d';

const foo = document.createElement('div');
console.log(foo.style);

// const foo: Person = {
//   name: 'xxx',
// };
