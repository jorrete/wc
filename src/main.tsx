/** @jsx jsx */
/** @jsxFrag jsxFrag */
import './foo';
import { jsx, jsxFrag, render, FunctionComponent } from 'wc';

interface HellowWorldProps {
  mongo: string
}

const One: FunctionComponent<HellowWorldProps> = ({ mongo }) => {
  return (
    <div
      style={{
        backgroundColor: 'red',
      }}
      test="3"
      gonto="3"
      onclick={() => {
        console.log('clic');
      }}
    >
      <div>
        {`mongo ${mongo}`}
      </div>
    </div>
  );
};

function Two({ mongo }: HellowWorldProps) {
  return(
    <div
      style={{
        color: 'blue',
      }}
      test="4"
      gonto="3"
      ponto="x"
    >
      <>
        <div>
          {`mongo ${mongo}`}
        </div>
      </>
      xxxx
    </div>
  );
}

function Foo() {
  return (
    <wc-foo active=""></wc-foo>
  );
}

document.getElementById('one')?.addEventListener('click', () => {
  render(document.getElementById('content')!, One({ mongo: 'x' }));
});

document.getElementById('two')?.addEventListener('click', () => {
  render(document.getElementById('content')!, Two({ mongo: 'y' }));
});

document.getElementById('modify')?.addEventListener('click', () => {
  document.querySelector('wc-foo')?.setAttribute('count', '5');
  document.querySelector('wc-foo')?.removeAttribute('active');
  document.querySelector('wc-foo')?.setAttribute('count', '7');
});

render(document.getElementById('wc')!, Foo());
