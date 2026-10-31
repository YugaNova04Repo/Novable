import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Inline PWA Manifest & Service Worker Registration (NovaGen v0.0.4)
if (typeof window !== 'undefined') {
  const manifest = {
    name: "NovaGen: The Quantum & Cosmic Rule Engine",
    short_name: "NovaGen v0.0.4",
    start_url: ".",
    display: "standalone",
    background_color: "#07090E",
    theme_color: "#07090E",
    icons: [
      {
        src: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22%2300F0FF%22/><circle cx=%2250%22 cy=%2250%22 r=%2220%22 fill=%22%23EC4899%22/></svg>",
        sizes: "192x192",
        type: "image/svg+xml"
      }
    ]
  };
  const stringManifest = JSON.stringify(manifest);
  const blob = new Blob([stringManifest], { type: 'application/json' });
  const manifestURL = URL.createObjectURL(blob);
  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = manifestURL;
  document.head.appendChild(link);

  if ('serviceWorker' in navigator) {
    const swCode = `
      self.addEventListener('install', (e) => {
        e.waitUntil(caches.open('novagen-v004').then(cache => cache.addAll(['./', './index.html'])));
      });
      self.addEventListener('fetch', (e) => {
        e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
      });
    `;
    const swBlob = new Blob([swCode], { type: 'text/javascript' });
    const swURL = URL.createObjectURL(swBlob);
    navigator.serviceWorker.register(swURL).catch(() => {
      // SW fallback
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);
