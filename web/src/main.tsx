import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClientsPage } from "./components/Dashboard/ClientsPage";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClientsPage />
  </StrictMode>,
);
