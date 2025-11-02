import React from "react";
import ReactDOM from "react-dom/client";
import App from "@app/App";
import "./index.css";
import "./setupConsoleFilters";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find root element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
