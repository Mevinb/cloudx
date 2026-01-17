import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import logger from "./utils/logger";

logger.info('Main', 'Application starting');

const rootElement = document.getElementById("root");
if (!rootElement) {
  logger.error('Main', 'Root element not found!');
} else {
  logger.info('Main', 'Root element found, rendering App');
  createRoot(rootElement).render(<App />);
  logger.info('Main', 'App rendered');
}