import React from 'react';
import getRouter from './router';
import './app.scss';

export default function App(props) {
  return (
    <div>
      {getRouter()}
    </div>
  );
}
