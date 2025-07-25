import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import settings from "../public/data/settings.json"; 
import { AuthProvider } from "./contexts/AuthContext";

document.title = settings.appName;

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);