import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handler to suppress AbortError from Supabase
// This is expected during Supabase client initialization
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.name === 'AbortError' || 
      event.reason?.message?.includes('aborted') ||
      (typeof event.reason === 'string' && event.reason.includes('aborted'))) {
    // Suppress AbortError - it's expected in Supabase auth initialization
    event.preventDefault();
    return;
  }
});

// Also catch errors in the console
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out AbortError messages
  const message = args.join(' ');
  if (message.includes('AbortError') || message.includes('signal is aborted')) {
    return; // Suppress AbortError logs
  }
  originalConsoleError.apply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
