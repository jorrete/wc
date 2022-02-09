/** @jsx jsx */
/** @jsxFrag jsxFrag */
import WComponent, { jsx, jsxFrag, render, FunctionComponent, Map } from '../lib/wc';

function FormatBoolean(value: unknown) {
  if (value === '') {
    return true;
  }

  return false;
}

interface FooContext extends Map {
  active: boolean,
  content: string,
  count: number,
}

(class Foo extends WComponent {
  static properties = {
    active: {
      format: FormatBoolean,
      attribute: true,
      value: true,
    },
    content: {
      format: String,
      value: 'Initial foo222!!',
    },
    count: {
      format: Number,
      attribute: true,
      value: 0,
    },
  };

  toggleActive() {
    this.updateContext({
      active: !this._context.active,
    });
  }

  increaseCount() {
    this.updateContext({
      count: ++(this._context.count as number),
    });
  }

  render({ active, content, count }: FooContext) {
    return (
      <host
        active={active ? '' : null}
        count={count}
        style={{
          display: 'block',
          backgroundColor: active ? 'orange' : null,
        }}
      >
        <shadow
          mode="open"
          onclick={() => console.log('shadow')}
        >
          <button
            onclick={() => this.toggleActive()}
          >
            {active ? 'active' : 'inactive'}
          </button>
          <button
            onclick={() => this.increaseCount()}
          >
            add
          </button>
          <div>
            {`${content} - ${count}`}
          </div>
        </shadow>
      </host>
    );
  }
}).register();

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

document.getElementById('one')?.addEventListener('click', () => {
  render(document.getElementById('content')!, One({ mongo: 'x' }));
});

document.getElementById('two')?.addEventListener('click', () => {
  render(document.getElementById('content')!, Two({ mongo: 'y' }));
});

setTimeout(() => {
  document.querySelector('wc-foo')?.setAttribute('count', '5');
  document.querySelector('wc-foo')?.removeAttribute('active');
  document.querySelector('wc-foo')?.setAttribute('count', '7');
}, 1000);
