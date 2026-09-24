import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import appConfig from "../app.config.json";
import { WindowTitlebar } from "./components/WindowTitlebar";
import { setStarFields } from "./lib/stars";
import "./styles.css";

setStarFields();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WindowTitlebar appName={appConfig.name} />
    <App />
  </React.StrictMode>,
);
