import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import 'bootstrap/dist/css/bootstrap.min.css';
// Font Awesome SVG icons are bundled with the app (no external CDN download).
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import './i18n';
import { useThemeStore } from './store/themeStore';
import { useLanguageStore } from './store/languageStore';

// We import the Font Awesome CSS above, so disable its runtime injection.
config.autoAddCss = false;

// Apply persisted theme & language to the document on first load.
document.documentElement.setAttribute('data-bs-theme', useThemeStore.getState().mode);
useLanguageStore.getState().setLanguage(useLanguageStore.getState().language);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
