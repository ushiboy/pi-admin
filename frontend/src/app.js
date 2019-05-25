/* @flow */
import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

const SystemControl = {
  async poweroff() {
    const res = await fetch('/api/poweroff', {
      method: 'POST'
    });
    if (res.status !== 200) {
      throw new Error('Fail PowerOff');
    }
  }
};

function PowerOffButton(props: { onClick: () => void }) {
  const { onClick } = props;
  return (
    <button type="button" className="btn btn-danger btn-lg" onClick={onClick}>
      <i className="fas fa-power-off" /> Power Off
    </button>
  );
}

function Main() {
  return (
    <div style={{ display: 'table', width: '320px', height: '240px' }}>
      <div
        style={{
          display: 'table-cell',
          textAlign: 'center',
          verticalAlign: 'middle'
        }}
      >
        <PowerOffButton
          onClick={() => {
            SystemControl.poweroff();
          }}
        />
      </div>
    </div>
  );
}

const el = document.querySelector('#app');
if (el) {
  ReactDOM.render(<Main />, el);
}
