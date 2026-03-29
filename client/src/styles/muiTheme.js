import { createTheme } from "@mui/material/styles"

const fontStack = '"Space Grotesk", ui-sans-serif, system-ui, sans-serif'

export const appTheme = createTheme({
  typography: {
    fontFamily: fontStack,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: fontStack,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        InputLabelProps: { required: false },
      },
    },
  },
})
