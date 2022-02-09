/* eslint-disable no-unused-vars */
/** @jsx jsx */
/** @jsxFrag jsxFrag */
import {jsx, jsxFrag} from 'wc';

function Cuesco() {
  return (
    <div
      id="cuesco"
    >
      cuesco
    </div>
  );
}

function Bar() {
  return (
    <div
      id="bar"
    >
      {
        <>
          <Cuesco />
          <span>xx</span>
          <span>xx</span>
          <Cuesco />
          <Cuesco />
          <Cuesco />
        </>
      }
    </div>
  );
}

export default Bar;
