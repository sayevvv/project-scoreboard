// src/ui/main.tsx
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import DisplayPage from './components/DisplayPage.tsx';
import App from './App.tsx';
import './styles.css'; // atau path CSS global Anda

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(rootElement);

// LOG KRUSIAL #3 (Ini akan muncul di DevTools window yang relevan)
const currentPath = window.location.pathname;
const currentHash = window.location.hash;
const currentHref = window.location.href;
console.log(`[Renderer Main.tsx] Path: ${currentPath}, Hash: "${currentHash}", Href: ${currentHref} - Timestamp: ${new Date().toISOString()}`);

if (currentHash === '#display') {
  console.log(`[Renderer Main.tsx] Kondisi HASH MATCH (#display). Merender DisplayPage. - Timestamp: ${new Date().toISOString()}`);
  root.render(
    <StrictMode>
      <DisplayPage />
    </StrictMode>
  );
} else {
  console.log(`[Renderer Main.tsx] Kondisi HASH TIDAK MATCH. Merender App. Hash adalah: "${currentHash}" - Timestamp: ${new Date().toISOString()}`);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}