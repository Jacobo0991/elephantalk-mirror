"use client";

import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { ToastContainer } from "react-toastify";

const theme = createTheme({
  palette: {
    primary: {
      main: "#25A2B5",
    },
    secondary: {
      main: "#25A2B5",
    },
  },
});

function MUIThemeProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      {children}
      <ToastContainer />
    </ThemeProvider>
  );
}

export default MUIThemeProvider;
