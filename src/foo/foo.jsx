/* eslint-disable no-unused-vars */
/** @jsx jsx */
/** @jsxFrag jsxFrag */
import WComponent, {jsx, jsxFrag} from 'wc';
import style from './foo.scss?inline';
import './style.css';

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
    return (
      <host
        active={active}
        style={{
          backgroundColor: active ? 'gold' : null,
        }}
      >
        <shadow>
          <div>xx</div>
          <style>{style}</style>
          <button
            onClick={() => {
              console.log('click');
              this.updateContext({ active: !active, count: count + 1 });
            }}
            id="innerbutton"
          >
            clickme
          </button>
          <div>{count.toString()}</div>
          {
            active
              ? (
                <>
                  <div>
                    {content}
                  </div>
                  <div>
                    {content}
                  </div>
                </>
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
