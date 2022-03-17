# WC (WebComponent) pre-alpha (demo) - test

Microframework for **Web Components** authoring.

Explore the use of typescript, custom JSX parsing and vite.

## Development and testing

```
git clone https://github.com/jorrete/wc.git
cd wc
npm install
cd example
npm install
npm run dev
```

## Example
```jsx
import WComponent, { Map } from 'wc';
import style from './foo.scss?inline';
import './style.css';

function FormatBoolean(value: unknown) {
  if (typeof value === 'string') {
    return true;
  }

  return false;
}

interface FooContext extends Map {
  active: boolean,
  content: string,
  count: number,
}

class Foo extends WComponent {
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
        onclick={() => console.log('host')}
      >
        <shadow
          mode="open"
          onclick={() => console.log('shadow')}
        >
          <style>{style}</style>
          <button
            id="button1"
            onclick={() => this.toggleActive()}
          >
            {active ? 'deactivate' : 'activate'}
          </button>
          <button
            id="button2"
            onclick={() => this.increaseCount()}
          >
            add
          </button>
          <div
            onpointerdown={(event: EventTarget) => console.log('down', event)}
            count={count}
            style={{
              color: active ? 'orange' : null,
            }}
          >
            {`${content} - ${count}`}
          </div>
        </shadow>
      </host>
    );
  }
}

export default Foo;
```
