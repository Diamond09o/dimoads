import React from "react";
import ReactDOM from "react-dom/client";

import App from "./app/App";
import "./index.css";

import { AppStateProvider } from "./app/context/AppStateContext";
import { SearchFilterProvider } from "./features/search/context/SearchFilterContext";
import { AuthProvider } from "./features/auth/AuthProvider";
import { LanguageProvider } from "./providers/LanguageProvider";
import { ThemeProvider } from "./providers/ThemeProvider";


ReactDOM.createRoot(
  document.getElementById("root")!
).render(

  <React.StrictMode>

    <AuthProvider>

      <AppStateProvider>

        <SearchFilterProvider>

          <LanguageProvider>

            <ThemeProvider>

              <App />

            </ThemeProvider>

          </LanguageProvider>

        </SearchFilterProvider>

      </AppStateProvider>

    </AuthProvider>

  </React.StrictMode>

);