import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure window.fetch has both getter and setter for iframe/runtime scripts
try {
  const current = window.fetch ? window.fetch.bind(window) : null;
  let _f = current;
  Object.defineProperty(window, 'fetch', {
    get() {
      return _f;
    },
    set(v) {
      _f = v;
    },
    configurable: true,
    enumerable: true,
  });
} catch (e) {
  // ignore
}

createRoot(document.getElementById('root')!).render(<App />);

