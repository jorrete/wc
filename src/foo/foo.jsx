/** @jsx jsx */
import WComponent, {jsx} from '../../lib';
import style from './foo.scss?inline';

class Foo extends WComponent {
  static tag = 'wc-foo';
  static properties = {
    active: {
      type: Boolean,
      attribute: true,
      reflected: true,
      value: true,
    },
    content: {
      type: String,
      value: 'Initial foo222!!',
    },
    count: {
      type: Number,
      value: 0,
    },
  };

  render({ active, content, count }) {
    const listeners = {
      click: () => {
        console.log('click');
        this.updateContext({ active: !active, count: count + 1 });
      },
    };

    return (
      <host
        active={active}
        style={{
          backgroundColor: active ? 'gold' : null,
        }}
      >
        <shadow>
          <style>{style}</style>
          <button id="innerbutton" listeners={listeners}>clickme</button>
          <div>{count.toString()}</div>
          {
            active
              ? (
                <div>
                  {content}
                </div>
              )
              : (
                <header>
                  <div>
                  foo
                  </div>
                  <div>
                  foo2
                  </div>
                </header>
              )
          }
          <div>
            <slot />
          </div>
        </shadow>
      </host>
    );
  }
}

export default Foo;
